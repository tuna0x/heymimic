package com.dev.heymimic.speaking.application.port;

import java.time.Instant;

public record AudioPlaybackGrant(String playbackUrl, Instant expiresAt) {}
