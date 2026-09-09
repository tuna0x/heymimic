package com.dev.heymimic.vocabulary.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record SaveVocabularyWordsRequest(
    @NotNull UUID analysisId, @NotNull @Size(min = 1, max = 20) List<UUID> suggestionIds) {}
