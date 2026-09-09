package com.dev.heymimic.vocabulary.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.application.publicapi.UpdateVocabularyWord;
import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class VocabularyWordServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID WORD_ID = UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final Instant NOW = Instant.parse("2026-09-07T12:00:00Z");
  private final VocabularyWordStore store = mock(VocabularyWordStore.class);
  private final VocabularyWordService service =
      new VocabularyWordService(store, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void invalidStatusIsRejectedBeforeQuery() {
    assertCode("INVALID_VOCABULARY_STATUS", () -> service.find(USER_ID, "archived", null, 0, 20));
    verify(store, never()).findPage(any(), any(), any(), anyInt(), anyInt());
  }

  @Test
  void anotherUsersWordIsReportedAsNotFound() {
    when(store.findOwned(WORD_ID, USER_ID)).thenReturn(Optional.empty());

    assertCode(
        "VOCABULARY_WORD_NOT_FOUND",
        () ->
            service.update(
                USER_ID, WORD_ID, new UpdateVocabularyWord("new meaning", null, null, 2)));
  }

  @Test
  void wordLockedByReviewCannotBeEdited() {
    when(store.findOwned(WORD_ID, USER_ID))
        .thenReturn(Optional.of(word(2, UUID.randomUUID(), "old meaning")));

    assertCode(
        "VOCABULARY_WORD_LOCKED",
        () ->
            service.update(
                USER_ID, WORD_ID, new UpdateVocabularyWord("new meaning", null, null, 2)));
    verify(store, never())
        .updateContent(any(), any(), any(), any(), any(), any(), anyLong(), any());
  }

  @Test
  void staleVersionIsRejected() {
    when(store.findOwned(WORD_ID, USER_ID)).thenReturn(Optional.of(word(2, null, "old meaning")));
    when(store.updateContent(
            eq(WORD_ID),
            eq(USER_ID),
            eq("new meaning"),
            eq("new example"),
            eq(null),
            any(),
            eq(2L),
            eq(NOW)))
        .thenReturn(false);

    assertCode(
        "VOCABULARY_VERSION_CONFLICT",
        () ->
            service.update(
                USER_ID,
                WORD_ID,
                new UpdateVocabularyWord(" new meaning ", " new example ", null, 2)));
  }

  private VocabularyWordRecord word(long version, UUID lockId, String meaning) {
    return new VocabularyWordRecord(
        WORD_ID,
        USER_ID,
        "en",
        "steady",
        "0".repeat(64),
        "steady",
        meaning,
        "/ˈstedi/",
        "adjective",
        "A steady practice works.",
        "Luyện tập đều đặn sẽ hiệu quả.",
        "A steady practice is better than a perfect plan.",
        0,
        VocabularyStatus.NEW,
        0,
        NOW,
        lockId,
        version,
        NOW.minusSeconds(60));
  }

  private void assertCode(String code, org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
    assertThatThrownBy(call)
        .isInstanceOfSatisfying(
            ApiException.class, exception -> assertThat(exception.code()).isEqualTo(code));
  }
}
