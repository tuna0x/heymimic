package com.dev.heymimic.speaking.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface JpaSpeakingFeedbackRepository extends JpaRepository<SpeakingFeedbackItemEntity, UUID> {}
