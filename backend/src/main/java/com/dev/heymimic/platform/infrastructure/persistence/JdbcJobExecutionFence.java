package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import com.dev.heymimic.platform.application.publicapi.JobLeaseLostException;
import java.util.function.Supplier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JdbcJobExecutionFence implements JobExecutionFence {
  private final JdbcTemplate jdbc;

  public JdbcJobExecutionFence(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  @Transactional
  public <T> T execute(ClaimedJob job, Supplier<T> work) {
    var lease = job.executionLease();
    var locked =
        jdbc.queryForList(
            """
    select id from platform_jobs
    where id = ? and lease_owner = ? and lease_generation = ?
      and status = 'RUNNING' and lease_until >= clock_timestamp()
      and resource_id = ? and type = ?
          and (owner_user_id is not distinct from ? or (type = 'DELETE_ACCOUNT' and owner_user_id is null))
    for update
    """,
            lease.jobId(),
            lease.workerId(),
            lease.generation(),
            job.resourceId(),
            job.type(),
            job.ownerUserId());
    if (locked.isEmpty()) throw new JobLeaseLostException();
    T result = work.get();
    Boolean valid =
        jdbc.queryForObject(
            """
    select status = 'RUNNING' and lease_owner = ? and lease_generation = ?
      and lease_until >= clock_timestamp() from platform_jobs where id = ?
    """,
            Boolean.class,
            lease.workerId(),
            lease.generation(),
            lease.jobId());
    if (!Boolean.TRUE.equals(valid)) throw new JobLeaseLostException();
    return result;
  }
}
