create table progress_projection_generations (
    id uuid primary key,
    status varchar(24) not null,
    rule_version varchar(32) not null,
    source_watermark timestamptz,
    source_rows bigint not null default 0,
    source_seconds bigint not null default 0,
    created_at timestamptz not null,
    activated_at timestamptz,
    constraint ck_progress_projection_generation_status
        check (status in ('BUILDING', 'ACTIVE', 'RETIRED', 'FAILED'))
);

insert into progress_projection_generations
    (id, status, rule_version, source_watermark, source_rows, source_seconds,
     created_at, activated_at)
select
    '00000000-0000-0000-0000-000000000001',
    'ACTIVE',
    'daily-v1',
    max(occurred_at),
    count(*),
    coalesce(sum(duration_seconds), 0),
    current_timestamp,
    current_timestamp
from progress_activity_ledger;

alter table progress_daily_activities
    add column generation_id uuid;

update progress_daily_activities
set generation_id = '00000000-0000-0000-0000-000000000001';

alter table progress_daily_activities
    alter column generation_id set not null,
    add constraint fk_progress_daily_generation
        foreign key (generation_id) references progress_projection_generations(id) on delete cascade,
    drop constraint progress_daily_activities_pkey,
    add primary key (generation_id, user_id, activity_date);

create table progress_projection_state (
    id smallint primary key,
    active_generation_id uuid not null
        references progress_projection_generations(id) on delete restrict,
    version bigint not null default 0,
    updated_at timestamptz not null,
    constraint ck_progress_projection_state_singleton check (id = 1)
);

insert into progress_projection_state (id, active_generation_id, version, updated_at)
values (1, '00000000-0000-0000-0000-000000000001', 0, current_timestamp);

create unique index uq_progress_projection_one_building
    on progress_projection_generations ((status))
    where status = 'BUILDING';

create index ix_progress_daily_generation_user_date
    on progress_daily_activities (generation_id, user_id, activity_date);
