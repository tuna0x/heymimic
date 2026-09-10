package com.dev.heymimic.speaking.infrastructure.cache;

import com.dev.heymimic.speaking.application.port.SpeakingTopicRecord;
import com.dev.heymimic.speaking.application.port.SpeakingTopicStore;
import com.dev.heymimic.speaking.infrastructure.persistence.JpaSpeakingTopicStore;
import io.micrometer.core.instrument.MeterRegistry;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Repository
@Primary
@ConditionalOnProperty(prefix = "heymimic.cache", name = "enabled", havingValue = "true")
public class CachedSpeakingTopicStore implements SpeakingTopicStore {
  private final JpaSpeakingTopicStore database;
  private final StringRedisTemplate redis;
  private final ObjectMapper json;
  private final MeterRegistry metrics;
  private final Duration ttl;
  private final String prefix;
  private final Object[] refillLocks =
      java.util.stream.Stream.generate(Object::new).limit(32).toArray();
  private final AtomicLong bypassUntil = new AtomicLong();

  public CachedSpeakingTopicStore(
      JpaSpeakingTopicStore database,
      StringRedisTemplate redis,
      ObjectMapper json,
      MeterRegistry metrics,
      @Value("${heymimic.cache.topic-ttl:5m}") Duration ttl,
      @Value("${heymimic.cache.namespace:heymimic}") String namespace,
      @Value("${heymimic.cache.catalog-revision:1}") String catalogRevision) {
    if (ttl.isNegative() || ttl.isZero() || ttl.compareTo(Duration.ofHours(1)) > 0)
      throw new IllegalArgumentException("Topic cache TTL must be in (0,1h]");
    this.database = database;
    this.redis = redis;
    this.json = json;
    this.metrics = metrics;
    this.ttl = ttl;
    if (!namespace.matches("[a-zA-Z0-9:,_-]{1,100}")
        || !catalogRevision.matches("[a-zA-Z0-9._-]{1,60}"))
      throw new IllegalArgumentException("Invalid catalog cache namespace/revision");
    this.prefix = namespace + ":" + catalogRevision + ":";
  }

  @Override
  public List<SpeakingTopicRecord> findAvailable(String category, String level) {
    String key = prefix + key(category, level);
    if (System.nanoTime() < bypassUntil.get()) return database.findAvailable(category, level);
    synchronized (refillLocks[Math.floorMod(key.hashCode(), refillLocks.length)]) {
      return load(category, level, key);
    }
  }

  private List<SpeakingTopicRecord> load(String category, String level, String key) {
    if (System.nanoTime() < bypassUntil.get()) return database.findAvailable(category, level);
    try {
      String cached = redis.opsForValue().get(key);
      if (cached != null) {
        try {
          List<SpeakingTopicRecord> topics =
              json.readValue(cached, new TypeReference<List<SpeakingTopicRecord>>() {});
          if (topics != null && topics.stream().allMatch(t -> t != null && t.id() != null)) {
            metrics.counter("heymimic.cache.topics", "outcome", "hit").increment();
            return List.copyOf(topics);
          }
        } catch (RuntimeException invalid) {
          metrics.counter("heymimic.cache.topics", "outcome", "invalid").increment();
        }
      }
    } catch (RuntimeException unavailable) {
      bypass();
      return database.findAvailable(category, level);
    }
    metrics.counter("heymimic.cache.topics", "outcome", "miss").increment();
    var topics = database.findAvailable(category, level);
    try {
      redis
          .opsForValue()
          .set(
              key,
              json.writeValueAsString(topics),
              ttl.plusMillis(
                  ThreadLocalRandom.current().nextLong(1, Math.max(2, ttl.toMillis() / 10))));
    } catch (RuntimeException unavailable) {
      bypass();
    }
    return topics;
  }

  // Session creation always checks the current database row, even if a listing is cached.
  @Override
  public Optional<SpeakingTopicRecord> findAvailableById(UUID id) {
    return database.findAvailableById(id);
  }

  private void bypass() {
    bypassUntil.set(System.nanoTime() + Duration.ofSeconds(5).toNanos());
    metrics.counter("heymimic.cache.topics", "outcome", "fallback").increment();
  }

  static String key(String category, String level) {
    try {
      String input =
          (category == null ? "-" : category.length() + ":" + category)
              + "|"
              + (level == null ? "-" : level.length() + ":" + level);
      return "heymimic:catalog:topics:v1:"
          + HexFormat.of()
              .formatHex(
                  MessageDigest.getInstance("SHA-256")
                      .digest(input.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException impossible) {
      throw new IllegalStateException(impossible);
    }
  }
}
