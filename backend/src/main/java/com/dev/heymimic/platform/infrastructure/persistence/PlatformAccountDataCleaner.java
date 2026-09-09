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
        "delete from platform_jobs where owner_user_id = ? and id <> ?", userId, deletionJobId);
    jdbc.update(
        "update platform_jobs set owner_user_id = null, payload = '{}'::jsonb where id = ?",
        deletionJobId);
  }
}
