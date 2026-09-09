# PostgreSQL restore drill

## Purpose

Prove that a HeyMimic PostgreSQL backup can be restored into an isolated database and that the
restored schema and audio metadata remain internally consistent. This drill produces evidence; it
does not by itself prove object-storage availability or provider-side deletion.

The initial design targets are RPO no greater than 24 hours and RTO no greater than four hours.
They remain targets until a production-like drill records backup age and measured recovery time.

## Safety boundary

- Run against an approved source or backup environment.
- The generated database name must start with `heymimic_restore_drill_`; the script refuses any
  other target name and never drops the source database.
- The restored database is retained by default. `-DropDatabaseAfter` only drops the validated
  generated drill database.
- Dump and manifest files may contain personal metadata. Store them encrypted with restricted
  access and remove them according to the backup-retention policy.
- Never copy a production dump to a developer workstation without explicit approval.

## Local Compose drill

Start PostgreSQL and ensure the application has created representative data:

```powershell
docker compose up -d postgres
cd backend
.\scripts\invoke-postgres-restore-drill.ps1
```

Artifacts are written below `backend/target/restore-drill/<run-id>/`:

- `database.dump`: custom-format backup with SHA-256 recorded in evidence.
- `audio-object-manifest.csv`: sealed object keys/versions/checksums for storage reconciliation.
- `restore-drill-evidence.json`: start/end time, duration, status, Flyway version and validation
  counts.

The drill fails if Flyway history is missing/failed, sealed `AVAILABLE` audio metadata is
incomplete, or an `AWAITING_UPLOAD` record incorrectly contains sealed metadata.

After inspection, a disposable run can clean up its newly generated database:

```powershell
.\scripts\invoke-postgres-restore-drill.ps1 -DropDatabaseAfter
```

To clean up a previously retained database, use the approved DBA workflow after independently
verifying its `heymimic_restore_drill_` name.

## Production-like evidence

Use the managed database service's point-in-time restore into a separate project/instance rather
than dumping the live primary when possible. Record:

1. backup/PITR timestamp and drill start timestamp to calculate observed RPO;
2. time until the database accepts connections and validations pass to calculate observed RTO;
3. restored Flyway version and application release identifier;
4. row counts for identities, sessions, attempts, ledgers and final deliveries;
5. reconciliation results for every `AVAILABLE` object key/version/checksum against object
   storage;
6. reviewer, ticket/change ID and cleanup confirmation.

Any missing object for an `AVAILABLE` row is a failed drill. An object retained for a `DELETED`
row is a storage-lifecycle/privacy incident. Do not declare the RPO/RTO target met until these checks
run in a production-like region with the real storage adapter.
