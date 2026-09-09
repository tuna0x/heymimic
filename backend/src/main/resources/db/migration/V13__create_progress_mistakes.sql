create table progress_mistake_patterns (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    category varchar(32) not null,
    pattern_key varchar(160) not null,
    taxonomy_version varchar(32) not null,
    title varchar(200) not null,
    explanation varchar(2000) not null,
    status varchar(32) not null,
    version bigint not null default 0,
    first_seen_at timestamptz not null,
    last_seen_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_progress_mistake_pattern
        unique (user_id, category, pattern_key, taxonomy_version),
    constraint ck_progress_mistake_category
        check (category in ('GRAMMAR', 'VOCABULARY', 'EXPRESSION')),
    constraint ck_progress_mistake_status
        check (status in ('ACTIVE', 'RESOLVED', 'IGNORED'))
);

create table progress_mistake_occurrences (
    id uuid primary key,
    pattern_id uuid not null references progress_mistake_patterns(id) on delete cascade,
    evaluation_id uuid not null,
    feedback_item_id uuid not null unique,
    original_text varchar(2000),
    suggested_text varchar(2000),
    occurred_at timestamptz not null,
    created_at timestamptz not null
);

create index ix_progress_mistake_user_status_last_seen
    on progress_mistake_patterns (user_id, status, last_seen_at desc);

create index ix_progress_occurrence_pattern_occurred
    on progress_mistake_occurrences (pattern_id, occurred_at desc);
