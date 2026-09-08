package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.study.application.port.NewStudyStep;
import com.dev.heymimic.study.domain.StudyStepKind;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "study_steps")
class StudyStepEntity {
  @Id private UUID id;

  @Column(name = "study_session_id", nullable = false)
  private UUID studySessionId;

  @Column(nullable = false)
  private int position;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private StudyStepKind kind;

  @Column(name = "review_session_id")
  private UUID reviewSessionId;

  @Column(name = "speaking_session_id")
  private UUID speakingSessionId;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected StudyStepEntity() {}

  StudyStepEntity(UUID studySessionId, NewStudyStep step, Instant now) {
    this.id = step.id();
    this.studySessionId = studySessionId;
    this.position = step.position();
    this.kind = step.kind();
    this.reviewSessionId = step.reviewSessionId();
    this.speakingSessionId = step.speakingSessionId();
    this.createdAt = now;
  }

  UUID id() {
    return id;
  }

  UUID studySessionId() {
    return studySessionId;
  }

  int position() {
    return position;
  }

  StudyStepKind kind() {
    return kind;
  }

  UUID reviewSessionId() {
    return reviewSessionId;
  }

  UUID speakingSessionId() {
    return speakingSessionId;
  }
}
