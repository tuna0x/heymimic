package com.dev.heymimic.speaking.application.publicapi;

import java.time.Instant;
import java.util.Map;

public record AttemptUploadView(
    SpeakingAttemptView attempt,
    String uploadUrl,
    Map<String, String> requiredHeaders,
    Instant expiresAt,
    boolean replayed) {}
