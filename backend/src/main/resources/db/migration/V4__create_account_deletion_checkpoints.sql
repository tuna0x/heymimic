create table identity_deletion_tombstones (
    user_id uuid primary key,
    deletion_job_id uuid not null unique,
    requested_at timestamptz not null,
    completed_at timestamptz
);

create table identity_deletion_steps (
    user_id uuid not null,
    step varchar(100) not null,
    completed_at timestamptz not null,
    primary key (user_id, step)
);

create index ix_identity_deletion_tombstones_completed
    on identity_deletion_tombstones (completed_at);
