package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.port.QuotaReservation;
import com.dev.heymimic.platform.application.port.QuotaStore;
import com.dev.heymimic.platform.application.publicapi.ReserveQuota;
import com.dev.heymimic.platform.domain.QuotaReservationStatus;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcQuotaStore implements QuotaStore {
  private static final String SELECT_COLUMNS =
      "id, user_id, resource_id, quota_kind, amount, status, quota_date";

  private final JdbcTemplate jdbc;

  public JdbcQuotaStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public Optional<QuotaReservation> findByResource(UUID resourceId, String quotaKind) {
    List<QuotaReservation> reservations =
        jdbc.query(
            "select "
                + SELECT_COLUMNS
                + " from platform_quota_reservations where resource_id = ? and quota_kind = ?",
            this::mapReservation,
            resourceId,
            quotaKind);
    return reservations.stream().findFirst();
  }

  @Override
  public Optional<QuotaReservation> findById(UUID reservationId) {
    List<QuotaReservation> reservations =
        jdbc.query(
            "select " + SELECT_COLUMNS + " from platform_quota_reservations where id = ?",
            this::mapReservation,
            reservationId);
    return reservations.stream().findFirst();
  }

  @Override
  public void lockBucket(UUID userId, String quotaKind, LocalDate quotaDate) {
    String bucket = userId + "|" + quotaKind + "|" + quotaDate;
    jdbc.query("select pg_advisory_xact_lock(hashtextextended(?, 0))", result -> null, bucket);
  }

  @Override
  public int usedAmount(UUID userId, String quotaKind, LocalDate quotaDate) {
    Integer used =
        jdbc.queryForObject(
            """
            select coalesce(sum(amount), 0)
            from platform_quota_reservations
            where user_id = ? and quota_kind = ? and quota_date = ?
              and status in ('RESERVED', 'CONSUMED')
            """,
            Integer.class,
            userId,
            quotaKind,
            Date.valueOf(quotaDate));
    return used == null ? 0 : used;
  }

  @Override
  public UUID insert(UUID reservationId, ReserveQuota command, LocalDate quotaDate, Instant now) {
    jdbc.update(
        """
        insert into platform_quota_reservations
          (id, user_id, resource_id, quota_kind, amount, status, quota_date, created_at, updated_at)
        values (?, ?, ?, ?, ?, 'RESERVED', ?, ?, ?)
        """,
        reservationId,
        command.userId(),
        command.resourceId(),
        command.quotaKind(),
        command.amount(),
        Date.valueOf(quotaDate),
        Timestamp.from(now),
        Timestamp.from(now));
    return reservationId;
  }

  @Override
  public boolean transition(
      UUID reservationId,
      UUID userId,
      QuotaReservationStatus expected,
      QuotaReservationStatus target,
      Instant now) {
    return jdbc.update(
            """
            update platform_quota_reservations set status = ?, updated_at = ?
            where id = ? and user_id = ? and status = ?
            """,
            target.name(),
            Timestamp.from(now),
            reservationId,
            userId,
            expected.name())
        == 1;
  }

  private QuotaReservation mapReservation(ResultSet result, int rowNumber) throws SQLException {
    return new QuotaReservation(
        result.getObject("id", UUID.class),
        result.getObject("user_id", UUID.class),
        result.getObject("resource_id", UUID.class),
        result.getString("quota_kind"),
        result.getInt("amount"),
        QuotaReservationStatus.valueOf(result.getString("status")),
        result.getObject("quota_date", LocalDate.class));
  }
}
