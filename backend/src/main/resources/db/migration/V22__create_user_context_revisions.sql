create table platform_user_context_versions (
    user_id uuid not null references identity_users(id) on delete cascade,
    context_key varchar(80) not null,
    revision bigint not null default 0 check (revision >= 0),
    ready_checkpoint_revision bigint not null default 0,
    updated_at timestamptz not null,
    primary key (user_id, context_key),
    check (ready_checkpoint_revision between 0 and revision)
);

create table platform_user_context_changes (
    id uuid primary key,
    user_id uuid not null,
    context_key varchar(80) not null,
    revision bigint not null check (revision > 0),
    cause_event_id uuid not null references platform_outbox_events(id) on delete restrict,
    created_at timestamptz not null,
    foreign key (user_id, context_key)
        references platform_user_context_versions(user_id, context_key) on delete cascade,
    unique (user_id, context_key, revision),
    unique (user_id, context_key, cause_event_id)
);

create table platform_context_change_deliveries (
    change_id uuid not null references platform_user_context_changes(id) on delete cascade,
    delivery_id uuid not null references platform_event_deliveries(id) on delete restrict,
    primary key (change_id, delivery_id)
);

create table platform_context_change_receipts (
    user_id uuid not null references identity_users(id) on delete cascade,
    context_key varchar(80) not null,
    cause_event_id uuid not null references platform_outbox_events(id) on delete restrict,
    revision bigint not null check (revision > 0),
    recorded_at timestamptz not null,
    primary key (user_id, context_key, cause_event_id)
);

create index ix_platform_context_changes_ready
    on platform_user_context_changes (user_id, context_key, revision);
