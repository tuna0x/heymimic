package com.dev.heymimic.peer.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.peer.api.PeerInviteView;
import com.dev.heymimic.peer.api.PeerSessionView;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;

class PeerPracticeServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID OTHER_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final UUID IDEMPOTENCY_KEY =
      UUID.fromString("00000000-0000-0000-0000-000000000333");
  private static final UUID SESSION_ID = UUID.fromString("30000000-0000-0000-0000-000000000001");
  private static final UUID SCENARIO_ID = UUID.fromString("20000000-0000-0000-0000-000000000001");
  private static final Instant NOW = Instant.parse("2026-09-10T02:00:00Z");

  private final PeerStore store = mock(PeerStore.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final PeerPracticeService service =
      new PeerPracticeService(
          store, idempotency, new ObjectMapper(), Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  @SuppressWarnings("unchecked")
  void createsOneHostReservationWithScenarioSnapshot() {
    PeerScenarioRecord scenario = scenario();
    PeerSessionRecord session = session("WAITING", List.of(participant(USER_ID, 1, "HOST", false)));
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(store.findActive(USER_ID)).thenReturn(Optional.empty());
    when(store.findScenario(SCENARIO_ID, 1)).thenReturn(Optional.of(scenario));
    when(store.createHostSession(any(), any(), any(), any())).thenReturn(session);

    var result = service.start(USER_ID, IDEMPOTENCY_KEY, SCENARIO_ID);

    assertThat(result.id()).isEqualTo(SESSION_ID);
    assertThat(result.status()).isEqualTo("WAITING");
    assertThat(result.scenario().commonObjective()).contains("handoff");
    verify(store).createHostSession(USER_ID, scenario, NOW, NOW.plusSeconds(900));
  }

  @Test
  @SuppressWarnings("unchecked")
  void expiresStaleReservationBeforeCreatingAnotherSession() {
    PeerSessionRecord expired = expiredSession();
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(store.findActive(USER_ID)).thenReturn(Optional.of(expired));
    when(store.updateSessionState(SESSION_ID, "EXPIRED", null, null, NOW, "TTL_EXPIRED", 0, NOW))
        .thenReturn(true);
    when(store.findScenario(SCENARIO_ID, 1)).thenReturn(Optional.of(scenario()));
    when(store.createHostSession(any(), any(), any(), any()))
        .thenReturn(session("WAITING", List.of(participant(USER_ID, 1, "HOST", false))));

    PeerSessionView result = service.start(USER_ID, IDEMPOTENCY_KEY, SCENARIO_ID);

    assertThat(result.status()).isEqualTo("WAITING");
    verify(store).releaseReservation(USER_ID, SESSION_ID);
  }

  @Test
  void hidesSessionsThatDoNotBelongToCaller() {
    when(store.findOwned(USER_ID, SESSION_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.get(USER_ID, SESSION_ID))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("PEER_SESSION_NOT_FOUND"));
  }

  @Test
  @SuppressWarnings("unchecked")
  void createsHashedInviteForHostWithoutReturningTheHash() throws Exception {
    PeerSessionRecord session = session("WAITING", List.of(participant(USER_ID, 1, "HOST", false)));
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(store.lockOwned(USER_ID, SESSION_ID)).thenReturn(Optional.of(session));

    PeerInviteView invite = service.createInvite(USER_ID, IDEMPOTENCY_KEY, SESSION_ID);

    assertThat(invite.token()).isNotBlank().doesNotContain("SHA");
    assertThat(invite.expiresAt()).isEqualTo(NOW.plusSeconds(600));
    var hash = ArgumentCaptor.forClass(String.class);
    verify(store).createInvite(any(), hash.capture(), any(), eq(NOW));
    assertThat(hash.getValue()).hasSize(64).matches("[0-9a-f]+");
    assertThat(hash.getValue()).doesNotContain(invite.token());
  }

  @Test
  @SuppressWarnings("unchecked")
  void readyCommandUsesExpectedVersionAndKeepsRoomWaitingUntilBothLearnersReady() {
    PeerSessionRecord before =
        session(
            "WAITING",
            List.of(
                participant(USER_ID, 1, "HOST", false),
                participant(OTHER_USER_ID, 2, "GUEST", false)));
    PeerSessionRecord after =
        session(
            "WAITING",
            List.of(
                participant(USER_ID, 1, "HOST", true),
                participant(OTHER_USER_ID, 2, "GUEST", false)));
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(store.lockOwned(USER_ID, SESSION_ID)).thenReturn(Optional.of(before));
    when(store.updateReady(SESSION_ID, USER_ID, true)).thenReturn(true);
    when(store.findOwned(USER_ID, SESSION_ID)).thenReturn(Optional.of(after));
    when(store.updateSessionState(SESSION_ID, "WAITING", null, null, null, null, 0, NOW))
        .thenReturn(true);

    var result = service.setReady(USER_ID, IDEMPOTENCY_KEY, SESSION_ID, true, 0);

    assertThat(result.status()).isEqualTo("WAITING");
    verify(store).updateSessionState(SESSION_ID, "WAITING", null, null, null, null, 0, NOW);
  }

  private static PeerParticipantRecord participant(
      UUID userId, int slot, String role, boolean ready) {
    return new PeerParticipantRecord(
        UUID.randomUUID(), userId, slot, role, "JOINING", ready, false, NOW, "Learner");
  }

  private static PeerSessionRecord expiredSession() {
    return new PeerSessionRecord(
        SESSION_ID,
        USER_ID,
        scenario(),
        "WAITING",
        0,
        null,
        null,
        NOW.minusSeconds(1),
        null,
        null,
        List.of(participant(USER_ID, 1, "HOST", false)));
  }

  private static PeerSessionRecord session(
      String status, List<PeerParticipantRecord> participants) {
    return new PeerSessionRecord(
        SESSION_ID,
        USER_ID,
        scenario(),
        status,
        0,
        null,
        null,
        NOW.plusSeconds(900),
        null,
        null,
        participants);
  }

  private static PeerScenarioRecord scenario() {
    return new PeerScenarioRecord(
        SCENARIO_ID,
        1,
        "Project handoff",
        "work",
        "Work",
        "B1-B2",
        "Agree on a handoff plan.",
        "Practise handoff language.",
        10,
        "[{\"phase\":\"OPENING\",\"title\":\"Open\",\"durationSeconds\":90,\"promptEn\":\"Set context\",\"promptVi\":\"Nêu bối cảnh\",\"hints\":[\"Start with the outcome.\"]}]",
        "[\"clarify ownership\"]");
  }
}
