package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PlatformAccountDataCleaner implements AccountDataCleaner {
  private final JdbcTemplate jdbc;

  public PlatformAccountDataCleaner(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public String cleanerName() {
    return "platform";
  }

  @Override
  public int order() {
    return 100;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    Integer runningJobs =
        jdbc.queryForObject(
            """
            select count(*) from platform_jobs
            where owner_user_id = ? and id <> ? and status = 'RUNNING'
            """,
            Integer.class,
            userId,
            deletionJobId);
    if (runningJobs != null && runningJobs > 0) {
      throw new IllegalStateException("Account still has running jobs");
    }

    jdbc.update("delete from platform_outbox_events where owner_user_id = ?", userId);
    jdbc.update("delete from platform_idempotency_records where user_id = ?", userId);
    jdbc.update("delete from platform_quota_reservations where user_id = ?", userId);
    jdbc.update(
        """
        insert into platform_provider_budget_purge_totals (budget_date, amount_micros, updated_at)
        select budget_date,
               coalesce(sum(
                 case
                   when status = 'RECONCILED' then coalesce(actual_cost_micros, estimated_cost_micros)
                   when status in ('RESERVED', 'UNKNOWN') then estimated_cost_micros
                   else 0
                 end), 0),
               now()
        from platform_provider_budget_reservations
        where user_id = ? and status <> 'RELEASED'
        group by budget_date
        on conflict (budget_date) do update
          set amount_micros = platform_provider_budget_purge_totals.amount_micros
                            + excluded.amount_micros,
              updated_at = excluded.updated_at
        """,
        userId);
    jdbc.update("delete from platform_provider_usage where user_id = ?", userId);
    jdbc.update("delete from platform_provider_budget_reservations where user_id = ?", userId);
    jdbc.update(
        "delete from platform_jobs where owner_user_id = ? and id <> ?", userId, deletionJobId);
    jdbc.update(
        "update platform_jobs set owner_user_id = null, payload = '{}'::jsonb where id = ?",
        deletionJobId);
  }
}
