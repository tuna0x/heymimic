package com.dev.heymimic.identity.infrastructure.worker;

import com.dev.heymimic.identity.application.IdentityAccountDeletionFinalizer;
import com.dev.heymimic.identity.application.IdentityAccountDeletionService;
import com.dev.heymimic.identity.application.port.DeletionCheckpointStore;
import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import java.time.Clock;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AccountDeletionJobHandler implements JobHandler {
  private static final String IDENTITY_STEP = "identity";
  private final List<AccountDataCleaner> cleaners;
  private final DeletionCheckpointStore checkpoints;
  private final IdentityAccountDeletionFinalizer finalizer;
  private final Clock clock;

  public AccountDeletionJobHandler(
      Collection<AccountDataCleaner> cleaners,
      DeletionCheckpointStore checkpoints,
      IdentityAccountDeletionFinalizer finalizer,
      Clock clock) {
    this.cleaners =
        cleaners.stream().sorted(Comparator.comparingInt(AccountDataCleaner::order)).toList();
    var names = new HashSet<String>();
    for (AccountDataCleaner cleaner : this.cleaners) {
      if (!names.add(cleaner.cleanerName()) || IDENTITY_STEP.equals(cleaner.cleanerName())) {
        throw new IllegalStateException(
            "Duplicate or reserved account cleaner name: " + cleaner.cleanerName());
      }
    }
    this.checkpoints = checkpoints;
    this.finalizer = finalizer;
    this.clock = clock;
  }

  @Override
  public String jobType() {
    return IdentityAccountDeletionService.JOB_TYPE;
  }

  @Override
  public boolean allowsInactiveOwner() {
    return true;
  }

  @Override
  public void handle(ClaimedJob job) {
    UUID userId = job.resourceId();
    if (job.ownerUserId() != null && !job.ownerUserId().equals(userId)) {
      throw new IllegalArgumentException("Deletion job owner and resource must identify one user");
    }

    for (AccountDataCleaner cleaner : cleaners) {
      if (!checkpoints.isCompleted(userId, cleaner.cleanerName())) {
        cleaner.clean(userId, job.id());
        checkpoints.completeStep(userId, cleaner.cleanerName(), clock.instant());
      }
    }
    if (!checkpoints.isCompleted(userId, IDENTITY_STEP)) {
      finalizer.finalizeDeletion(userId);
      checkpoints.completeStep(userId, IDENTITY_STEP, clock.instant());
    }
    checkpoints.completeDeletion(userId, clock.instant());
  }
}
