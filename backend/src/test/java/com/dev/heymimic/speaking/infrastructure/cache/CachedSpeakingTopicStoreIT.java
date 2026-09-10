package com.dev.heymimic.speaking.infrastructure.cache;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.dev.heymimic.speaking.application.port.SpeakingTopicRecord;
import com.dev.heymimic.speaking.infrastructure.persistence.JpaSpeakingTopicStore;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;

@Testcontainers
class CachedSpeakingTopicStoreIT {
  @Container
  static final GenericContainer<?> REDIS =
      new GenericContainer<>("redis:7.4.7-alpine").withExposedPorts(6379);

  @Test
  void jsonRoundTripHasTtlAndCorruptionAndDisconnectFallBackToDatabase() {
    var connection = new LettuceConnectionFactory(REDIS.getHost(), REDIS.getMappedPort(6379));
    connection.afterPropertiesSet();
    try {
      var redis = new StringRedisTemplate(connection);
      var database = mock(JpaSpeakingTopicStore.class);
      var topic =
          new SpeakingTopicRecord(
              UUID.randomUUID(),
              "Morning",
              "daily",
              "Daily",
              "A2-B1",
              "Describe your morning",
              "{}",
              1);
      when(database.findAvailable(null, "A2-B1")).thenReturn(List.of(topic));
      var cache =
          new CachedSpeakingTopicStore(
              database,
              redis,
              new ObjectMapper(),
              new SimpleMeterRegistry(),
              Duration.ofMinutes(5),
              "test",
              "1");
      assertThat(cache.findAvailable(null, "A2-B1")).containsExactly(topic);
      assertThat(cache.findAvailable(null, "A2-B1")).containsExactly(topic);
      verify(database, times(1)).findAvailable(null, "A2-B1");
      String key = "test:1:" + CachedSpeakingTopicStore.key(null, "A2-B1");
      assertThat(redis.getExpire(key)).isBetween(1L, 330L);
      redis.opsForValue().set(key, "broken-json");
      assertThat(cache.findAvailable(null, "A2-B1")).containsExactly(topic);
      verify(database, times(2)).findAvailable(null, "A2-B1");
      cache.findAvailableById(topic.id());
      verify(database).findAvailableById(topic.id());
      connection.destroy();
      assertThat(cache.findAvailable(null, "A2-B1")).containsExactly(topic);
      verify(database, times(3)).findAvailable(null, "A2-B1");
    } finally {
      connection.destroy();
    }
  }
}
