create table study_planning_state (
    user_id uuid primary key references identity_users(id) on delete restrict,
    input_version bigint not null default 0 check (input_version >= 0),
    settings_version bigint not null default 0 check (settings_version >= 0),
    goal_minutes integer not null check (goal_minutes in (5, 10, 15)),
    source_brief_id uuid,
    dirty_since timestamptz,
    updated_at timestamptz not null
);

create table study_plan_requests (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    requested_input_version bigint not null check (requested_input_version >= 0),
    state varchar(24) not null,
    job_id uuid references platform_jobs(id) on delete set null,
    first_dirty_at timestamptz not null,
    not_before timestamptz not null,
    error_code varchar(100),
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_study_plan_request_state check (state in ('PENDING', 'RUNNING', 'COMPLETED', 'SUPERSEDED', 'FAILED'))
);
create unique index uq_study_plan_requests_active
    on study_plan_requests(user_id) where state in ('PENDING', 'RUNNING');
create index ix_study_plan_requests_due on study_plan_requests(state, not_before, id);

create table study_daily_plans (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    local_date date not null,
    timezone_snapshot varchar(64) not null,
    goal_minutes integer not null check (goal_minutes in (5, 10, 15)),
    plan_version bigint not null check (plan_version > 0),
    state varchar(24) not null,
    input_version bigint not null check (input_version >= 0),
    settings_version bigint not null check (settings_version >= 0),
    valid_until timestamptz not null,
    catalog_version varchar(80) not null,
    input_snapshot jsonb not null,
    recommendation_reasons jsonb not null,
    planner_version varchar(80) not null,
    is_current boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_study_daily_plan_version unique (user_id, local_date, timezone_snapshot, plan_version),
    constraint ck_study_daily_plan_state check (state in ('READY', 'STARTED', 'COMPLETED', 'EXPIRED'))
);
create unique index uq_study_daily_plan_current
    on study_daily_plans(user_id, local_date, timezone_snapshot) where is_current;
create index ix_study_daily_plans_today on study_daily_plans(user_id, local_date, timezone_snapshot, is_current);

create table study_daily_plan_steps (
    id uuid primary key,
    plan_id uuid not null references study_daily_plans(id) on delete cascade,
    position integer not null check (position >= 0),
    kind varchar(24) not null,
    practice_mode varchar(80) not null,
    target_refs jsonb not null,
    estimated_seconds integer not null check (estimated_seconds > 0),
    preparation_status varchar(24) not null,
    brief_id uuid,
    constraint uq_study_daily_plan_step_position unique (plan_id, position),
    constraint ck_study_daily_plan_step_kind check (kind in ('VOCABULARY', 'SPEAKING')),
    constraint ck_study_daily_plan_step_status check (preparation_status in ('READY', 'PENDING', 'BLOCKED'))
);
create index ix_study_daily_plan_steps_plan on study_daily_plan_steps(plan_id, position);