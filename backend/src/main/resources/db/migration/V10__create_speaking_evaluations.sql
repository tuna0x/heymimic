create table speaking_evaluations (
    id uuid primary key,
    attempt_id uuid not null unique references speaking_attempts(id) on delete restrict,
    user_id uuid not null references identity_users(id) on delete restrict,
    status varchar(32) not null,
    stage varchar(32) not null,
    transcript text,
    result jsonb,
    source varchar(32),
    job_id uuid not null unique,
    quota_reservation_id uuid not null unique,
    error_code varchar(100),
    retryable boolean not null default true,
    provider_invoked boolean not null default false,
    version bigint not null default 0,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_speaking_evaluation_status
        check (status in ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED')),
    constraint ck_speaking_evaluation_stage
        check (stage in ('QUEUED', 'TRANSCRIBING', 'FEEDBACK', 'COMPLETED', 'FAILED')),
    constraint ck_speaking_evaluation_source
        check (source is null or source in ('fake', 'provider'))
);

create index ix_speaking_evaluations_user_created
    on speaking_evaluations (user_id, created_at desc, id desc);

create table speaking_feedback_items (
    id uuid primary key,
    evaluation_id uuid not null references speaking_evaluations(id) on delete restrict,
    position integer not null check (position >= 0),
    category varchar(32) not null,
    original_text varchar(2000),
    improved_text varchar(2000),
    note varchar(2000) not null,
    pattern_key varchar(100),
    created_at timestamptz not null,
    constraint uq_speaking_feedback_position unique (evaluation_id, position),
    constraint ck_speaking_feedback_category
        check (category in ('GRAMMAR', 'VOCABULARY', 'EXPRESSION'))
);

create index ix_speaking_feedback_evaluation
    on speaking_feedback_items (evaluation_id, position);
