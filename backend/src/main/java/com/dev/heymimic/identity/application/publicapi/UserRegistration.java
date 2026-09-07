package com.dev.heymimic.identity.application.publicapi;

public interface UserRegistration {
  RegisteredUser register(RegisterUser command);
}
