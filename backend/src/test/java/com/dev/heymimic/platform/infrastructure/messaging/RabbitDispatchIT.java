package com.dev.heymimic.platform.infrastructure.messaging;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.dev.heymimic.platform.application.publicapi.*;
import com.dev.heymimic.platform.domain.JobStatus;
import com.dev.heymimic.platform.infrastructure.persistence.*;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.*;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;

@org.springframework.boot.test.context.SpringBootTest(
    properties = {
      "heymimic.messaging.transport=rabbitmq",
      "heymimic.messaging.relay-enabled=false"
    })
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
@org.springframework.test.annotation.DirtiesContext(
    classMode = org.springframework.test.annotation.DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.test.context.ActiveProfiles("test")
@Testcontainers
class RabbitDispatchIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17.6-alpine");

  @Container
  static final GenericContainer<?> RABBIT =
      new GenericContainer<>("rabbitmq:4.2.2-management")
          .withEnv("RABBITMQ_DEFAULT_USER", "test")
          .withEnv("RABBITMQ_DEFAULT_PASS", "test")
          .withExposedPorts(5672)
          .waitingFor(Wait.forLogMessage(".*Server startup complete.*", 1));

  @Container
  static final GenericContainer<?> REDIS =
      new GenericContainer<>("redis:7.4.7-alpine").withExposedPorts(6379);

  static JdbcTemplate jdbc;
  static JdbcJobStore jobs;
  static JdbcOutboxStore events;
  static JdbcBrokerDispatchStore dispatches;
  static JdbcJobExecutionFence fence;
  static TransactionTemplate transactions;
  static CachingConnectionFactory connection;
  static RabbitTemplate rabbit;
  static RabbitAdmin admin;
  static ObjectMapper json = new ObjectMapper();

  @org.springframework.test.context.DynamicPropertySource
  static void properties(org.springframework.test.context.DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("spring.rabbitmq.host", RABBIT::getHost);
    registry.add("spring.rabbitmq.port", () -> RABBIT.getMappedPort(5672));
    registry.add("spring.rabbitmq.username", () -> "test");
    registry.add("spring.rabbitmq.password", () -> "test");
    registry.add("spring.rabbitmq.virtual-host", () -> "/");
    registry.add("spring.data.redis.host", REDIS::getHost);
    registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
    registry.add("heymimic.cache.enabled", () -> "true");
  }

  @Test
  void apiRoleRetainsConsumersWithoutStartingWorkers(
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistry registry,
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.context.ApplicationContext context) {
    assertThat(registry.getListenerContainers()).hasSize(6).allMatch(c -> !c.isRunning());
    assertThat(context.getBeansOfType(EventConsumer.class)).hasSizeGreaterThanOrEqualTo(3);
    assertThat(context.getBean(com.dev.heymimic.speaking.application.port.SpeakingTopicStore.class))
        .isInstanceOf(
            com.dev.heymimic.speaking.infrastructure.cache.CachedSpeakingTopicStore.class);
  }

  @Test
  void duplicateConcurrentClaimsHaveOneWinner() throws Exception {
    UUID id = enqueue(databaseNow());
    UUID dispatch = dispatchId(id);
    var gate = new java.util.concurrent.CountDownLatch(1);
    try (var pool = java.util.concurrent.Executors.newFixedThreadPool(2)) {
      var one =
          pool.submit(
              () -> {
                gate.await();
                return dispatches.claimJob(
                    dispatch, 1, "jobs.speaking", "a", Duration.ofMinutes(2));
              });
      var two =
          pool.submit(
              () -> {
                gate.await();
                return dispatches.claimJob(
                    dispatch, 1, "jobs.speaking", "b", Duration.ofMinutes(2));
              });
      gate.countDown();
      assertThat(
              java.util.stream.Stream.of(
                      one.get(10, java.util.concurrent.TimeUnit.SECONDS),
                      two.get(10, java.util.concurrent.TimeUnit.SECONDS))
                  .filter(java.util.Optional::isPresent)
                  .count())
          .isEqualTo(1);
    }
  }

  @Test
  void everyRegisteredWorkloadHasTheIntendedRoute() {
    java.util.Map<String, String> routes =
        java.util.Map.of(
            "SEND_VERIFICATION_EMAIL",
            "jobs.email",
            "SEND_PASSWORD_RESET_EMAIL",
            "jobs.email",
            "SPEAKING_EVALUATION",
            "jobs.speaking",
            "VOCABULARY_CONTEXT_ANALYSIS",
            "jobs.context",
            "BUILD_DAILY_PLAN",
            "jobs.planning",
            "DELETE_ACCOUNT",
            "jobs.maintenance");
    routes.forEach(
        (type, route) -> {
          UUID id =
              jobs.enqueue(
                  UUID.randomUUID(),
                  new EnqueueJob(null, type, UUID.randomUUID(), 1, "{}", databaseNow()),
                  databaseNow());
          assertThat(
                  jdbc.queryForObject(
                      "select routing_key from platform_broker_dispatches where job_id=?",
                      String.class,
                      id))
              .isEqualTo(route);
        });
  }

  @BeforeAll
  static void setup() {
    var ds =
        new DriverManagerDataSource(
            POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    Flyway.configure().dataSource(ds).load().migrate();
    jdbc = new JdbcTemplate(ds);
    jobs = new JdbcJobStore(jdbc);
    events = new JdbcOutboxStore(jdbc);
    dispatches = new JdbcBrokerDispatchStore(jdbc, jobs, events);
    fence = new JdbcJobExecutionFence(jdbc);
    transactions = new TransactionTemplate(new DataSourceTransactionManager(ds));
    jdbc.execute("create table test_fence_probe(value integer not null)");
    jdbc.update("insert into test_fence_probe values(0)");
    connection = new CachingConnectionFactory(RABBIT.getHost(), RABBIT.getMappedPort(5672));
    connection.setUsername("test");
    connection.setPassword("test");
    connection.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
    connection.setPublisherReturns(true);
    rabbit = new RabbitTemplate(connection);
    rabbit.setReceiveTimeout(3000);
    admin = new RabbitAdmin(connection);
    for (var d : new RabbitTransportConfiguration().dispatchTopology().getDeclarables()) {
      if (d instanceof Exchange e) admin.declareExchange(e);
      else if (d instanceof Queue q) admin.declareQueue(q);
      else if (d instanceof Binding binding) admin.declareBinding(binding);
    }
  }

  @BeforeEach
  void clear() {
    jdbc.execute("delete from platform_jobs");
    jdbc.execute("delete from platform_outbox_events");
    jdbc.update("update test_fence_probe set value=0");
    for (String route : RabbitTransportConfiguration.ROUTES)
      admin.purgeQueue("heymimic." + route + ".v1", false);
  }

  @AfterAll
  static void close() {
    if (connection != null) connection.destroy();
  }

  static Instant databaseNow() {
    return jdbc.queryForObject("select clock_timestamp()", java.sql.Timestamp.class).toInstant();
  }

  UUID enqueue(Instant due) {
    return jobs.enqueue(
        UUID.randomUUID(),
        new EnqueueJob(null, "SPEAKING_EVALUATION", UUID.randomUUID(), 1, "{}", due),
        databaseNow());
  }

  UUID dispatchId(UUID job) {
    return jdbc.queryForObject(
        "select id from platform_broker_dispatches where job_id=?", UUID.class, job);
  }

  long generation(UUID id) {
    return jdbc.queryForObject(
        "select generation from platform_broker_dispatches where id=?", Long.class, id);
  }

  @Test
  void rollbackCannotLeaveOrphanDispatchAndDuplicateEnqueueDoesNotReschedule() {
    assertThatThrownBy(
            () ->
                transactions.execute(
                    s -> {
                      enqueue(databaseNow());
                      throw new IllegalStateException("rollback");
                    }))
        .isInstanceOf(IllegalStateException.class);
    assertThat(
            jdbc.queryForObject("select count(*) from platform_broker_dispatches", Integer.class))
        .isZero();
    var resource = UUID.randomUUID();
    var command = new EnqueueJob(null, "SPEAKING_EVALUATION", resource, 1, "{}", databaseNow());
    UUID first = jobs.enqueue(UUID.randomUUID(), command, databaseNow());
    assertThat(jobs.enqueue(UUID.randomUUID(), command, databaseNow())).isEqualTo(first);
    assertThat(generation(dispatchId(first))).isEqualTo(1);
  }

  @Test
  void futureRetryAndStaleEnvelopeNeverSpendAnAttempt() {
    UUID id = enqueue(databaseNow().plusSeconds(600));
    UUID dispatch = dispatchId(id);
    assertThat(dispatches.claimJob(dispatch, 1, "jobs.speaking", "a", Duration.ofMinutes(2)))
        .isEmpty();
    jdbc.update("update platform_jobs set next_attempt_at=clock_timestamp() where id=?", id);
    long current = generation(dispatch);
    var job =
        dispatches
            .claimJob(dispatch, current, "jobs.speaking", "a", Duration.ofMinutes(2))
            .orElseThrow();
    assertThat(job.attempts()).isEqualTo(1);
    assertThat(dispatches.claimJob(dispatch, current, "jobs.speaking", "b", Duration.ofMinutes(2)))
        .isEmpty();
    jobs.finish(
        id,
        "a",
        job.leaseGeneration(),
        JobStatus.FAILED_RETRYABLE,
        "TEST",
        databaseNow().plusSeconds(600),
        databaseNow());
    assertThat(generation(dispatch)).isGreaterThan(current);
    assertThat(dispatches.claimJob(dispatch, current, "jobs.speaking", "b", Duration.ofMinutes(2)))
        .isEmpty();
    assertThat(
            dispatches.claimJob(
                dispatch, generation(dispatch), "jobs.speaking", "b", Duration.ofMinutes(2)))
        .isEmpty();
    assertThat(
            jdbc.queryForObject("select attempts from platform_jobs where id=?", Integer.class, id))
        .isEqualTo(1);
  }

  @Test
  void expiredWorkerCannotWriteAndFreshWorkerCan() {
    UUID id = enqueue(databaseNow());
    UUID dispatch = dispatchId(id);
    var old =
        dispatches
            .claimJob(dispatch, 1, "jobs.speaking", "old", Duration.ofMinutes(2))
            .orElseThrow();
    jdbc.update(
        "update platform_jobs set lease_until=clock_timestamp()-interval '1 second' where id=?",
        id);
    assertThat(dispatches.recoverExpired()).isEqualTo(1);
    var fresh =
        dispatches
            .claimJob(
                dispatch, generation(dispatch), "jobs.speaking", "fresh", Duration.ofMinutes(2))
            .orElseThrow();
    var invoked = new AtomicBoolean();
    assertThatThrownBy(
            () ->
                transactions.execute(
                    s ->
                        fence.execute(
                            old,
                            () -> {
                              invoked.set(true);
                              return jdbc.update("update test_fence_probe set value=99");
                            })))
        .isInstanceOf(JobLeaseLostException.class);
    assertThat(invoked).isFalse();
    transactions.execute(
        s -> fence.execute(fresh, () -> jdbc.update("update test_fence_probe set value=1")));
    assertThat(jdbc.queryForObject("select value from test_fence_probe", Integer.class))
        .isEqualTo(1);
  }

  @Test
  void leaseLostDuringDomainTransactionRollsBackDomainWrites() {
    UUID id = enqueue(databaseNow());
    var job =
        dispatches
            .claimJob(dispatchId(id), 1, "jobs.speaking", "a", Duration.ofMinutes(2))
            .orElseThrow();
    assertThatThrownBy(
            () ->
                transactions.execute(
                    s ->
                        fence.execute(
                            job,
                            () -> {
                              jdbc.update("update test_fence_probe set value=99");
                              jdbc.update(
                                  "update platform_jobs set lease_until=clock_timestamp()-interval '1 second' where id=?",
                                  id);
                              return null;
                            })))
        .isInstanceOf(JobLeaseLostException.class);
    assertThat(jdbc.queryForObject("select value from test_fence_probe", Integer.class)).isZero();
  }

  @Test
  void confirmedMessageCanBeClaimedOnlyOnceAndDeleteCascades() {
    UUID id = enqueue(databaseNow());
    var relay = new RabbitDispatchRelay(dispatches, rabbit, json, new SimpleMeterRegistry());
    relay.publish();
    Message message = rabbit.receive("heymimic.jobs.speaking.v1");
    assertThat(message).isNotNull();
    var envelope = json.readValue(message.getBody(), DispatchMessage.class);
    assertThat(
            dispatches.claimJob(
                envelope.dispatchId(),
                envelope.generation(),
                "jobs.speaking",
                "a",
                Duration.ofMinutes(2)))
        .isPresent();
    assertThat(
            dispatches.claimJob(
                envelope.dispatchId(),
                envelope.generation(),
                "jobs.speaking",
                "b",
                Duration.ofMinutes(2)))
        .isEmpty();
    jdbc.update("delete from platform_jobs where id=?", id);
    assertThat(
            jdbc.queryForObject("select count(*) from platform_broker_dispatches", Integer.class))
        .isZero();
  }

  @Test
  void returnedMessageIsRetriedEvenWhenBrokerConfirms() {
    UUID id = enqueue(databaseNow());
    jdbc.update(
        "update platform_broker_dispatches set routing_key='missing.route' where job_id=?", id);
    new RabbitDispatchRelay(dispatches, rabbit, json, new SimpleMeterRegistry()).publish();
    assertThat(
            jdbc.queryForObject(
                "select publish_attempts from platform_broker_dispatches where job_id=?",
                Integer.class,
                id))
        .isEqualTo(1);
    assertThat(
            jdbc.queryForObject(
                "select status from platform_broker_dispatches where job_id=?", String.class, id))
        .isEqualTo("PENDING");
  }

  @Test
  void publisherCrashAndLostBrokerMessageAreRecoverable() {
    UUID id = enqueue(databaseNow());
    var abandoned = dispatches.claimPublish().orElseThrow();
    jdbc.update(
        "update platform_broker_dispatches set available_at=clock_timestamp() where job_id=?", id);
    var replacement = dispatches.claimPublish().orElseThrow();
    assertThat(dispatches.published(abandoned)).isFalse();
    assertThat(dispatches.published(replacement)).isTrue();
    jdbc.update(
        "update platform_broker_dispatches set available_at=clock_timestamp() where job_id=?", id);
    assertThat(dispatches.claimPublish()).isPresent();
  }

  @Test
  void eventFanoutRetryAndReplayEachKeepDurableDispatch() {
    UUID eventId = UUID.randomUUID();
    events.append(
        eventId,
        new PublishEvent(null, "TEST", 1, UUID.randomUUID(), databaseNow(), "{}"),
        java.util.List.of("one", "two"),
        databaseNow());
    assertThat(
            jdbc.queryForObject("select count(*) from platform_broker_dispatches", Integer.class))
        .isEqualTo(2);
    var d = dispatches.claimPublish().orElseThrow();
    var event =
        dispatches
            .claimEvent(d.id(), d.generation(), d.routingKey(), "e", Duration.ofMinutes(2))
            .orElseThrow();
    assertThat(
            events.finish(
                event.deliveryId(),
                "e",
                event.leaseGeneration(),
                com.dev.heymimic.platform.domain.DeliveryStatus.FAILED_FINAL,
                "ERROR",
                null,
                databaseNow()))
        .isTrue();
    new JdbcDeliveryReplayStore(jdbc).requeueFinalDelivery(event.deliveryId(), databaseNow());
    assertThat(generation(d.id())).isGreaterThan(d.generation());
    assertThat(
            dispatches.claimEvent(
                d.id(), d.generation(), d.routingKey(), "e", Duration.ofMinutes(2)))
        .isEmpty();
  }

  @Test
  void deadLetterSurvivesMissingBindingUntilRouteIsRepaired() throws Exception {
    String route = "jobs.email";
    var binding =
        BindingBuilder.bind(new Queue("heymimic.jobs.email.dead.v1"))
            .to(new DirectExchange(RabbitTransportConfiguration.DEAD_EXCHANGE))
            .with(route);
    admin.purgeQueue("heymimic.jobs.email.dead.v1", false);
    admin.removeBinding(binding);
    try {
      var p = new MessageProperties();
      p.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
      var cd = new org.springframework.amqp.rabbit.connection.CorrelationData();
      rabbit.send(
          RabbitTransportConfiguration.EXCHANGE,
          route,
          new Message("invalid".getBytes(java.nio.charset.StandardCharsets.UTF_8), p),
          cd);
      assertThat(cd.getFuture().get(10, java.util.concurrent.TimeUnit.SECONDS).isAck()).isTrue();
      try (var channel = connection.createConnection().createChannel(false)) {
        var received = channel.basicGet("heymimic.jobs.email.v1", false);
        assertThat(received).isNotNull();
        channel.basicReject(received.getEnvelope().getDeliveryTag(), false);
      }
      assertThat(rabbit.receive("heymimic.jobs.email.dead.v1", 200)).isNull();
    } finally {
      admin.declareBinding(binding);
    }
    org.awaitility.Awaitility.await()
        // RabbitMQ's internal dead-letter retry defaults to a multi-minute interval.
        .atMost(Duration.ofMinutes(4))
        .untilAsserted(
            () -> assertThat(rabbit.receive("heymimic.jobs.email.dead.v1", 200)).isNotNull());
  }

  @Test
  void registrationJobsRunThroughRealRabbitListenerForTheirOwners(
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.test.web.servlet.MockMvc mvc,
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistry registry,
      @org.springframework.beans.factory.annotation.Autowired
          com.dev.heymimic.identity.infrastructure.email.InMemoryIdentityEmailSender sender)
      throws Exception {
    var listener =
        registry.getListenerContainers().stream()
            .map(c -> (org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer) c)
            .filter(
                c -> java.util.Arrays.asList(c.getQueueNames()).contains("heymimic.jobs.email.v1"))
            .findFirst()
            .orElseThrow();
    String first = "mq-a-" + UUID.randomUUID() + "@example.com";
    String second = "mq-b-" + UUID.randomUUID() + "@example.com";
    for (String email : java.util.List.of(first, second)) {
      String body =
          json.writeValueAsString(
              java.util.Map.of(
                  "name",
                  "MQ learner",
                  "email",
                  email,
                  "password",
                  "correct horse battery staple",
                  "timezone",
                  "UTC"));
      mvc.perform(
              org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                      "/api/v1/auth/register")
                  .with(
                      org.springframework.security.test.web.servlet.request
                          .SecurityMockMvcRequestPostProcessors.csrf()
                          .asHeader())
                  .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                  .content(body))
          .andExpect(
              org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                  .isCreated());
    }
    var relay = new RabbitDispatchRelay(dispatches, rabbit, json, new SimpleMeterRegistry());
    listener.start();
    try {
      org.awaitility.Awaitility.await()
          .atMost(Duration.ofSeconds(20))
          .untilAsserted(
              () -> {
                relay.publish();
                assertThat(
                        jdbc.queryForObject(
                            "select count(distinct owner_user_id) from platform_jobs where type='SEND_VERIFICATION_EMAIL' and status='SUCCEEDED'",
                            Integer.class))
                    .isEqualTo(2);
              });
      assertThat(sender.lastVerificationToken(first)).isPresent();
      assertThat(sender.lastVerificationToken(second)).isPresent();
      assertThat(sender.lastVerificationToken(first))
          .isNotEqualTo(sender.lastVerificationToken(second));
    } finally {
      listener.stop();
    }
  }
}
