package com.dev.heymimic.learner.application.publicapi;

import java.util.UUID;

public record CreateLearnerProfile(UUID userId, String name, String timezone) {}
