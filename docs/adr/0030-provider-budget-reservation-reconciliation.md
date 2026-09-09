# ADR 0030 — Global provider budget reservation và reconciliation

- **Trạng thái:** Đã chấp nhận cho M1-B04 budget slice; transaction/concurrency staging còn chờ nghiệm thu
- **Ngày:** 2026-09-09
- **Phạm vi:** chặn chi phí provider trước call và đối soát sau usage receipt
- **Liên quan:** ADR 0029, M1-Q01 provider smoke, migration V19–V20

## Quyết định

- Lưu reservation trong platform_provider_budget_reservations, khóa duy nhất theo (operation_id, stage, execution_attempt).
- Worker reserve estimated cost trước khi gọi STT/LLM. Reservation dùng UTC budget date và PostgreSQL advisory lock để các worker cạnh tranh không vượt daily cap.
- Budget accounted gồm actual cost của RECONCILED, estimated cost của RESERVED/UNKNOWN, và tổng hợp ẩn danh trong platform_provider_budget_purge_totals.
- Receipt SUCCEEDED chỉ chuyển sang RECONCILED khi provider trả đủ metric theo stage. Receipt UNKNOWN hoặc thành công nhưng thiếu metric chuyển reservation sang UNKNOWN; estimated budget vẫn được giữ.
- Reservation lưu rate_card_version cùng snapshot các đơn giá metric ở migration V20. Reconcile dùng snapshot lúc reservation, không dùng giá cấu hình mới sau deploy.
- PROVIDER_BUDGET_ENABLED=false mặc định để local/dev không bị chặn bởi giá giả. Khi bật phải cấu hình daily cap, estimate theo operation/stage và rate card hợp lệ.
- Account deletion cộng chi phí chưa RELEASED vào bảng tổng hợp theo ngày trong cùng transaction rồi mới xóa usage/reservation định danh. Bảng tổng hợp không chứa user/resource/job/provider request identifier và không cộng trùng khi cleaner chạy lại.
- RELEASED chỉ dành cho reservation có bằng chứng provider chưa được gọi; trường hợp không biết provider có tính phí hay không giữ ở UNKNOWN.

## Giới hạn

Rate card vẫn là configuration theo metric, chưa có bảng quản trị nhiều provider/model. Daily cap là admission control dựa trên estimate; hóa đơn provider có thể lệch nếu estimate hoặc metadata provider không đầy đủ. Provider smoke staging, test PostgreSQL concurrency, browser E2E và restore drill vẫn là release gates.

## Kiểm tra bắt buộc trước production

- Test liên tiếp: chi phí RECONCILED tiếp tục chiếm daily cap.
- Test thiếu output/input/audio metric giữ UNKNOWN.
- Test hai transaction đồng thời không vượt cap.
- Test deploy đổi rate giữa reserve/reconcile vẫn dùng snapshot cũ.
- Test purge tài khoản giữ nguyên tổng accounted, cleaner lặp không cộng trùng.