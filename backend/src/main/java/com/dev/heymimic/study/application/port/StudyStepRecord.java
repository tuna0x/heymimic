package com.dev.heymimic.study.application.port;

import com.dev.heymimic.study.domain.StudyStepKind;
import java.util.UUID;

public record StudyStepRecord(
    UUID id,
    UUID studySessionId,
    int position,
    StudyStepKind kind,
    UUID reviewSessionId,
    UUID speakingSessionId) {}
