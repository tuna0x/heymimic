package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import com.dev.heymimic.study.application.port.StudySessionStore;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class StudyAccountDataCleaner implements AccountDataCleaner {
  private final StudySessionStore sessions;
  private final JdbcTemplate jdbc;

  public StudyAccountDataCleaner(StudySessionStore sessions) {
    this(sessions, null);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public StudyAccountDataCleaner(StudySessionStore sessions, JdbcTemplate jdbc) {
    this.sessions = sessions;
    this.jdbc = jdbc;
  }

  @Override
  public String cleanerName() {
    return "study";
  }

  @Override
  public int order() {
    return 275;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    sessions.deleteByUserId(userId);
    if (jdbc != null) {
      jdbc.update(
          "delete from study_daily_plan_steps where plan_id in (select id from study_daily_plans where user_id = ?)",
          userId);
      jdbc.update("delete from study_daily_plans where user_id = ?", userId);
      jdbc.update("delete from study_plan_requests where user_id = ?", userId);
      jdbc.update("delete from study_planning_state where user_id = ?", userId);
    }
  }
}
