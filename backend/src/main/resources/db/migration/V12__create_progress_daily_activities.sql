create table progress_daily_activities (
    user_id uuid not null references identity_users(id) on delete restrict,
    activity_date date not null,
    vocab_seconds integer not null default 0 check (vocab_seconds >= 0),
    speaking_seconds integer not null default 0 check (speaking_seconds >= 0),
    qualifies_for_streak boolean not null default false,
    timezone_snapshot varchar(64) not null,
    projected_through timestamptz not null,
    updated_at timestamptz not null,
    primary key (user_id, activity_date)
);

create index ix_progress_daily_user_date_desc
    on progress_daily_activities (user_id, activity_date desc);
