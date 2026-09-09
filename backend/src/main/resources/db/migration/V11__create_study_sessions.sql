create table study_sessions (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    status varchar(32) not null,
    timezone_snapshot varchar(64) not null,
    current_step integer not null default 0 check (current_step >= 0),
    version bigint not null default 0,
    started_at timestamptz not null,
    completed_at timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_study_session_status
        check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))
);

create unique index uq_study_sessions_active_user
    on study_sessions (user_id) where status = 'IN_PROGRESS';
create index ix_study_sessions_user_started
    on study_sessions (user_id, started_at desc, id desc);

create table study_steps (
    id uuid primary key,
    study_session_id uuid not null references study_sessions(id) on delete cascade,
    position integer not null check (position >= 0),
    kind varchar(32) not null,
    review_session_id uuid references vocabulary_review_sessions(id) on delete restrict,
    speaking_session_id uuid references speaking_sessions(id) on delete restrict,
    created_at timestamptz not null,
    constraint uq_study_step_position unique (study_session_id, position),
    constraint uq_study_step_review unique (review_session_id),
    constraint uq_study_step_speaking unique (speaking_session_id),
    constraint ck_study_step_kind
        check (kind in ('VOCABULARY', 'SPEAKING')),
    constraint ck_study_step_child
        check (
            (kind = 'VOCABULARY' and review_session_id is not null and speaking_session_id is null)
            or
            (kind = 'SPEAKING' and review_session_id is null and speaking_session_id is not null)
        )
);

create index ix_study_steps_session on study_steps (study_session_id, position);
