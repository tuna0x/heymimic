package com.dev.heymimic.speaking.application.publicapi;

public record SpeakingAttemptDetailView(
    SpeakingAttemptView attempt, SpeakingEvaluationView evaluation) {}
