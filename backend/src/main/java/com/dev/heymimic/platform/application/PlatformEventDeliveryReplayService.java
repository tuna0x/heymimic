package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.port.DeliveryReplayAudit;
import com.dev.heymimic.platform.application.port.DeliveryReplayCandidate;
import com.dev.heymimic.platform.application.port.DeliveryReplayStore;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayCommand;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayOutcome;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayResult;
import com.dev.heymimic.platform.application.publicapi.EventDeliveryReplay;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformEventDeliveryReplayService implements EventDeliveryReplay {
  private static final Logger log =
      LoggerFactory.getLogger(PlatformEventDeliveryReplayService.class);

  private final DeliveryReplayStore store;
  private final Clock clock;

  public PlatformEventDeliveryReplayService(DeliveryReplayStore store, Clock clock) {
    this.store = store;
    this.clock = clock;
  }

  @Override
  @Transactional
  public DeliveryReplayResult replay(DeliveryReplayCommand command) {
    UUID auditId = UUID.randomUUID();
    Instant now = clock.instant();
    var candidate = store.lockDelivery(command.deliveryId());
    if (candidate.isEmpty()) {
      appendAudit(auditId, command, null, DeliveryReplayOutcome.NOT_FOUND, now);
      return result(auditId, command.deliveryId(), DeliveryReplayOutcome.NOT_FOUND, null);
    }

    var delivery = candidate.orElseThrow();
    if (delivery.status() != DeliveryStatus.FAILED_FINAL) {
      appendAudit(auditId, command, delivery, DeliveryReplayOutcome.REJECTED_STATUS, now);
      return result(auditId, command.deliveryId(), DeliveryReplayOutcome.REJECTED_STATUS, delivery);
    }
    if (command.dryRun()) {
      appendAudit(auditId, command, delivery, DeliveryReplayOutcome.DRY_RUN_ALLOWED, now);
      return result(auditId, command.deliveryId(), DeliveryReplayOutcome.DRY_RUN_ALLOWED, delivery);
    }

    if (!store.requeueFinalDelivery(command.deliveryId(), now)) {
      throw new IllegalStateException("Final delivery changed while locked for replay");
    }
    appendAudit(auditId, command, delivery, DeliveryReplayOutcome.REQUEUED, now);
    log.info(
        "Requeued final event delivery: auditId={}, deliveryId={}, operator={}",
        auditId,
        command.deliveryId(),
        command.operatorIdentity());
    return result(auditId, command.deliveryId(), DeliveryReplayOutcome.REQUEUED, delivery);
  }

  private void appendAudit(
      UUID auditId,
      DeliveryReplayCommand command,
      DeliveryReplayCandidate candidate,
      DeliveryReplayOutcome outcome,
      Instant now) {
    store.appendAudit(
        new DeliveryReplayAudit(
            auditId,
            command.deliveryId(),
            candidate == null ? null : candidate.eventId(),
            candidate == null ? null : candidate.consumerName(),
            candidate == null ? null : candidate.status().name(),
            candidate == null ? null : candidate.attempts(),
            candidate == null ? null : candidate.lastErrorCode(),
            command.operatorIdentity(),
            command.reason(),
            command.dryRun(),
            outcome,
            now));
  }

  private DeliveryReplayResult result(
      UUID auditId,
      UUID deliveryId,
      DeliveryReplayOutcome outcome,
      DeliveryReplayCandidate candidate) {
    boolean eligible = candidate != null && candidate.status() == DeliveryStatus.FAILED_FINAL;
    return new DeliveryReplayResult(
        auditId,
        deliveryId,
        outcome,
        candidate == null ? null : candidate.status().name(),
        eligible,
        outcome == DeliveryReplayOutcome.REQUEUED);
  }
}
