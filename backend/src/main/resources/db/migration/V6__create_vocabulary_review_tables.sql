create table vocabulary_review_sessions (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    status varchar(32) not null,
    timezone_snapshot varchar(64) not null,
    scheduler_version varchar(32) not null,
    current_index integer not null default 0,
    version bigint not null default 0,
    started_at timestamptz not null,
    completed_at timestamptz,
    last_activity_at timestamptz not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_vocabulary_review_session_status
        check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    constraint ck_vocabulary_review_current_index check (current_index >= 0)
);

create unique index uq_vocabulary_active_review_session
    on vocabulary_review_sessions (user_id) where status = 'IN_PROGRESS';

create table vocabulary_review_items (
    id uuid primary key,
    session_id uuid not null references vocabulary_review_sessions(id) on delete cascade,
    word_id uuid not null references vocabulary_words(id) on delete restrict,
    position integer not null,
    active_rating_event_id uuid,
    presented_at timestamptz,
    constraint uq_vocabulary_review_item_position unique (session_id, position),
    constraint uq_vocabulary_review_item_word unique (session_id, word_id),
    constraint uq_vocabulary_review_item_identity unique (id, session_id, word_id),
    constraint ck_vocabulary_review_item_position check (position >= 0)
);

create index ix_vocabulary_review_items_session
    on vocabulary_review_items (session_id, position);

create table vocabulary_review_events (
    id uuid primary key,
    session_id uuid not null references vocabulary_review_sessions(id) on delete cascade,
    item_id uuid not null,
    word_id uuid not null,
    rating varchar(32) not null,
    before_state jsonb not null,
    after_state jsonb not null,
    duration_seconds integer not null,
    reviewed_at timestamptz not null,
    undone_at timestamptz,
    constraint fk_vocabulary_review_event_item
        foreign key (item_id, session_id, word_id)
        references vocabulary_review_items(id, session_id, word_id) on delete restrict,
    constraint ck_vocabulary_review_rating check (rating in ('REMEMBERED', 'NEEDS_REVIEW')),
    constraint ck_vocabulary_review_duration check (duration_seconds between 0 and 3600)
);

create index ix_vocabulary_review_events_session
    on vocabulary_review_events (session_id, reviewed_at, id);

alter table vocabulary_review_items
    add constraint fk_vocabulary_review_item_active_event
    foreign key (active_rating_event_id)
    references vocabulary_review_events(id) on delete restrict;

alter table vocabulary_words
    add constraint fk_vocabulary_word_review_lock
    foreign key (review_lock_session_id)
    references vocabulary_review_sessions(id) on delete restrict;
