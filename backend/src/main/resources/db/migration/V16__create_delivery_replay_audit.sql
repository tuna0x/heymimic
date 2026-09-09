create table platform_delivery_replay_audit (
    id uuid primary key,
    delivery_id uuid not null,
    event_id uuid,
    consumer_name varchar(150),
    previous_status varchar(32),
    previous_attempts integer,
    previous_error_code varchar(100),
    operator_identity varchar(200) not null,
    reason varchar(1000) not null,
    dry_run boolean not null,
    outcome varchar(32) not null,
    requested_at timestamptz not null,
    constraint ck_delivery_replay_outcome check (
        outcome in ('NOT_FOUND', 'REJECTED_STATUS', 'DRY_RUN_ALLOWED', 'REQUEUED')
    )
);

create index ix_delivery_replay_audit_target
    on platform_delivery_replay_audit (delivery_id, requested_at desc);
