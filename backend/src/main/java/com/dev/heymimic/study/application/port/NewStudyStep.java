package com.dev.heymimic.study.application.port;

import com.dev.heymimic.study.domain.StudyStepKind;
import java.util.UUID;

public record NewStudyStep(
    UUID id, int position, StudyStepKind kind, UUID reviewSessionId, UUID speakingSessionId) {}
