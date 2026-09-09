package com.dev.heymimic.vocabulary.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaContextAnalysisRepository extends JpaRepository<ContextAnalysisEntity, UUID> {
  Optional<ContextAnalysisEntity> findByIdAndUserId(UUID id, UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ContextAnalysisEntity analysis
      set analysis.status = com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus.COMPLETED,
          analysis.result = :result, analysis.updatedAt = :now
      where analysis.id = :id and analysis.userId = :userId
        and analysis.status = com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus.PENDING
      """)
  int complete(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("result") String result,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ContextAnalysisEntity analysis
      set analysis.status = com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus.FAILED,
          analysis.errorCode = :errorCode, analysis.updatedAt = :now
      where analysis.id = :id and analysis.userId = :userId
        and analysis.status = com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus.PENDING
      """)
  int fail(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("errorCode") String errorCode,
      @Param("now") Instant now);

  @Query(
      value =
          """
          select * from vocabulary_context_analyses
          where expires_at <= :now
          order by expires_at, id
          for update skip locked
          limit :limit
          """,
      nativeQuery = true)
  List<ContextAnalysisEntity> lockExpired(@Param("now") Instant now, @Param("limit") int limit);

  void deleteByUserId(UUID userId);
}
