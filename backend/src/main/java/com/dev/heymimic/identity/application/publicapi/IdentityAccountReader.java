package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public interface IdentityAccountReader {
  IdentityAccount get(UUID userId);
}
