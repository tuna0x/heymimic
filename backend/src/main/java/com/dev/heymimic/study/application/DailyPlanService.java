package com.dev.heymimic.study.application;

import com.dev.heymimic.learner.application.publicapi.LearnerProfileView;
import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.UserContextChanges;
import com.dev.heymimic.platform.application.publicapi.UserContextReadiness;
import com.dev.heymimic.platform.application.publicapi.UserContextRevision;
import com.dev.heymimic.platform.application.publicapi.UserContextRevisions;
import com.dev.heymimic.progress.application.publicapi.MistakeQueries;
import com.dev.heymimic.speaking.application.publicapi.PracticeLevelResolver;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.study.application.port.DailyPlanRecord;
import com.dev.heymimic.study.application.port.DailyPlanStepRecord;
import com.dev.heymimic.study.application.port.DailyPlanStore;
import com.dev.heymimic.study.application.port.PlanningStateRecord;
import com.dev.heymimic.study.application.publicapi.CreatedDailyPlan;
import com.dev.heymimic.study.application.publicapi.DailyPlanEnvelope;
import com.dev.heymimic.study.application.publicapi.DailyPlanReason;
import com.dev.heymimic.study.application.publicapi.DailyPlanRefreshWorkflow;
import com.dev.heymimic.study.application.publicapi.DailyPlanRequests;
import com.dev.heymimic.study.application.publicapi.DailyPlanStepView;
import com.dev.heymimic.study.application.publicapi.DailyPlanView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWords;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class DailyPlanService implements DailyPlanRequests, DailyPlanRefreshWorkflow {
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private static final Duration POLICY_TTL = Duration.ofMinutes(15);
  private static final String CATALOG_VERSION = "speaking-catalog-v1";
  private static final String PLANNER_VERSION = "daily-plan-policy-v1";
  private final DailyPlanStore plans;
  private final LearnerProfiles profiles;
  private final VocabularyWords words;
  private final MistakeQueries mistakes;
  private final SpeakingPractice speaking;
  private final UserContextRevisions contexts;
  private final IdempotencyExecutor idempotency;
  private final Clock clock;
  private final ObjectMapper objectMapper;

  public DailyPlanService(
      DailyPlanStore plans,
      LearnerProfiles profiles,
      VocabularyWords words,
      MistakeQueries mistakes,
      SpeakingPractice speaking,
      @org.springframework.beans.factory.annotation.Qualifier("platformUserContextService")
          UserContextRevisions contexts,
      IdempotencyExecutor idempotency,
      Clock clock,
      ObjectMapper objectMapper) {
    this.plans = plans;
    this.profiles = profiles;
    this.words = words;
    this.mistakes = mistakes;
    this.speaking = speaking;
    this.contexts = contexts;
    this.idempotency = idempotency;
    this.clock = clock;
    this.objectMapper = objectMapper;
  }

  @Override
  @Transactional
  public CreatedDailyPlan compose(
      UUID userId, UUID idempotencyKey, Integer requestedGoalMinutes, UUID sourceBriefId) {
    LearnerProfileView profile = profiles.get(userId);
    int goalMinutes = requestedGoalMinutes == null ? defaultGoal(profile) : requestedGoalMinutes;
    validateGoal(goalMinutes);
    validateSourceBrief(sourceBriefId);
    String canonical = goalMinutes + "|" + (sourceBriefId == null ? "" : sourceBriefId);
    IdempotentResponse response =
        idempotency.execute(
            new IdempotencyCommand(
                userId, "study.daily-plan.compose", idempotencyKey, canonical, IDEMPOTENCY_TTL),
            () -> composeFresh(userId, profile, goalMinutes, null, null));
    return new CreatedDailyPlan(
        read(response.bodyJson(), DailyPlanView.class), response.replayed());
  }

  @Override
  @Transactional
  public void refresh(UUID requestId, UUID userId, int goalMinutes, UUID sourceBriefId) {
    validateGoal(goalMinutes);
    validateSourceBrief(sourceBriefId);
    if (!plans.claimRefreshRequest(requestId, userId)) return;
    LearnerProfileView profile = profiles.get(userId);
    composeFresh(userId, profile, goalMinutes, sourceBriefId, requestId);
  }

  @Override
  @Transactional
  public void fail(UUID requestId, String errorCode) {
    plans.finishRequest(requestId, "FAILED", errorCode, clock.instant());
  }

  private IdempotentResponse composeFresh(
      UUID userId,
      LearnerProfileView profile,
      int goalMinutes,
      UUID sourceBriefId,
      UUID existingRequestId) {
    Instant now = clock.instant();
    ZoneId zone = zone(profile.timezone());
    LocalDate localDate = LocalDate.now(clock.withZone(zone));
    UserContextRevision revision =
        contexts
            .get(userId, UserContextChanges.LEARNING_CONTEXT)
            .orElse(
                new UserContextRevision(userId, UserContextChanges.LEARNING_CONTEXT, 0, 0, now));
    UserContextReadiness readiness =
        contexts.readiness(userId, UserContextChanges.LEARNING_CONTEXT, revision.revision());
    if (!readiness.isReady(revision.revision())) {
      String code = readiness.blocked() ? "LEARNING_CONTEXT_BLOCKED" : "LEARNING_CONTEXT_UPDATING";
      throw new com.dev.heymimic.shared.error.ApiException(
          HttpStatus.CONFLICT, code, "Learning context is not ready for a daily plan");
    }
    PlanningStateRecord state =
        plans.upsertState(userId, revision.revision(), goalMinutes, sourceBriefId, now);
    UUID requestId =
        existingRequestId == null
            ? plans.beginRequest(userId, revision.revision(), now)
            : existingRequestId;
    var overdue = words.find(userId, null, now, 0, 100).items();
    var activeMistakes = mistakes.find(userId, "ACTIVE", null, 0, 50).items();
    var topics =
        speaking.topics(null, PracticeLevelResolver.topicLevel(profile.selfAssessedLevel()));
    List<DailyPlanPolicyV1.PlanDraft> drafts =
        DailyPlanPolicyV1.compose(goalMinutes, overdue, activeMistakes, topics);
    Instant validUntil =
        min(
            now.plus(POLICY_TTL),
            ZonedDateTime.of(localDate.plusDays(1), java.time.LocalTime.MIDNIGHT, zone)
                .toInstant());
    long planVersion = plans.nextPlanVersion(userId, localDate, profile.timezone());
    UUID planId = UUID.randomUUID();
    List<DailyPlanStepRecord> steps =
        drafts.stream()
            .map(
                (draft) ->
                    new DailyPlanStepRecord(
                        UUID.randomUUID(),
                        drafts.indexOf(draft),
                        draft.kind(),
                        draft.practiceMode(),
                        write(draft.targetRefs()),
                        draft.estimatedSeconds(),
                        "READY",
                        null))
            .toList();
    List<DailyPlanReason> reasons =
        drafts.stream()
            .map(
                draft ->
                    new DailyPlanReason(
                        draft.reason().code(),
                        draft.reason().params(),
                        draft.reason().evidenceRefs()))
            .toList();
    String inputSnapshot =
        write(
            Map.of(
                "inputVersion", revision.revision(),
                "profileVersion", profile.version(),
                "settingsVersion", state.settingsVersion(),
                "localDate", localDate.toString(),
                "timezone", profile.timezone(),
                "catalogVersion", CATALOG_VERSION));
    DailyPlanRecord record =
        new DailyPlanRecord(
            planId,
            userId,
            localDate,
            profile.timezone(),
            goalMinutes,
            planVersion,
            "READY",
            revision.revision(),
            state.settingsVersion(),
            validUntil,
            CATALOG_VERSION,
            PLANNER_VERSION,
            inputSnapshot,
            write(reasons),
            steps);
    UserContextRevision latest =
        contexts
            .get(userId, UserContextChanges.LEARNING_CONTEXT)
            .orElse(
                new UserContextRevision(userId, UserContextChanges.LEARNING_CONTEXT, 0, 0, now));
    UserContextReadiness latestReadiness =
        contexts.readiness(userId, UserContextChanges.LEARNING_CONTEXT, latest.revision());
    if (latest.revision() != revision.revision()) {
      throw new com.dev.heymimic.shared.error.ApiException(
          HttpStatus.CONFLICT,
          "LEARNING_CONTEXT_CHANGED",
          "Learning context changed while composing the daily plan");
    }
    if (!latestReadiness.isReady(latest.revision())) {
      String code =
          latestReadiness.blocked() ? "LEARNING_CONTEXT_BLOCKED" : "LEARNING_CONTEXT_UPDATING";
      throw new com.dev.heymimic.shared.error.ApiException(
          HttpStatus.CONFLICT, code, "Learning context is not ready for a daily plan");
    }
    plans.insertPlan(record, steps, now);
    plans.finishRequest(requestId, "COMPLETED", null, now);
    return IdempotentResponse.fresh(HttpStatus.CREATED.value(), write(view(record)));
  }

  @Override
  @Transactional(readOnly = true)
  public DailyPlanEnvelope today(UUID userId) {
    LearnerProfileView profile = profiles.get(userId);
    ZoneId zone = zone(profile.timezone());
    LocalDate date = LocalDate.now(clock.withZone(zone));
    DailyPlanRecord plan = plans.findCurrent(userId, date, profile.timezone()).orElse(null);
    if (plan == null) return new DailyPlanEnvelope(null, "IDLE", 0);
    UserContextRevision currentRevision =
        contexts
            .get(userId, UserContextChanges.LEARNING_CONTEXT)
            .orElse(
                new UserContextRevision(
                    userId, UserContextChanges.LEARNING_CONTEXT, 0, 0, clock.instant()));
    UserContextReadiness readiness =
        contexts.readiness(userId, UserContextChanges.LEARNING_CONTEXT, currentRevision.revision());
    if (readiness.blocked()) {
      return new DailyPlanEnvelope(view(plan), "BLOCKED", 60);
    }
    if (plan.inputVersion() < currentRevision.revision()
        || !plan.validUntil().isAfter(clock.instant())) {
      return new DailyPlanEnvelope(view(plan), "UPDATING", 2);
    }
    return new DailyPlanEnvelope(view(plan), "IDLE", 0);
  }

  private DailyPlanView view(DailyPlanRecord record) {
    List<DailyPlanReason> reasons =
        read(record.recommendationReasonsJson(), new TypeReference<List<DailyPlanReason>>() {});
    List<DailyPlanStepView> steps =
        record.steps().stream()
            .map(
                step ->
                    new DailyPlanStepView(
                        step.id(),
                        step.position(),
                        step.kind(),
                        step.practiceMode(),
                        read(step.targetRefsJson(), new TypeReference<List<UUID>>() {}),
                        step.estimatedSeconds(),
                        step.preparationStatus(),
                        step.briefId()))
            .toList();
    return new DailyPlanView(
        record.id(),
        record.userId(),
        record.localDate(),
        record.timezoneSnapshot(),
        record.goalMinutes(),
        record.planVersion(),
        record.state(),
        record.inputVersion(),
        record.settingsVersion(),
        record.validUntil(),
        record.catalogVersion(),
        record.plannerVersion(),
        reasons,
        steps);
  }

  private int defaultGoal(LearnerProfileView profile) {
    return profile.dailyMinutesGoal() == null ? 5 : profile.dailyMinutesGoal();
  }

  private void validateSourceBrief(UUID sourceBriefId) {
    if (sourceBriefId != null) {
      throw new com.dev.heymimic.shared.error.ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "SOURCE_BRIEF_UNSUPPORTED",
          "Targeted source briefs are not available in rule-only planner v1");
    }
  }

  private void validateGoal(int goalMinutes) {
    if (goalMinutes != 5 && goalMinutes != 10 && goalMinutes != 15) {
      throw new com.dev.heymimic.shared.error.ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_DAILY_PLAN_GOAL", "Goal must be 5, 10 or 15 minutes");
    }
  }

  private ZoneId zone(String timezone) {
    try {
      return ZoneId.of(timezone);
    } catch (RuntimeException exception) {
      throw new com.dev.heymimic.shared.error.ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "INVALID_PROFILE_TIMEZONE",
          "Profile timezone is invalid");
    }
  }

  private Instant min(Instant first, Instant second) {
    return first.isBefore(second) ? first : second;
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize daily plan", exception);
    }
  }

  private <T> T read(String value, TypeReference<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize daily plan", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize daily plan", exception);
    }
  }
}
