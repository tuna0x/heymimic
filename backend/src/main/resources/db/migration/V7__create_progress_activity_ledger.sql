create table progress_activity_ledger (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    event_id uuid not null,
    source_type varchar(32) not null,
    source_id uuid not null,
    activity_date date not null,
    timezone_snapshot varchar(64) not null,
    duration_seconds integer not null check (duration_seconds >= 0),
    rule_version varchar(32) not null,
    occurred_at timestamptz not null,
    created_at timestamptz not null,
    constraint uq_progress_ledger_event unique (event_id),
    constraint uq_progress_ledger_source unique (source_type, source_id),
    constraint ck_progress_ledger_source_type check (source_type in ('VOCABULARY_REVIEW', 'SPEAKING_SESSION'))
);

create index ix_progress_ledger_user_date
    on progress_activity_ledger (user_id, activity_date);
