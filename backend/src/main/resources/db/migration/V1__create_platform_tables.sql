create table platform_jobs (
    id uuid primary key, owner_user_id uuid, type varchar(100) not null,
    resource_id uuid not null, status varchar(32) not null,
    payload_version integer not null, payload jsonb not null, checkpoint jsonb,
    attempts integer not null default 0, next_attempt_at timestamptz not null,
    lease_until timestamptz, lease_owner varchar(200),
    lease_generation bigint not null default 0, last_error_code varchar(100),
    created_at timestamptz not null, updated_at timestamptz not null,
    constraint uq_platform_jobs_type_resource unique (type, resource_id)
);
create index ix_platform_jobs_due on platform_jobs (status, next_attempt_at);

create table platform_outbox_events (
    id uuid primary key, owner_user_id uuid, event_type varchar(150) not null,
    schema_version integer not null, aggregate_id uuid not null,
    occurred_at timestamptz not null, payload jsonb not null
);
create index ix_platform_outbox_occurred on platform_outbox_events (occurred_at);

create table platform_event_deliveries (
    id uuid primary key,
    event_id uuid not null references platform_outbox_events(id) on delete cascade,
    consumer_name varchar(150) not null, status varchar(32) not null,
    attempts integer not null default 0, next_attempt_at timestamptz not null,
    lease_until timestamptz, lease_owner varchar(200),
    lease_generation bigint not null default 0, last_error_code varchar(100),
    created_at timestamptz not null, updated_at timestamptz not null,
    constraint uq_platform_delivery_event_consumer unique (event_id, consumer_name)
);
create index ix_platform_deliveries_due on platform_event_deliveries (status, next_attempt_at);

create table platform_idempotency_records (
    id uuid primary key, user_id uuid not null, operation varchar(150) not null,
    idempotency_key uuid not null, request_hash varchar(64) not null,
    response_status integer, response_body jsonb,
    expires_at timestamptz not null, created_at timestamptz not null,
    constraint uq_platform_idempotency unique (user_id, operation, idempotency_key)
);
create index ix_platform_idempotency_expiry on platform_idempotency_records (expires_at);

create table platform_quota_reservations (
    id uuid primary key, user_id uuid not null, resource_id uuid not null,
    quota_kind varchar(100) not null, amount integer not null check (amount > 0),
    status varchar(32) not null, quota_date date not null,
    created_at timestamptz not null, updated_at timestamptz not null,
    constraint uq_platform_quota_resource unique (resource_id, quota_kind)
);
