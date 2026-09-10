package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcBrokerDispatchStore {
  private final JdbcTemplate jdbc;
  private final JdbcJobStore jobs;
  private final JdbcOutboxStore events;

  public JdbcBrokerDispatchStore(JdbcTemplate jdbc, JdbcJobStore jobs, JdbcOutboxStore events) {
    this.jdbc = jdbc;
    this.jobs = jobs;
    this.events = events;
  }

  public record Dispatch(UUID id, long generation, String routingKey, UUID token) {}

  @Transactional
  public Optional<Dispatch> claimPublish() {
    return jdbc
        .query(
            """
   with candidate as (select id from platform_broker_dispatches
     where status in ('PENDING','PUBLISHING','PUBLISHED') and available_at<=clock_timestamp()
     order by available_at,id for update skip locked limit 1)
   update platform_broker_dispatches d set status='PUBLISHING',publish_token=gen_random_uuid(),
     publish_attempts=publish_attempts+1,available_at=clock_timestamp()+interval '30 seconds',updated_at=clock_timestamp()
   from candidate where d.id=candidate.id returning d.*
   """,
            (r, n) ->
                new Dispatch(
                    r.getObject("id", UUID.class),
                    r.getLong("generation"),
                    r.getString("routing_key"),
                    r.getObject("publish_token", UUID.class)))
        .stream()
        .findFirst();
  }

  @Transactional
  public boolean published(Dispatch d) {
    return finishPublish(d, "PUBLISHED", 60);
  }

  @Transactional
  public boolean publishFailed(Dispatch d) {
    return finishPublish(d, "PENDING", 5);
  }

  private boolean finishPublish(Dispatch d, String status, int delay) {
    return jdbc.update(
            """
   update platform_broker_dispatches set status=?,publish_token=null,
     available_at=clock_timestamp()+(? * interval '1 second'),updated_at=clock_timestamp()
   where id=? and generation=? and publish_token=? and status='PUBLISHING'
   """,
            status,
            delay,
            d.id(),
            d.generation(),
            d.token())
        == 1;
  }

  @Transactional
  public Optional<ClaimedJob> claimJob(
      UUID dispatchId, long generation, String route, String worker, Duration lease) {
    return jdbc
        .query(
            """
   with candidate as (
    select j.id from platform_jobs j where j.status in ('PENDING','FAILED_RETRYABLE')
     and j.next_attempt_at<=clock_timestamp() and exists (
      select 1 from platform_broker_dispatches d where d.job_id=j.id and d.id=? and d.generation=?
       and d.routing_key=? and d.status in ('PENDING','PUBLISHING','PUBLISHED'))
    for update skip locked limit 1)
   update platform_jobs j set status='RUNNING',attempts=attempts+1,lease_owner=?,
    lease_generation=lease_generation+1,lease_until=clock_timestamp()+(? * interval '1 millisecond'),updated_at=clock_timestamp()
   from candidate where j.id=candidate.id returning j.*
   """,
            jobs::mapClaimedJob,
            dispatchId,
            generation,
            route,
            worker,
            lease.toMillis())
        .stream()
        .findFirst();
  }

  @Transactional
  public Optional<PublishedEvent> claimEvent(
      UUID dispatchId, long generation, String route, String worker, Duration lease) {
    return jdbc
        .query(
            """
   with candidate as (
    select e.id from platform_event_deliveries e where e.status in ('PENDING','FAILED_RETRYABLE')
     and e.next_attempt_at<=clock_timestamp() and exists (
      select 1 from platform_broker_dispatches d where d.delivery_id=e.id and d.id=? and d.generation=?
       and d.routing_key=? and d.status in ('PENDING','PUBLISHING','PUBLISHED'))
    for update skip locked limit 1), claimed as (
   update platform_event_deliveries e set status='RUNNING',attempts=attempts+1,lease_owner=?,
    lease_generation=lease_generation+1,lease_until=clock_timestamp()+(? * interval '1 millisecond'),updated_at=clock_timestamp()
   from candidate where e.id=candidate.id returning e.*)
   select claimed.id as delivery_id,claimed.consumer_name,claimed.attempts,claimed.lease_generation,
     claimed.lease_until,event.* from claimed join platform_outbox_events event on event.id=claimed.event_id
   """,
            events::mapPublishedEvent,
            dispatchId,
            generation,
            route,
            worker,
            lease.toMillis())
        .stream()
        .findFirst();
  }

  @Transactional
  public int recoverExpired() {
    int count =
        jdbc.update(
            """
   with expired as (select id from platform_jobs where status='RUNNING' and lease_until<clock_timestamp()
    order by lease_until for update skip locked limit 100)
   update platform_jobs j set status='FAILED_RETRYABLE',next_attempt_at=clock_timestamp(),
     lease_owner=null,lease_until=null,updated_at=clock_timestamp()
   from expired where j.id=expired.id
   """);
    return count
        + jdbc.update(
            """
   with expired as (select id from platform_event_deliveries where status='RUNNING' and lease_until<clock_timestamp()
    order by lease_until for update skip locked limit 100)
   update platform_event_deliveries e set status='FAILED_RETRYABLE',next_attempt_at=clock_timestamp(),
     lease_owner=null,lease_until=null,updated_at=clock_timestamp()
   from expired where e.id=expired.id
   """);
  }
}
