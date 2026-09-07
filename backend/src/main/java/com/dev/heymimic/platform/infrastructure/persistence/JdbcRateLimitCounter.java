package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.RateLimitCounter;
import com.dev.heymimic.platform.application.publicapi.RateLimitDecision;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcRateLimitCounter implements RateLimitCounter {
  private final JdbcTemplate jdbc;

  public JdbcRateLimitCounter(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public RateLimitDecision check(
      String scope, String subjectHash, int limit, Duration window, Instant now) {
    Instant start = windowStart(now, window);
    Integer attempts =
        jdbc.query(
            "select attempts from platform_rate_limit_counters where scope = ? and subject_hash = ? and window_start = ?",
            result -> result.next() ? result.getInt("attempts") : null,
            scope,
            subjectHash,
            Timestamp.from(start));
    return decision(attempts == null ? 0 : attempts, limit, start.plus(window), now);
  }

  @Override
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public RateLimitDecision increment(
      String scope, String subjectHash, int limit, Duration window, Instant now) {
    Instant start = windowStart(now, window);
    Instant end = start.plus(window);
    Integer attempts =
        jdbc.queryForObject(
            """
            insert into platform_rate_limit_counters
              (scope, subject_hash, window_start, window_end, attempts)
            values (?, ?, ?, ?, 1)
            on conflict (scope, subject_hash, window_start)
            do update set attempts = platform_rate_limit_counters.attempts + 1
            returning attempts
            """,
            Integer.class,
            scope,
            subjectHash,
            Timestamp.from(start),
            Timestamp.from(end));
    return decision(attempts, limit, end, now);
  }

  private Instant windowStart(Instant now, Duration window) {
    long seconds = window.toSeconds();
    return Instant.ofEpochSecond(Math.floorDiv(now.getEpochSecond(), seconds) * seconds);
  }

  private RateLimitDecision decision(int attempts, int limit, Instant end, Instant now) {
    if (attempts <= limit) return RateLimitDecision.permitted();
    return new RateLimitDecision(
        false, (int) Math.max(1, end.getEpochSecond() - now.getEpochSecond()));
  }
}
