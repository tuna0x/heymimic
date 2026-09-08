package com.dev.heymimic.speaking.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "speaking_topics")
class SpeakingTopicEntity {
  @Id private UUID id;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 32)
  private String category;

  @Column(name = "category_label", nullable = false, length = 100)
  private String categoryLabel;

  @Column(nullable = false, length = 16)
  private String level;

  @Column(nullable = false, columnDefinition = "text")
  private String prompt;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(nullable = false, columnDefinition = "jsonb")
  private String content;

  @Column(nullable = false)
  private int revision;

  @Column(name = "archived_at")
  private Instant archivedAt;

  protected SpeakingTopicEntity() {}

  UUID id() {
    return id;
  }

  String title() {
    return title;
  }

  String category() {
    return category;
  }

  String categoryLabel() {
    return categoryLabel;
  }

  String level() {
    return level;
  }

  String prompt() {
    return prompt;
  }

  String content() {
    return content;
  }

  int revision() {
    return revision;
  }
}
