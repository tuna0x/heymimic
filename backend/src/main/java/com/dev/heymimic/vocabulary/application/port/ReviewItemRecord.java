package com.dev.heymimic.vocabulary.application.port;

import java.time.Instant;
import java.util.UUID;

public record ReviewItemRecord(
    UUID id, UUID sessionId, UUID wordId, int position, UUID activeEventId, Instant presentedAt) {}
