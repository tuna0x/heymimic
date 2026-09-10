package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.study.application.port.DailyPlanRecord;
import com.dev.heymimic.study.application.port.DailyPlanRefreshCandidate;
import com.dev.heymimic.study.application.port.DailyPlanStepRecord;
import com.dev.heymimic.study.application.port.DailyPlanStore;
import com.dev.heymimic.study.application.port.PlanningStateRecord;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDailyPlanStore implements DailyPlanStore {
  private final JdbcTemplate jdbc;

  public JdbcDailyPlanStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public PlanningStateRecord upsertState(
      UUID userId, long inputVersion, int goalMinutes, UUID sourceBriefId, Instant now) {
    return jdbc.queryForObject(
        """
        insert into study_planning_state
          (user_id, input_version, settings_version, goal_minutes, source_brief_id, dirty_since, updated_at)
        values (?, ?, 0, ?, ?, ?, ?)
        on conflict (user_id) do update set
          input_version = excluded.input_version,
          settings_version = case
            when study_planning_state.goal_minutes <> excluded.goal_minutes
              or study_planning_state.source_brief_id is distinct from excluded.source_brief_id
            then study_planning_state.settings_version + 1
            else study_planning_state.settings_version
          end,
          goal_minutes = excluded.goal_minutes,
          source_brief_id = excluded.source_brief_id,
          dirty_since = coalesce(study_planning_state.dirty_since, excluded.dirty_since),
          updated_at = excluded.updated_at
        returning user_id, input_version, settings_version, goal_minutes, source_brief_id,
                  dirty_since, updated_at
        """,
        (result, row) ->
            new PlanningStateRecord(
                result.getObject("user_id", UUID.class),
                result.getLong("input_version"),
                result.getLong("settings_version"),
                result.getInt("goal_minutes"),
                result.getObject("source_brief_id", UUID.class),
                result.getTimestamp("dirty_since") == null
                    ? null
                    : result.getTimestamp("dirty_since").toInstant(),
                result.getTimestamp("updated_at").toInstant()),
        userId,
        inputVersion,
        goalMinutes,
        sourceBriefId,
        Timestamp.from(now),
        Timestamp.from(now));
  }

  @Override
  public UUID beginRequest(UUID userId, long inputVersion, Instant now) {
    jdbc.update(
        """
        update study_plan_requests set state = 'SUPERSEDED', updated_at = ?
        where user_id = ? and state in ('PENDING', 'RUNNING')
        """,
        Timestamp.from(now),
        userId);
    UUID requestId = UUID.randomUUID();
    jdbc.update(
        """
        insert into study_plan_requests
          (id, user_id, requested_input_version, state, first_dirty_at, not_before, created_at, updated_at)
        values (?, ?, ?, 'RUNNING', ?, ?, ?, ?)
        """,
        requestId,
        userId,
        inputVersion,
        Timestamp.from(now),
        Timestamp.from(now),
        Timestamp.from(now),
        Timestamp.from(now));
    return requestId;
  }

  @Override
  public List<DailyPlanRefreshCandidate> findRefreshCandidates(Instant now, int limit) {
    if (limit < 1 || limit > 500) throw new IllegalArgumentException("Invalid planner batch size");
    return jdbc.query(
        """
        select plan.user_id, plan.id as plan_id, context.revision as context_revision,
               plan.goal_minutes, state.source_brief_id, plan.valid_until
        from study_daily_plans plan
        join platform_user_context_versions context
          on context.user_id = plan.user_id and context.context_key = 'learning'
        left join study_planning_state state on state.user_id = plan.user_id
        where plan.is_current and plan.state = 'READY'
          and context.ready_checkpoint_revision >= context.revision
          and (plan.input_version < context.revision or plan.valid_until <= ?)
        order by plan.valid_until, plan.user_id
        limit ?
        """,
        (result, row) ->
            new DailyPlanRefreshCandidate(
                result.getObject("user_id", UUID.class),
                result.getObject("plan_id", UUID.class),
                result.getLong("context_revision"),
                result.getInt("goal_minutes"),
                result.getObject("source_brief_id", UUID.class),
                result.getTimestamp("valid_until").toInstant()),
        Timestamp.from(now),
        limit);
  }

  @Override
  public boolean createRefreshRequest(
      UUID requestId,
      UUID userId,
      long requestedInputVersion,
      Instant firstDirtyAt,
      Instant notBefore) {
    try {
      return jdbc.update(
              """
              insert into study_plan_requests
                (id, user_id, requested_input_version, state, first_dirty_at, not_before,
                 created_at, updated_at)
              values (?, ?, ?, 'PENDING', ?, ?, ?, ?)
              """,
              requestId,
              userId,
              requestedInputVersion,
              Timestamp.from(firstDirtyAt),
              Timestamp.from(notBefore),
              Timestamp.from(firstDirtyAt),
              Timestamp.from(firstDirtyAt))
          == 1;
    } catch (DuplicateKeyException duplicate) {
      return false;
    }
  }

  @Override
  public boolean attachRefreshJob(UUID requestId, UUID jobId) {
    return jdbc.update(
            "update study_plan_requests set job_id = ?, updated_at = now() where id = ? and state = 'PENDING'",
            jobId,
            requestId)
        == 1;
  }

  @Override
  public boolean claimRefreshRequest(UUID requestId, UUID userId) {
    return jdbc.update(
            "update study_plan_requests set state = 'RUNNING', updated_at = now() where id = ? and user_id = ? and state = 'PENDING'",
            requestId,
            userId)
        == 1;
  }

  @Override
  public void finishRequest(UUID requestId, String state, String errorCode, Instant now) {
    jdbc.update(
        "update study_plan_requests set state = ?, error_code = ?, updated_at = ? where id = ?",
        state,
        errorCode,
        Timestamp.from(now),
        requestId);
  }

  @Override
  public long nextPlanVersion(UUID userId, LocalDate localDate, String timezoneSnapshot) {
    Long max =
        jdbc.queryForObject(
            """
            select coalesce(max(plan_version), 0) + 1
            from study_daily_plans
            where user_id = ? and local_date = ? and timezone_snapshot = ?
            """,
            Long.class,
            userId,
            localDate,
            timezoneSnapshot);
    return max == null ? 1 : max;
  }

  @Override
  public void insertPlan(DailyPlanRecord plan, List<DailyPlanStepRecord> steps, Instant now) {
    jdbc.update(
        """
        update study_daily_plans
        set is_current = false, updated_at = ?
        where user_id = ? and local_date = ? and timezone_snapshot = ? and is_current
        """,
        Timestamp.from(now),
        plan.userId(),
        plan.localDate(),
        plan.timezoneSnapshot());
    jdbc.update(
        """
        insert into study_daily_plans
          (id, user_id, local_date, timezone_snapshot, goal_minutes, plan_version, state,
           input_version, settings_version, valid_until, catalog_version, input_snapshot,
           recommendation_reasons, planner_version, is_current, created_at, updated_at)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, cast(? as jsonb), cast(? as jsonb), ?, true, ?, ?)
        """,
        plan.id(),
        plan.userId(),
        plan.localDate(),
        plan.timezoneSnapshot(),
        plan.goalMinutes(),
        plan.planVersion(),
        plan.state(),
        plan.inputVersion(),
        plan.settingsVersion(),
        Timestamp.from(plan.validUntil()),
        plan.catalogVersion(),
        plan.inputSnapshotJson(),
        plan.recommendationReasonsJson(),
        plan.plannerVersion(),
        Timestamp.from(now),
        Timestamp.from(now));
    for (DailyPlanStepRecord step : steps) {
      jdbc.update(
          """
          insert into study_daily_plan_steps
            (id, plan_id, position, kind, practice_mode, target_refs, estimated_seconds,
             preparation_status, brief_id)
          values (?, ?, ?, ?, ?, cast(? as jsonb), ?, ?, ?)
          """,
          step.id(),
          plan.id(),
          step.position(),
          step.kind(),
          step.practiceMode(),
          step.targetRefsJson(),
          step.estimatedSeconds(),
          step.preparationStatus(),
          step.briefId());
    }
  }

  @Override
  public Optional<DailyPlanRecord> findCurrent(
      UUID userId, LocalDate localDate, String timezoneSnapshot) {
    return jdbc
        .query(
            """
            select id, user_id, local_date, timezone_snapshot, goal_minutes, plan_version, state,
                   input_version, settings_version, valid_until, catalog_version, planner_version,
                   input_snapshot::text as input_snapshot, recommendation_reasons::text as reasons
            from study_daily_plans
            where user_id = ? and local_date = ? and timezone_snapshot = ? and is_current
            """,
            (result, row) ->
                new DailyPlanRecord(
                    result.getObject("id", UUID.class),
                    result.getObject("user_id", UUID.class),
                    result.getObject("local_date", LocalDate.class),
                    result.getString("timezone_snapshot"),
                    result.getInt("goal_minutes"),
                    result.getLong("plan_version"),
                    result.getString("state"),
                    result.getLong("input_version"),
                    result.getLong("settings_version"),
                    result.getTimestamp("valid_until").toInstant(),
                    result.getString("catalog_version"),
                    result.getString("planner_version"),
                    result.getString("input_snapshot"),
                    result.getString("reasons"),
                    steps(result.getObject("id", UUID.class))),
            userId,
            localDate,
            timezoneSnapshot)
        .stream()
        .findFirst();
  }

  private List<DailyPlanStepRecord> steps(UUID planId) {
    return jdbc.query(
        """
        select id, position, kind, practice_mode, target_refs::text as target_refs,
               estimated_seconds, preparation_status, brief_id
        from study_daily_plan_steps where plan_id = ? order by position
        """,
        (result, row) ->
            new DailyPlanStepRecord(
                result.getObject("id", UUID.class),
                result.getInt("position"),
                result.getString("kind"),
                result.getString("practice_mode"),
                result.getString("target_refs"),
                result.getInt("estimated_seconds"),
                result.getString("preparation_status"),
                result.getObject("brief_id", UUID.class)),
        planId);
  }
}
