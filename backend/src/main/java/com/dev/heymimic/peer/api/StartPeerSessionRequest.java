package com.dev.heymimic.peer.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StartPeerSessionRequest(@NotNull UUID scenarioVersionId) {}
