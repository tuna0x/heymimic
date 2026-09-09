package com.dev.heymimic.platform.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.port.DeliveryReplayAudit;
import com.dev.heymimic.platform.application.port.DeliveryReplayCandidate;
import com.dev.heymimic.platform.application.port.DeliveryReplayStore;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayCommand;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayOutcome;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class PlatformEventDeliveryReplayServiceTest {
  private static final Instant NOW = Instant.parse("2026-09-09T08:00:00Z");
  private static final UUID DELIVERY_ID = UUID.randomUUID();
  private static final UUID EVENT_ID = UUID.randomUUID();

  private final DeliveryReplayStore store = mock(DeliveryReplayStore.class);
  private final PlatformEventDeliveryReplayService service =
      new PlatformEventDeliveryReplayService(store, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void dryRunAuditsEligibilityWithoutChangingDelivery() {
    when(store.lockDelivery(DELIVERY_ID)).thenReturn(Optional.of(finalDelivery()));

    var result =
        service.replay(
            new DeliveryReplayCommand(
                DELIVERY_ID, "ops@example.com", "Verify replay after consumer fix", true));

    assertThat(result.outcome()).isEqualTo(DeliveryReplayOutcome.DRY_RUN_ALLOWED);
    assertThat(result.eligible()).isTrue();
    assertThat(result.requeued()).isFalse();
    verify(store, never()).requeueFinalDelivery(any(), any());
    var audit = captureAudit();
    assertThat(audit.previousStatus()).isEqualTo("FAILED_FINAL");
    assertThat(audit.previousAttempts()).isEqualTo(5);
    assertThat(audit.previousErrorCode()).isEqualTo("PROJECTION_FAILED");
    assertThat(audit.dryRun()).isTrue();
    assertThat(audit.outcome()).isEqualTo(DeliveryReplayOutcome.DRY_RUN_ALLOWED);
  }

  @Test
  void requeuesFinalDeliveryAndAuditsOriginalFailure() {
    when(store.lockDelivery(DELIVERY_ID)).thenReturn(Optional.of(finalDelivery()));
    when(store.requeueFinalDelivery(DELIVERY_ID, NOW)).thenReturn(true);
    var command =
        new DeliveryReplayCommand(
            DELIVERY_ID, "ops@example.com", "Consumer deployment has been repaired", false);

    var result = service.replay(command);

    assertThat(result.outcome()).isEqualTo(DeliveryReplayOutcome.REQUEUED);
    assertThat(result.requeued()).isTrue();
    var ordered = inOrder(store);
    ordered.verify(store).lockDelivery(DELIVERY_ID);
    ordered.verify(store).requeueFinalDelivery(DELIVERY_ID, NOW);
    ordered.verify(store).appendAudit(any());
    var audit = captureAudit();
    assertThat(audit.eventId()).isEqualTo(EVENT_ID);
    assertThat(audit.operatorIdentity()).isEqualTo("ops@example.com");
    assertThat(audit.outcome()).isEqualTo(DeliveryReplayOutcome.REQUEUED);
    assertThat(audit.requestedAt()).isEqualTo(NOW);
  }

  @Test
  void auditsMissingAndNonFinalTargetsWithoutRequeue() {
    when(store.lockDelivery(DELIVERY_ID))
        .thenReturn(Optional.empty())
        .thenReturn(
            Optional.of(
                new DeliveryReplayCandidate(
                    DELIVERY_ID,
                    EVENT_ID,
                    "progress-speaking-v1",
                    DeliveryStatus.RUNNING,
                    1,
                    null)));
    var command =
        new DeliveryReplayCommand(
            DELIVERY_ID, "ops@example.com", "Investigate delivery before replay", true);

    var missing = service.replay(command);
    var running = service.replay(command);

    assertThat(missing.outcome()).isEqualTo(DeliveryReplayOutcome.NOT_FOUND);
    assertThat(running.outcome()).isEqualTo(DeliveryReplayOutcome.REJECTED_STATUS);
    assertThat(running.previousStatus()).isEqualTo("RUNNING");
    verify(store, never()).requeueFinalDelivery(any(), any());
    verify(store, org.mockito.Mockito.times(2)).appendAudit(any());
  }

  @Test
  void commandNormalizesRequiredOperatorAndReason() {
    var command =
        new DeliveryReplayCommand(
            DELIVERY_ID, "  ops@example.com  ", "  Fixed deterministic consumer defect  ", true);

    assertThat(command.operatorIdentity()).isEqualTo("ops@example.com");
    assertThat(command.reason()).isEqualTo("Fixed deterministic consumer defect");
  }

  private DeliveryReplayCandidate finalDelivery() {
    return new DeliveryReplayCandidate(
        DELIVERY_ID,
        EVENT_ID,
        "progress-speaking-v1",
        DeliveryStatus.FAILED_FINAL,
        5,
        "PROJECTION_FAILED");
  }

  private DeliveryReplayAudit captureAudit() {
    var captor = ArgumentCaptor.forClass(DeliveryReplayAudit.class);
    verify(store).appendAudit(captor.capture());
    return captor.getValue();
  }
}
