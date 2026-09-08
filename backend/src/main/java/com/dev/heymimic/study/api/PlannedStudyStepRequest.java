package com.dev.heymimic.study.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record PlannedStudyStepRequest(
    @NotBlank String kind, @Size(max = 50) List<UUID> wordIds, UUID topicId) {}
