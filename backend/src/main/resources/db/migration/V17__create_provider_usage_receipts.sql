create table platform_provider_usage (
    operation_id uuid not null,
    resource_id uuid not null,
    user_id uuid not null,
    operation varchar(100) not null,
    stage varchar(64) not null,
    execution_attempt integer not null check (execution_attempt > 0),
    provider varchar(100),
    model varchar(200),
    status varchar(32) not null,
    provider_request_id varchar(200),
    input_tokens bigint,
    output_tokens bigint,
    audio_milliseconds bigint,
    characters bigint,
    error_code varchar(100),
    recorded_at timestamptz not null,
    constraint pk_platform_provider_usage primary key (operation_id, stage, execution_attempt),
    constraint ck_platform_provider_usage_status check (status in ('SUCCEEDED', 'FAILED', 'UNKNOWN')),
    constraint ck_platform_provider_usage_metrics check (
        (input_tokens is null or input_tokens >= 0)
        and (output_tokens is null or output_tokens >= 0)
        and (audio_milliseconds is null or audio_milliseconds >= 0)
        and (characters is null or characters >= 0)
    )
);

create index ix_platform_provider_usage_user_recorded
    on platform_provider_usage (user_id, recorded_at);

create index ix_platform_provider_usage_resource
    on platform_provider_usage (resource_id, operation, stage);
