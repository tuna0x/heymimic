create table platform_provider_budget_purge_totals (
    budget_date date primary key,
    amount_micros bigint not null check (amount_micros >= 0),
    updated_at timestamptz not null
);