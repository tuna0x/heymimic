package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.progress.domain.MistakeStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaMistakePatternRepository extends JpaRepository<MistakePatternEntity, UUID> {
  @Modifying
  @Query(
      value =
          """
      insert into progress_mistake_patterns
        (id, user_id, category, pattern_key, taxonomy_version, title, explanation,
         status, version, first_seen_at, last_seen_at, updated_at)
      values
        (:id, :userId, :category, :patternKey, :taxonomyVersion, :title, :explanation,
         'ACTIVE', 0, :seenAt, :seenAt, :seenAt)
      on conflict (user_id, category, pattern_key, taxonomy_version) do nothing
      """,
      nativeQuery = true)
  int insertIfAbsent(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("category") String category,
      @Param("patternKey") String patternKey,
      @Param("taxonomyVersion") String taxonomyVersion,
      @Param("title") String title,
      @Param("explanation") String explanation,
      @Param("seenAt") Instant seenAt);

  Optional<MistakePatternEntity> findByUserIdAndCategoryAndPatternKeyAndTaxonomyVersion(
      UUID userId, String category, String patternKey, String taxonomyVersion);

  @Query(
      """
      select pattern from MistakePatternEntity pattern
      where pattern.userId = :userId
        and (:status is null or pattern.status = :status)
        and (:category is null or pattern.category = :category)
      order by pattern.lastSeenAt desc, pattern.id
      """)
  Page<MistakePatternEntity> findOwned(
      @Param("userId") UUID userId,
      @Param("status") MistakeStatus status,
      @Param("category") String category,
      Pageable pageable);

  Optional<MistakePatternEntity> findByIdAndUserId(UUID id, UUID userId);

  @Modifying
  @Query(
      """
      update MistakePatternEntity pattern
      set pattern.status = :status, pattern.version = pattern.version + 1,
          pattern.updatedAt = :updatedAt
      where pattern.id = :id and pattern.userId = :userId and pattern.version = :expectedVersion
      """)
  int updateStatus(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("status") MistakeStatus status,
      @Param("expectedVersion") long expectedVersion,
      @Param("updatedAt") Instant updatedAt);

  @Modifying
  @Query(
      """
      update MistakePatternEntity pattern
      set pattern.lastSeenAt = :seenAt, pattern.updatedAt = :seenAt
      where pattern.id = :id and pattern.lastSeenAt < :seenAt
      """)
  void advanceLastSeen(@Param("id") UUID id, @Param("seenAt") Instant seenAt);

  void deleteByUserId(UUID userId);
}
