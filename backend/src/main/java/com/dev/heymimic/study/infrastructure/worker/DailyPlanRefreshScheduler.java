package com.dev.heymimic.study.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.study.application.port.DailyPlanRefreshCandidate;
import com.dev.heymimic.study.application.port.DailyPlanStore;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
@EnableConfigurationProperties(DailyPlanRefreshScheduler.Properties.class)
@ConditionalOnProperty(prefix = "heymimic.study.planner", name = "enabled", havingValue = "true")
public class DailyPlanRefreshScheduler {
  private static final Duration DEBOUNCE = Duration.ofSeconds(3);
  private final DailyPlanStore plans;
  private final JobQueue jobs;
  private final Clock clock;
  private final ObjectMapper json;
  private final Properties properties;

  public DailyPlanRefreshScheduler(
      DailyPlanStore plans, JobQueue jobs, Clock clock, ObjectMapper json, Properties properties) {
    this.plans = plans;
    this.jobs = jobs;
    this.clock = clock;
    this.json = json;
    this.properties = properties;
  }

  @Scheduled(fixedDelayString = "${heymimic.study.planner.interval:1s}")
  @Transactional
  public void poll() {
    Instant now = clock.instant();
    List<DailyPlanRefreshCandidate> candidates =
        plans.findRefreshCandidates(now, properties.batchSize());
    for (DailyPlanRefreshCandidate candidate : candidates) {
      UUID requestId = UUID.randomUUID();
      Instant notBefore = now.plus(DEBOUNCE);
      if (!plans.createRefreshRequest(
          requestId, candidate.userId(), candidate.contextRevision(), now, notBefore)) {
        continue;
      }
      UUID jobId =
          jobs.enqueue(
              new EnqueueJob(
                  candidate.userId(),
                  DailyPlanJobHandler.JOB_TYPE,
                  requestId,
                  1,
                  payload(
                      new DailyPlanJobHandler.RefreshPayload(
                          requestId,
                          candidate.userId(),
                          candidate.goalMinutes(),
                          candidate.sourceBriefId())),
                  notBefore));
      if (!plans.attachRefreshJob(requestId, jobId)) {
        throw new IllegalStateException("Planner request was not attachable after enqueue");
      }
    }
  }

  private String payload(DailyPlanJobHandler.RefreshPayload value) {
    try {
      return json.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize planner job payload", exception);
    }
  }

  @org.springframework.boot.context.properties.ConfigurationProperties("heymimic.study.planner")
  public record Properties(boolean enabled, Duration interval, int batchSize) {
    public Properties {
      if (interval == null || interval.isNegative() || interval.isZero() || batchSize < 1) {
        throw new IllegalArgumentException("Invalid planner scheduler settings");
      }
    }
  }
}
