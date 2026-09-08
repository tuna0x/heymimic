package com.dev.heymimic.speaking.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaSpeakingTopicRepository extends JpaRepository<SpeakingTopicEntity, UUID> {
  @Query(
      """
      select topic from SpeakingTopicEntity topic
      where topic.archivedAt is null
        and (:category is null or topic.category = :category)
        and (:level is null or topic.level = :level)
      order by topic.category, topic.level, topic.title, topic.id
      """)
  List<SpeakingTopicEntity> findAvailable(
      @Param("category") String category, @Param("level") String level);

  Optional<SpeakingTopicEntity> findByIdAndArchivedAtIsNull(UUID id);
}
