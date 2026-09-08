package com.dev.heymimic.speaking.application.publicapi;

import java.time.Instant;

public record AttemptPlaybackView(String playbackUrl, Instant expiresAt) {}
