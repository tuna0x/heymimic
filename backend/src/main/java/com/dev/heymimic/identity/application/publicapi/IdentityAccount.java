package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public record IdentityAccount(UUID id, String email, boolean emailVerified) {}
