create table identity_users (
    id uuid primary key,
    email_normalized varchar(320) not null,
    password_hash varchar(255) not null,
    status varchar(32) not null,
    verified_at timestamptz,
    auth_version bigint not null default 0,
    deletion_requested_at timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_identity_users_email unique (email_normalized),
    constraint ck_identity_users_status check (status in ('ACTIVE', 'DELETING'))
);

create table learner_profiles (
    user_id uuid primary key references identity_users(id) on delete restrict,
    name varchar(100) not null,
    target_language varchar(16) not null default 'en',
    goal varchar(50),
    self_assessed_level varchar(20),
    daily_minutes_goal integer,
    timezone varchar(64) not null,
    onboarding_completed_at timestamptz,
    version bigint not null default 0,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint ck_learner_daily_goal check (daily_minutes_goal is null or daily_minutes_goal in (5, 10, 15))
);

create table identity_session_families (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null
);
create index ix_identity_families_user on identity_session_families (user_id);
create index ix_identity_families_expiry on identity_session_families (expires_at);

create table identity_refresh_tokens (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    family_id uuid not null references identity_session_families(id) on delete cascade,
    token_hash varchar(64) not null,
    parent_id uuid references identity_refresh_tokens(id) on delete restrict,
    expires_at timestamptz not null,
    consumed_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz not null,
    constraint uq_identity_refresh_hash unique (token_hash)
);
create index ix_identity_refresh_family on identity_refresh_tokens (family_id);
create index ix_identity_refresh_expiry on identity_refresh_tokens (expires_at);

create table identity_email_tokens (
    id uuid primary key,
    user_id uuid not null references identity_users(id) on delete restrict,
    purpose varchar(32) not null,
    token_hash varchar(64) not null,
    expires_at timestamptz not null,
    consumed_at timestamptz,
    created_at timestamptz not null,
    constraint uq_identity_email_token_hash unique (token_hash),
    constraint ck_identity_email_token_purpose check (purpose in ('VERIFY', 'RESET'))
);
create index ix_identity_email_tokens_user_purpose
    on identity_email_tokens (user_id, purpose, expires_at);
