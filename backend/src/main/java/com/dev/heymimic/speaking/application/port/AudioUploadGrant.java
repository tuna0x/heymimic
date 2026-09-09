package com.dev.heymimic.speaking.application.port;

import java.time.Instant;
import java.util.Map;

public record AudioUploadGrant(
    String uploadUrl, Map<String, String> requiredHeaders, Instant expiresAt) {}
