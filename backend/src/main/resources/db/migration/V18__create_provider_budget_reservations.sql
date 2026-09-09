create table platform_provider_budget_reservations (
    operation_id uuid not null,
    stage varchar(64) not null,
    execution_attempt integer not null check (execution_attempt > 0),
    resource_id uuid not null,
    user_id uuid not null,
    budget_date date not null,
    estimated_cost_micros bigint not null check (estimated_cost_micros >= 0),
    actual_cost_micros bigint check (actual_cost_micros is null or actual_cost_micros >= 0),
    rate_card_version varchar(100) not null,
    status varchar(32) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint pk_platform_provider_budget_reservations
        primary key (operation_id, stage, execution_attempt),
    constraint ck_platform_provider_budget_reservations_status
        check (status in ('RESERVED', 'RECONCILED', 'UNKNOWN', 'RELEASED'))
);

create index ix_platform_provider_budget_date_status
    on platform_provider_budget_reservations (budget_date, status);

create index ix_platform_provider_budget_user
    on platform_provider_budget_reservations (user_id, created_at);