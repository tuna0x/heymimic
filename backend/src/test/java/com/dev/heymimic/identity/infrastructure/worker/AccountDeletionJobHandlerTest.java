package com.dev.heymimic.identity.infrastructure.worker;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.identity.application.IdentityAccountDeletionFinalizer;
import com.dev.heymimic.identity.application.port.DeletionCheckpointStore;
import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AccountDeletionJobHandlerTest {
  @Test
  void resumesAfterCompletedCleanerCheckpointAndFinalizesIdentityLast() {
    Instant now = Instant.parse("2026-09-07T12:00:00Z");
    UUID userId = UUID.randomUUID();
    UUID jobId = UUID.randomUUID();
    AccountDataCleaner platform = cleaner("platform", 100);
    AccountDataCleaner learner = cleaner("learner", 500);
    DeletionCheckpointStore checkpoints = mock(DeletionCheckpointStore.class);
    IdentityAccountDeletionFinalizer finalizer = mock(IdentityAccountDeletionFinalizer.class);
    when(checkpoints.isCompleted(userId, "platform")).thenReturn(true);
    when(checkpoints.isCompleted(userId, "learner")).thenReturn(false);
    when(checkpoints.isCompleted(userId, "identity")).thenReturn(false);
    var handler =
        new AccountDeletionJobHandler(
            List.of(learner, platform), checkpoints, finalizer, Clock.fixed(now, ZoneOffset.UTC));
    var job =
        new ClaimedJob(
            jobId, userId, "DELETE_ACCOUNT", userId, 1, "{}", null, 2, 4, now.plusSeconds(120));

    handler.handle(job);

    verify(platform, never()).clean(userId, jobId);
    var ordered = inOrder(learner, checkpoints, finalizer);
    ordered.verify(learner).clean(userId, jobId);
    ordered.verify(checkpoints).completeStep(userId, "learner", now);
    ordered.verify(finalizer).finalizeDeletion(userId);
    ordered.verify(checkpoints).completeStep(userId, "identity", now);
    ordered.verify(checkpoints).completeDeletion(userId, now);
  }

  private AccountDataCleaner cleaner(String name, int order) {
    AccountDataCleaner cleaner = mock(AccountDataCleaner.class);
    when(cleaner.cleanerName()).thenReturn(name);
    when(cleaner.order()).thenReturn(order);
    return cleaner;
  }
}
