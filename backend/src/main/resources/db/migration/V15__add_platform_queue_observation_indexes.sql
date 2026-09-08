create index ix_platform_jobs_expired_lease
    on platform_jobs (lease_until)
    where status = 'RUNNING';

create index ix_platform_deliveries_expired_lease
    on platform_event_deliveries (lease_until)
    where status = 'RUNNING';
