package com.dev.heymimic.study.application.publicapi;

import java.util.List;
import java.util.UUID;

public record PlannedStudyStep(String kind, List<UUID> wordIds, UUID topicId) {}
