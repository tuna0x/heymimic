package com.dev.heymimic.platform.infrastructure.messaging;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.infrastructure.persistence.JdbcBrokerDispatchStore;
import com.dev.heymimic.platform.infrastructure.worker.*;
import com.rabbitmq.client.Channel;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import tools.jackson.databind.ObjectMapper;

class RabbitDispatchListenerTest {
  final JdbcBrokerDispatchStore store = mock(JdbcBrokerDispatchStore.class);
  final PlatformJobExecutor jobs = mock(PlatformJobExecutor.class);
  final PlatformEventExecutor events = mock(PlatformEventExecutor.class);
  final Channel channel = mock(Channel.class);
  final ObjectMapper json = new ObjectMapper();
  final RabbitDispatchListener listener =
      new RabbitDispatchListener(
          store,
          jobs,
          events,
          new JobWorkerConfiguration.Properties(
              true, "job", 1, Duration.ofMinutes(2), Duration.ofSeconds(2), 5),
          new EventWorkerConfiguration.Properties(
              true, "event", 1, Duration.ofMinutes(2), Duration.ofSeconds(2), 5),
          json);

  Message message(byte[] body) {
    var p = new MessageProperties();
    p.setDeliveryTag(7);
    p.setReceivedRoutingKey("jobs.speaking");
    return new Message(body, p);
  }

  @Test
  void brokerAckFollowsExecutionAndDuplicateDoesNotExecute() throws Exception {
    UUID dispatch = UUID.randomUUID();
    var job =
        new ClaimedJob(
            UUID.randomUUID(),
            null,
            "SPEAKING_EVALUATION",
            UUID.randomUUID(),
            1,
            "{}",
            null,
            1,
            1,
            Instant.now().plusSeconds(120),
            "job");
    when(store.claimJob(eq(dispatch), eq(1L), eq("jobs.speaking"), eq("job"), any()))
        .thenReturn(Optional.of(job), Optional.empty());
    var m = message(json.writeValueAsBytes(new DispatchMessage(1, dispatch, 1)));
    listener.speaking(m, channel);
    var order = inOrder(jobs, channel);
    order.verify(jobs).execute(job);
    order.verify(channel).basicAck(7, false);
    listener.speaking(m, channel);
    verify(jobs, times(1)).execute(job);
    verify(channel, times(2)).basicAck(7, false);
  }

  @Test
  void invalidEnvelopeIsDeadLetteredWithoutDatabaseAccess() throws Exception {
    listener.speaking(message("{}".getBytes(java.nio.charset.StandardCharsets.UTF_8)), channel);
    verify(channel).basicReject(7, false);
    verifyNoInteractions(store, jobs, events);
  }

  @Test
  void databaseFailureDoesNotAckUncommittedExecution() throws Exception {
    when(store.claimJob(any(), anyLong(), anyString(), anyString(), any()))
        .thenThrow(new IllegalStateException("database offline"));
    listener.speaking(
        message(json.writeValueAsBytes(new DispatchMessage(1, UUID.randomUUID(), 1))), channel);
    verify(channel, never()).basicAck(anyLong(), anyBoolean());
    verify(channel).basicReject(7, false);
  }
}
