package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public interface AccountDeletion {
  UUID request(UUID userId, String currentPassword);
}
