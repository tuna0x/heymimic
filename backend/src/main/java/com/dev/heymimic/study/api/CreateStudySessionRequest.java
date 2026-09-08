package com.dev.heymimic.study.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateStudySessionRequest(
    @NotEmpty @Size(max = 2) List<@NotNull @Valid PlannedStudyStepRequest> plannedSteps) {}
