create table vocabulary_words (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    target_language varchar(16) not null,
    normalized_word varchar(200) not null,
    sense_key varchar(64) not null,
    word varchar(200) not null,
    meaning varchar(1000) not null,
    pronunciation varchar(200),
    part_of_speech varchar(50),
    example varchar(2000),
    translation varchar(2000),
    source_context varchar(4000),
    mastery integer not null default 0,
    status varchar(32) not null default 'NEW',
    interval_days integer not null default 0,
    next_review_at timestamptz not null,
    review_lock_session_id uuid,
    version bigint not null default 0,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_vocabulary_word_sense
        unique (user_id, target_language, normalized_word, sense_key),
    constraint ck_vocabulary_mastery check (mastery between 0 and 100),
    constraint ck_vocabulary_interval check (interval_days between 0 and 30),
    constraint ck_vocabulary_status check (status in ('NEW', 'REVIEWING', 'MASTERED'))
);

create index ix_vocabulary_words_user_created
    on vocabulary_words (user_id, created_at desc, id desc);
create index ix_vocabulary_words_due
    on vocabulary_words (user_id, status, next_review_at, id);

create table vocabulary_context_analyses (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    input_hash varchar(64) not null,
    input_text varchar(10000) not null,
    target_language varchar(16) not null,
    status varchar(32) not null,
    result jsonb,
    job_id uuid not null unique,
    quota_reservation_id uuid not null unique,
    error_code varchar(100),
    expires_at timestamptz not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_vocabulary_analysis_status
        check (status in ('PENDING', 'COMPLETED', 'FAILED'))
);

create index ix_vocabulary_analyses_user_expiry
    on vocabulary_context_analyses (user_id, expires_at);
