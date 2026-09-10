-- Transport metadata contains references only. PostgreSQL remains the lifecycle authority.
create table platform_broker_dispatches (
  id uuid primary key default gen_random_uuid(),
  job_id uuid unique references platform_jobs(id) on delete cascade,
  delivery_id uuid unique references platform_event_deliveries(id) on delete cascade,
  generation bigint not null default 1 check (generation > 0),
  routing_key varchar(80) not null,
  status varchar(20) not null check (status in ('PENDING','PUBLISHING','PUBLISHED','OBSOLETE','QUARANTINED')),
  available_at timestamptz not null,
  publish_token uuid,
  publish_attempts integer not null default 0,
  updated_at timestamptz not null default clock_timestamp(),
  check (num_nonnulls(job_id, delivery_id) = 1)
);
create index platform_dispatch_due_idx on platform_broker_dispatches(available_at, id)
  where status in ('PENDING','PUBLISHING','PUBLISHED');

-- Centralize the invariant here so replay, recovery and every existing store mutation
-- schedule/obsolete a dispatch in the SAME transaction, including older application replicas.
create function platform_sync_job_dispatch() returns trigger language plpgsql as $$
begin
  if new.status in ('PENDING','FAILED_RETRYABLE') then
    if TG_OP = 'UPDATE' then
      if old.status = new.status and old.next_attempt_at = new.next_attempt_at then return new; end if;
    end if;
    insert into platform_broker_dispatches(job_id,routing_key,status,available_at)
      values(new.id, case new.type
        when 'SPEAKING_EVALUATION' then 'jobs.speaking'
        when 'VOCABULARY_CONTEXT_ANALYSIS' then 'jobs.context'
        when 'BUILD_DAILY_PLAN' then 'jobs.planning'
        when 'SEND_VERIFICATION_EMAIL' then 'jobs.email'
        when 'SEND_PASSWORD_RESET_EMAIL' then 'jobs.email'
        else 'jobs.maintenance' end, 'PENDING',new.next_attempt_at)
      on conflict(job_id) do update set generation=platform_broker_dispatches.generation+1,
        status='PENDING', available_at=excluded.available_at, publish_token=null,
        publish_attempts=0,updated_at=clock_timestamp();
  else
    update platform_broker_dispatches set status='OBSOLETE',publish_token=null,
      updated_at=clock_timestamp() where job_id=new.id;
  end if;
  return new;
end $$;
create trigger platform_job_dispatch after insert or update of status,next_attempt_at
  on platform_jobs for each row execute function platform_sync_job_dispatch();

create function platform_sync_delivery_dispatch() returns trigger language plpgsql as $$
begin
  if new.status in ('PENDING','FAILED_RETRYABLE') then
    if TG_OP = 'UPDATE' then
      if old.status = new.status and old.next_attempt_at = new.next_attempt_at then return new; end if;
    end if;
    insert into platform_broker_dispatches(delivery_id,routing_key,status,available_at)
      values(new.id,'events.projections','PENDING',new.next_attempt_at)
      on conflict(delivery_id) do update set generation=platform_broker_dispatches.generation+1,
        status='PENDING',available_at=excluded.available_at,publish_token=null,
        publish_attempts=0,updated_at=clock_timestamp();
  else
    update platform_broker_dispatches set status='OBSOLETE',publish_token=null,
      updated_at=clock_timestamp() where delivery_id=new.id;
  end if;
  return new;
end $$;
create trigger platform_delivery_dispatch after insert or update of status,next_attempt_at
  on platform_event_deliveries for each row execute function platform_sync_delivery_dispatch();

insert into platform_broker_dispatches(job_id,routing_key,status,available_at)
select id,case type when 'SPEAKING_EVALUATION' then 'jobs.speaking'
  when 'VOCABULARY_CONTEXT_ANALYSIS' then 'jobs.context'
  when 'BUILD_DAILY_PLAN' then 'jobs.planning'
  when 'SEND_VERIFICATION_EMAIL' then 'jobs.email'
  when 'SEND_PASSWORD_RESET_EMAIL' then 'jobs.email' else 'jobs.maintenance' end,
  'PENDING',next_attempt_at from platform_jobs where status in ('PENDING','FAILED_RETRYABLE');
insert into platform_broker_dispatches(delivery_id,routing_key,status,available_at)
select id,'events.projections','PENDING',next_attempt_at from platform_event_deliveries
  where status in ('PENDING','FAILED_RETRYABLE');
