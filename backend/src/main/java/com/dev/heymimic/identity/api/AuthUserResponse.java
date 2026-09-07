package com.dev.heymimic.identity.api;

import java.util.UUID;

public record AuthUserResponse(UUID id, String email, boolean verified) {}
