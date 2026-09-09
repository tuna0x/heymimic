package com.dev.heymimic.vocabulary.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record StartReviewSessionRequest(@Size(max = 50) List<@NotNull UUID> wordIds) {}
