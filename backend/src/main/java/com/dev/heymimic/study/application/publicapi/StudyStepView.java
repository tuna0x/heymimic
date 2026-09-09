package com.dev.heymimic.study.application.publicapi;

import java.util.UUID;

public record StudyStepView(
    int position, String kind, UUID reviewSessionId, UUID speakingSessionId, String childStatus) {}
