package com.dev.heymimic.learner.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface JpaLearnerProfileRepository extends JpaRepository<LearnerProfileEntity, UUID> {}
