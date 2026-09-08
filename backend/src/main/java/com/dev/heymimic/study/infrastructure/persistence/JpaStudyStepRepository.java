package com.dev.heymimic.study.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface JpaStudyStepRepository extends JpaRepository<StudyStepEntity, UUID> {
  List<StudyStepEntity> findByStudySessionIdOrderByPosition(UUID studySessionId);
}
