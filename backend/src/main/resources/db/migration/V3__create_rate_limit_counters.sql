create table platform_rate_limit_counters (
    scope varchar(100) not null,
    subject_hash varchar(64) not null,
    window_start timestamptz not null,
    window_end timestamptz not null,
    attempts integer not null check (attempts > 0),
    primary key (scope, subject_hash, window_start)
);

create index ix_platform_rate_limits_expiry on platform_rate_limit_counters (window_end);
