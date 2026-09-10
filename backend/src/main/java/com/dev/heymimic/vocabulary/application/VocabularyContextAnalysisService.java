package com.dev.heymimic.vocabulary.application;

import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PaidWorkGuard;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.platform.application.publicapi.ReserveQuota;
import com.dev.heymimic.platform.application.publicapi.UserContextChanges;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisRecord;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisStore;
import com.dev.heymimic.vocabulary.application.port.ExtractedVocabularySuggestion;
import com.dev.heymimic.vocabulary.application.port.NewVocabularyWord;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionResult;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalyses;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalysisView;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalysisWorkflow;
import com.dev.heymimic.vocabulary.application.publicapi.PreparedContextAnalysis;
import com.dev.heymimic.vocabulary.application.publicapi.StartedContextAnalysis;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularySuggestionView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class VocabularyContextAnalysisService implements ContextAnalyses, ContextAnalysisWorkflow {
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private static final Duration ANALYSIS_TTL = Duration.ofDays(7);
  private static final String QUOTA_KIND = "CONTEXT_ANALYSIS";
  private final ContextAnalysisStore analyses;
  private final VocabularyWordStore words;
  private final IdempotencyExecutor idempotency;
  private final QuotaManager quotas;
  private final JobQueue jobs;
  private final PaidWorkGuard paidWorkGuard;
  private final ObjectMapper objectMapper;
  private final Clock clock;
  private final OutboxPublisher outbox;
  private final UserContextChanges contextChanges;

  public VocabularyContextAnalysisService(
      ContextAnalysisStore analyses,
      VocabularyWordStore words,
      IdempotencyExecutor idempotency,
      QuotaManager quotas,
      JobQueue jobs,
      PaidWorkGuard paidWorkGuard,
      ObjectMapper objectMapper,
      Clock clock) {
    this(
        analyses,
        words,
        idempotency,
        quotas,
        jobs,
        paidWorkGuard,
        objectMapper,
        clock,
        event -> event.aggregateId(),
        (userId, contextKey, causeEventId, requiredConsumers) -> 0L);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public VocabularyContextAnalysisService(
      ContextAnalysisStore analyses,
      VocabularyWordStore words,
      IdempotencyExecutor idempotency,
      QuotaManager quotas,
      JobQueue jobs,
      PaidWorkGuard paidWorkGuard,
      ObjectMapper objectMapper,
      Clock clock,
      OutboxPublisher outbox,
      UserContextChanges contextChanges) {
    this.analyses = analyses;
    this.words = words;
    this.idempotency = idempotency;
    this.quotas = quotas;
    this.jobs = jobs;
    this.paidWorkGuard = paidWorkGuard;
    this.objectMapper = objectMapper;
    this.clock = clock;
    this.outbox = outbox;
    this.contextChanges = contextChanges;
  }

  @Override
  public StartedContextAnalysis start(
      UUID userId, UUID idempotencyKey, String text, String targetLanguage) {
    if (!paidWorkGuard.canUsePaidWork(userId)) {
      throw new ApiException(
          HttpStatus.FORBIDDEN,
          "EMAIL_VERIFICATION_REQUIRED",
          "Email verification is required for context analysis");
    }
    String canonicalText = text.trim();
    String canonicalLanguage = targetLanguage.trim().toLowerCase(Locale.ROOT);
    var command =
        new IdempotencyCommand(
            userId,
            "vocabulary.context-analysis.create",
            idempotencyKey,
            canonicalLanguage + "\n" + canonicalText,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> startFresh(userId, canonicalText, canonicalLanguage));
    StartPayload payload = read(result.bodyJson(), StartPayload.class);
    return new StartedContextAnalysis(
        payload.analysisId(), payload.status(), payload.pollUrl(), result.replayed());
  }

  private IdempotentResponse startFresh(UUID userId, String text, String targetLanguage) {
    Instant now = clock.instant();
    UUID analysisId = UUID.randomUUID();
    UUID reservationId = quotas.reserve(new ReserveQuota(userId, analysisId, QUOTA_KIND, 1));
    UUID jobId = jobs.enqueue(new EnqueueJob(userId, JOB_TYPE, analysisId, 1, "{}", now));
    analyses.create(
        analysisId,
        userId,
        sha256(text),
        text,
        targetLanguage,
        jobId,
        reservationId,
        now.plus(ANALYSIS_TTL),
        now);
    var payload =
        new StartPayload(
            analysisId, "pending", "/api/v1/vocabulary/context-analyses/" + analysisId);
    return IdempotentResponse.fresh(HttpStatus.ACCEPTED.value(), write(payload));
  }

  @Override
  @Transactional(readOnly = true)
  public ContextAnalysisView get(UUID userId, UUID analysisId) {
    return view(loadOwned(analysisId, userId));
  }

  @Override
  @Transactional
  public List<VocabularyWordView> save(UUID userId, UUID analysisId, List<UUID> suggestionIds) {
    ContextAnalysisRecord analysis = loadOwned(analysisId, userId);
    if (analysis.expiresAt().isBefore(clock.instant())) {
      throw new ApiException(
          HttpStatus.GONE, "CONTEXT_ANALYSIS_EXPIRED", "Context analysis has expired");
    }
    if (analysis.resultJson() == null) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "CONTEXT_ANALYSIS_NOT_COMPLETED",
          "Context analysis is not completed");
    }
    var uniqueIds = new HashSet<>(suggestionIds);
    if (uniqueIds.size() != suggestionIds.size()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "DUPLICATE_SUGGESTION_IDS", "Suggestion IDs must be unique");
    }
    AnalysisResult result = read(analysis.resultJson(), AnalysisResult.class);
    var selected =
        result.suggestions().stream().filter(item -> uniqueIds.contains(item.id())).toList();
    if (selected.size() != uniqueIds.size()) {
      throw new ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "INVALID_SUGGESTION_IDS",
          "One or more suggestions do not belong to this analysis");
    }

    Instant now = clock.instant();
    List<VocabularyWordRecord> saved =
        selected.stream()
            .map(
                suggestion -> {
                  String normalizedWord = VocabularyWordIdentity.normalize(suggestion.word());
                  String senseKey =
                      VocabularyWordIdentity.senseKey(
                          analysis.targetLanguage(),
                          suggestion.meaning(),
                          suggestion.partOfSpeech());
                  return words.createOrFind(
                      new NewVocabularyWord(
                          UUID.randomUUID(),
                          userId,
                          analysis.targetLanguage(),
                          normalizedWord,
                          senseKey,
                          suggestion.word(),
                          suggestion.meaning(),
                          suggestion.pronunciation(),
                          suggestion.partOfSpeech(),
                          suggestion.example(),
                          suggestion.translation(),
                          suggestion.sourceSentence(),
                          now));
                })
            .toList();
    saved.forEach(word -> recordWordChange(userId, word, "CONTEXT_ANALYSIS_SAVED", now));
    return saved.stream().map(this::wordView).toList();
  }

  private void recordWordChange(
      UUID userId, VocabularyWordRecord word, String changeKind, Instant occurredAt) {
    UUID eventId =
        outbox.publish(
            new PublishEvent(
                userId,
                "VocabularyWordChanged",
                1,
                word.id(),
                occurredAt,
                "{\"wordId\":\""
                    + word.id()
                    + "\",\"userId\":\""
                    + userId
                    + "\",\"wordVersion\":"
                    + word.version()
                    + ",\"changeKind\":\""
                    + changeKind
                    + "\"}"));
    contextChanges.record(
        userId, UserContextChanges.LEARNING_CONTEXT, eventId, java.util.List.of());
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<PreparedContextAnalysis> prepare(UUID analysisId, UUID userId) {
    return analyses
        .findOwned(analysisId, userId)
        .filter(
            analysis ->
                analysis.status()
                    == com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus.PENDING)
        .map(
            analysis ->
                new PreparedContextAnalysis(
                    analysis.id(),
                    analysis.userId(),
                    analysis.inputText(),
                    analysis.targetLanguage(),
                    analysis.quotaReservationId()));
  }

  @Override
  @Transactional
  public void complete(PreparedContextAnalysis analysis, VocabularyExtractionResult result) {
    if (result == null
        || (!"fake".equals(result.source()) && !"provider".equals(result.source()))) {
      throw new IllegalArgumentException("Extraction source must be fake or provider");
    }
    List<VocabularySuggestionView> validated = validateAndMap(analysis.id(), result.suggestions());
    String resultJson = write(new AnalysisResult(1, result.source(), validated));
    if (analyses.complete(analysis.id(), analysis.userId(), resultJson, clock.instant())) {
      quotas.consume(analysis.quotaReservationId(), analysis.userId());
    }
  }

  @Override
  @Transactional(readOnly = true)
  public boolean isCompleted(UUID analysisId, UUID userId) {
    return analyses
        .findOwned(analysisId, userId)
        .filter(analysis -> analysis.resultJson() != null)
        .isPresent();
  }

  @Override
  @Transactional
  public void fail(UUID analysisId, UUID userId, String errorCode) {
    analyses
        .findOwned(analysisId, userId)
        .ifPresent(
            analysis -> {
              String persistedErrorCode = sanitizeErrorCode(errorCode);
              if (analyses.fail(analysisId, userId, persistedErrorCode, clock.instant())) {
                quotas.consume(analysis.quotaReservationId(), userId);
              }
            });
  }

  private String sanitizeErrorCode(String errorCode) {
    String value = errorCode == null || errorCode.isBlank() ? "UNEXPECTED_ERROR" : errorCode.trim();
    return value.substring(0, Math.min(value.length(), 100));
  }

  private List<VocabularySuggestionView> validateAndMap(
      UUID analysisId, List<ExtractedVocabularySuggestion> suggestions) {
    if (suggestions == null || suggestions.size() > 20) {
      throw new IllegalArgumentException("Extraction result must contain at most 20 suggestions");
    }
    List<VocabularySuggestionView> result = new ArrayList<>();
    for (int index = 0; index < suggestions.size(); index++) {
      ExtractedVocabularySuggestion suggestion = suggestions.get(index);
      if (suggestion == null
          || suggestion.word() == null
          || suggestion.word().isBlank()
          || suggestion.meaning() == null
          || suggestion.meaning().isBlank()
          || tooLong(suggestion.word(), 200)
          || tooLong(suggestion.meaning(), 1000)
          || tooLong(suggestion.pronunciation(), 200)
          || tooLong(suggestion.partOfSpeech(), 50)
          || tooLong(suggestion.example(), 2000)
          || tooLong(suggestion.translation(), 2000)
          || tooLong(suggestion.sourceSentence(), 4000)) {
        throw new IllegalArgumentException("Extraction result contains invalid suggestion content");
      }
      UUID suggestionId =
          UUID.nameUUIDFromBytes(
              (analysisId + ":" + index + ":" + suggestion.word())
                  .getBytes(StandardCharsets.UTF_8));
      result.add(
          new VocabularySuggestionView(
              suggestionId,
              suggestion.word().trim(),
              suggestion.meaning().trim(),
              trim(suggestion.pronunciation()),
              trim(suggestion.partOfSpeech()),
              trim(suggestion.example()),
              trim(suggestion.translation()),
              trim(suggestion.sourceSentence()),
              null));
    }
    return List.copyOf(result);
  }

  private ContextAnalysisRecord loadOwned(UUID analysisId, UUID userId) {
    return analyses
        .findOwned(analysisId, userId)
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "CONTEXT_ANALYSIS_NOT_FOUND",
                    "Context analysis not found"));
  }

  private ContextAnalysisView view(ContextAnalysisRecord analysis) {
    if (analysis.resultJson() == null) {
      return new ContextAnalysisView(
          analysis.id(),
          analysis.status().apiValue(),
          List.of(),
          null,
          analysis.expiresAt(),
          analysis.errorCode());
    }
    AnalysisResult result = read(analysis.resultJson(), AnalysisResult.class);
    return new ContextAnalysisView(
        analysis.id(),
        analysis.status().apiValue(),
        result.suggestions(),
        result.source(),
        analysis.expiresAt(),
        analysis.errorCode());
  }

  private String trim(String value) {
    return value == null ? null : value.trim();
  }

  private boolean tooLong(String value, int limit) {
    return value != null && value.length() > limit;
  }

  private VocabularyWordView wordView(VocabularyWordRecord word) {
    return new VocabularyWordView(
        word.id(),
        word.targetLanguage(),
        word.word(),
        word.meaning(),
        word.pronunciation(),
        word.partOfSpeech(),
        word.example(),
        word.translation(),
        word.sourceContext(),
        word.mastery(),
        word.status().apiValue(),
        word.intervalDays(),
        word.nextReviewAt(),
        word.version(),
        word.createdAt());
  }

  private String sha256(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is unavailable", exception);
    }
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize context analysis", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize context analysis", exception);
    }
  }

  private record StartPayload(UUID analysisId, String status, String pollUrl) {}

  private record AnalysisResult(
      int schemaVersion, String source, List<VocabularySuggestionView> suggestions) {}
}
