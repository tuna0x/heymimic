package com.dev.heymimic.platform.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record ClaimedJob(
    UUID id,
    UUID ownerUserId,
    String type,
    UUID resourceId,
    int payloadVersion,
    String payloadJson,
    String checkpointJson,
    int attempts,
    long leaseGeneration,
    Instant leaseUntil) {}
