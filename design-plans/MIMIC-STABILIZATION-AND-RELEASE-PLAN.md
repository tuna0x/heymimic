# HeyMimic — Kế hoạch sửa lỗi và nghiệm thu phần nền

Ngày: 09/09/2026. Trạng thái: **Đã triển khai core S0–S2 và phần auth của S3; còn chờ capability budget, integration/concurrency/provider smoke và browser E2E.**

Kế hoạch này ưu tiên sửa các lỗi của phần nền M0–M1 trước khi tiếp tục M2–M7 trong [kế hoạch vòng học cá nhân hóa](MIMIC-PERSONAL-LEARNING-LOOP-IMPLEMENTATION-PLAN.md). Không đánh dấu tính năng hoàn thành chỉ vì code đã build hoặc unit test đã qua.

## 1. Mục tiêu và phạm vi

Kết quả cần đạt: một người dùng mới có thể đăng ký, xác minh email, lấy từ vựng từ văn bản, ghi âm, nhận phản hồi và nghe lại bản ghi bằng dịch vụ thật trên staging. Khi hết ngân sách, provider lỗi hoặc người dùng thử lại, hệ thống phải giữ đúng trạng thái và số liệu chi phí.

Phạm vi gồm backend, frontend, migration, cấu hình môi trường, kiểm thử và tài liệu nghiệm thu. Chưa triển khai hội thoại AI, Daily Plan, Content Library hoặc evidence engine trong đợt sửa nền này.

Baseline đã kiểm tra ngày 09/09/2026:

- Backend: 115 test đạt qua `mvnw.cmd -q test`.
- Frontend: 39 test đạt; TypeScript và production build đạt.
- Đã tái hiện `ffprobe` trả `wav|1.000000`, trong khi adapter đang đọc cột đầu làm duration.
- Chưa có bằng chứng mới cho PostgreSQL integration/concurrency, browser E2E hoặc provider smoke thật.
- Compose hiện chỉ chạy PostgreSQL; không xem `docker compose up` là triển khai trọn ứng dụng.

## Trạng thái triển khai hiện tại

Đã triển khai trong lượt này:

- Parser audio dùng ffprobe JSON theo tên trường, không phụ thuộc thứ tự CSV; cấu hình env mẫu đã tách đúng comment.
- Budget cộng actual RECONCILED, giữ UNKNOWN/RESERVED, validate cấu hình khi bật và lưu rate-card snapshot V20.
- Account deletion chuyển phần chi phí chưa RELEASED sang bảng tổng hợp ẩn danh V19 trước khi purge.
- VerifyEmail deduplicate request theo token để an toàn với React StrictMode.
- Backend unit 115/115, frontend test 39/39, frontend build và lint (0 lỗi) đạt.

Còn chờ triển khai/nghiệm thu: capability budget frontend; PostgreSQL/Testcontainers vì môi trường hiện không có Docker daemon; concurrency/transaction test thật, ffprobe fixture trong runtime image, provider smoke staging, browser E2E và restore drill.
## 2. Thứ tự thực hiện

| Mốc | Công việc | Phụ thuộc | Điều kiện kết thúc |
|---|---|---|---|
| S0 | Chuẩn hóa cấu hình, trạng thái kế hoạch và baseline | Không | Env mẫu hợp lệ, tài liệu đọc đúng tiếng Việt |
| S1 | Sửa kiểm định audio | S0 | WAV và định dạng browser mục tiêu đi qua kiểm định thật |
| S2 | Sửa ngân sách và đối soát | S0 | Accounting, transaction và concurrency test đạt |
| S3 | Sửa xác minh email và trạng thái frontend | Contract lỗi của S2 | Không verify trùng; thông báo và retry đúng |
| S4 | Kiểm thử xuyên suốt trên staging | S1–S3 | Đủ bằng chứng signup → playback và các nhánh lỗi |
| S5 | Chốt nghiệm thu, tiếp tục roadmap | S4 | Không còn lỗi chặn; trạng thái M1 cập nhật đúng |

Ước lượng để sắp xếp công việc: S0 nửa ngày; S1 khoảng 1–2 ngày; S2 khoảng 3–5 ngày; S3 khoảng 1–2 ngày; S4–S5 khoảng 2–3 ngày. Đây là ước lượng ban đầu cho một người triển khai, chưa tính thời gian chờ môi trường và tài khoản provider. Cập nhật sau S0; không dùng ngày dự kiến thay cho điều kiện nghiệm thu.

## 3. S0 — Cấu hình và tài liệu

- [ ] Tách comment khỏi `STT_REQUEST_TIMEOUT=PT30S` trong `backend/.env.example`.
- [ ] Đối chiếu backend/frontend env mẫu với các configuration properties thực tế: đúng tên, kiểu, đơn vị và giá trị mặc định.
- [ ] Giữ budget tắt ở local; khi bật phải có cap dương và rate card hợp lệ. Không cho cấu hình thiếu ngầm trở thành miễn phí hoặc không giới hạn.
- [ ] Khôi phục UTF-8 của kế hoạch vòng học và các tài liệu bị lỗi tương tự. So sánh nội dung trước/sau, không thay chuỗi hàng loạt khi chưa xác định được encoding nguồn.
- [ ] Mở lại mục M1-B04 đang đánh dấu hoàn thành; ghi rõ lỗi accounting và test còn thiếu. M1 audio chưa được nghiệm thu cho tới khi S1/S4 đạt.
- [ ] Ghi rõ hướng dẫn chạy DB bằng Compose, chạy backend/frontend riêng và các điều kiện staging.

Không sửa lại nội dung migration V18 đã phát hành. Nếu cần thay schema, thêm migration tiếp theo còn trống; kiểm tra danh sách migration ngay trước khi tạo file.

Nghiệm thu: giá trị env mẫu bind được đúng kiểu; không có secret thật trong tài liệu; các file sửa mở bằng UTF-8 đọc đúng tiếng Việt.

## 4. S1 — Audio: metadata, định dạng và lỗi người dùng

### Backend

Các điểm chính: `S3AudioObjectStorage`, cấu hình S3/ffprobe, luồng xác nhận upload và test storage.

- [ ] Thay CSV bằng JSON: yêu cầu metadata có `format_name`, `duration` và thông tin stream cần thiết; parse bằng JSON mapper sẵn có. Không phụ thuộc thứ tự trường.
- [ ] Kiểm tra có audio stream, container được hỗ trợ, duration hữu hạn và dương; áp dụng giới hạn thời lượng/dung lượng đã thống nhất với API.
- [ ] Xác minh duration với file do MediaRecorder tạo. Nếu container không có duration ở cấp format, thử cách đo qua stream/packet có giới hạn thời gian; không tin duration do client gửi và không mặc định thành 0. Ghi quyết định sau thử nghiệm.
- [ ] Giữ quy trình HEAD → GET đúng version, kiểm tra số byte, checksum và playback cùng version đã seal.
- [ ] Phân biệt file không hợp lệ với lỗi hạ tầng: file hỏng/không hỗ trợ trả lỗi nghiệp vụ; ffprobe thiếu/timeout hoặc storage gián đoạn có mã lỗi vận hành riêng. Tránh trả stack trace.
- [ ] Giới hạn thời gian tiến trình, kích thước đầu ra và tài nguyên; dọn file tạm cả khi lỗi. Đọc output tránh đầy pipe làm tiến trình bị kẹt.

### Frontend

- [ ] Đối chiếu MIME thực tế từ MediaRecorder với MIME backend hỗ trợ; chọn định dạng theo khả năng browser.
- [ ] Thể hiện rõ đang upload, đang kiểm định, file bị từ chối và lỗi tạm thời.
- [ ] Giữ bản ghi local khi lỗi có thể thử lại; chỉ xóa sau khi người dùng bỏ hoặc luồng hoàn tất theo lifecycle hiện có.
- [ ] Không tự tạo upload/evaluation mới khi chỉ đang khôi phục một thao tác đã được server tiếp nhận.

### Kiểm thử và nghiệm thu

- Unit: metadata hợp lệ, thiếu duration, `N/A`, số không hữu hạn, thiếu audio stream, định dạng không hỗ trợ.
- Test bằng ffprobe thật với fixture WAV, WebM/Opus và MP4/AAC phù hợp browser mục tiêu; ít nhất một fixture được ghi bằng browser thật.
- Test version thay đổi, file quá lớn, ffprobe timeout/không có executable và file hỏng.
- Nghiệm thu: ghi âm → upload → seal → STT → playback đi qua staging; duration do server xác định, không còn lỗi thứ tự trường.

## 5. S2 — Budget và usage: tính đúng, giữ được khi retry/xóa tài khoản

### 5.1 Công thức và trạng thái

Với mỗi ngày UTC:

```text
spent = tổng actual_cost_micros của RECONCILED
held = tổng estimated_cost_micros của RESERVED và UNKNOWN
purged = chi phí đã chuyển sang số tổng hợp khi xóa dữ liệu người dùng
accounted = spent + held + purged
cho phép reservation mới khi accounted + estimate <= daily_limit
```

`RELEASED` không chiếm budget. Nếu chi phí thực tế vượt estimate, vẫn lưu đúng chi phí và chặn lời gọi tiếp theo; không cắt actual xuống bằng estimate/cap.

Cap là cơ chế kiểm soát trước lời gọi dựa trên ước lượng, không bảo đảm hóa đơn tuyệt đối không vượt cap. Để giảm chênh lệch, ràng buộc duration, kích thước input và max output tokens; ước lượng phải phản ánh các giới hạn đó và từng lần retry.

- [ ] Sửa phép tổng hợp ở `PlatformProviderBudgetService`; xử lý tràn số và không bỏ qua actual thiếu ở trạng thái đối soát.
- [ ] `RESERVED → RECONCILED` chỉ khi lời gọi thành công và có đủ dữ liệu tính phí.
- [ ] Thiếu dữ liệu hoặc timeout có khả năng đã tính phí → `UNKNOWN`, tiếp tục giữ estimate.
- [ ] Cho `UNKNOWN → RECONCILED` khi có usage đáng tin cậy. Không tự giải phóng UNKNOWN theo tuổi bản ghi.
- [ ] Chỉ `RELEASED` khi có bằng chứng chưa gọi provider hoặc không bị tính phí; ghi lý do. Trường hợp chưa có quy trình đối soát thì giữ khoản tiền và đưa vào runbook.

### 5.2 Rate card và metric

- [ ] Quy định metric bắt buộc theo stage: LLM cần đủ input/output tokens và metric có tính phí khác nếu cấu hình sử dụng; STT cần billable audio duration; TTS chỉ áp dụng khi thực sự tích hợp.
- [ ] Không dùng điều kiện “bất kỳ metric nào khác null”. Null là chưa biết; 0 chỉ hợp lệ khi provider thực sự báo 0.
- [ ] Chọn rate theo provider/model/stage, cùng đơn vị tiền và quy tắc làm tròn lên. Không dùng một giá chung cho các model có giá khác nhau.
- [ ] Lưu snapshot giá áp dụng cùng reservation hoặc tham chiếu một rate card bất biến; đối soát dùng đúng phiên bản này, không ghi đè bằng cấu hình sau deploy.
- [ ] Khi budget bật, validate cap, stage bắt buộc, estimate và rate. Giá 0 chỉ được phép theo chính sách miễn phí khai báo rõ; không là fallback khi thiếu cấu hình.
- [ ] Với reservation cũ chưa có snapshot: bảo toàn giá trị đang giữ, chỉ backfill khi xác định được rate card gốc. Nếu không xác định được, ghi trạng thái cần đối soát; không bịa số liệu lịch sử.

### 5.3 Transaction, idempotency và worker

- [ ] Reserve: khóa theo ngày UTC → đọc accounted → kiểm tra cap → insert trong cùng transaction trên cùng connection.
- [ ] Reconcile và chuyển chi phí khi xóa tài khoản dùng cùng cơ chế khóa theo ngày. Khi khóa nhiều ngày, khóa theo thứ tự tăng dần để tránh deadlock.
- [ ] Giữ khóa `(operation_id, stage, execution_attempt)`; cùng khóa không giữ tiền hai lần. Xác minh resource/user/operation phù hợp, không chấp nhận tái sử dụng khóa cho dữ liệu khác.
- [ ] Receipt và budget phải cập nhật nhất quán. Đề xuất đặt transaction ở coordinator ghi receipt/đối soát, qua Spring proxy thật.
- [ ] Receipt đến lại không hạ `SUCCEEDED` có usage đầy đủ xuống `UNKNOWN`; không đối soát hoặc tính tiền hai lần. Đây là hạng mục mở rộng cần kiểm tra vì recorder hiện upsert đè dữ liệu.
- [ ] Không mở transaction DB trong thời gian gọi HTTP provider. Nếu ghi receipt thất bại, reservation phải còn giữ tiền; phục hồi dựa trên checkpoint/receipt mà không tự phát sinh lời gọi có phí mới.
- [ ] Worker từ chối budget trước từng lời gọi. Retry là attempt có thể phát sinh chi phí mới và phải được cấp budget riêng.
- [ ] Giữ checkpoint STT khi feedback thiếu budget. Kiểm tra luồng retry có thể tiếp tục feedback trên cùng evaluation; tránh buộc ghi âm lại hoặc gọi STT lần nữa.

### 5.4 Xóa tài khoản và schema

Phương án cho đợt này: bổ sung bảng tổng hợp theo ngày, không chứa user/resource/job/provider-request identifier. Bảng giữ số tiền đã chi và khoản chưa xác định từ dữ liệu bị purge.

- [ ] Migration bổ sung snapshot rate cần thiết và bảng tổng hợp chi phí; tên/số migration chọn sau khi kiểm tra repo.
- [ ] Trong cùng transaction và khóa ngày: cộng phần đóng góp hiện tại của người dùng vào tổng hợp → xóa usage/reservations định danh. Tổng accounted trước/sau phải bằng nhau.
- [ ] Chạy cleaner lại không cộng hai lần; rollback giữa chừng không làm mất hoặc tăng tiền. Giữ guard job đang chạy và kiểm tra race với job mới nhận việc khi tài khoản đang xóa.
- [ ] Đối với UNKNOWN sau purge, giữ ước lượng bảo thủ trong tổng hợp. Không cố đối soát bằng việc giữ lại identifier cá nhân đã cam kết xóa.
- [ ] Quy định retention cho số tổng hợp và log vận hành; cập nhật ADR 0030 vì quyết định hiện tại đang xóa toàn bộ ledger của người dùng.

### 5.5 Test bắt buộc

| Tình huống | Kết quả mong đợi |
|---|---|
| Cap 100, estimate 60, success actual 60, reserve thêm 60 | Bị từ chối |
| Cap 100, estimate 60, actual 20, reserve thêm 60 | Được phép, accounted = 80 |
| Actual cao hơn cap | Lưu đúng actual; chặn call mới |
| UNKNOWN 60, reserve thêm 60 với cap 100 | Bị từ chối |
| LLM thiếu output tokens | Giữ UNKNOWN/estimate |
| Reserve/reconcile/receipt gửi lặp | Không cộng hai lần, không hạ trạng thái |
| Hai transaction đồng thời reserve 60 với cap 100 | Chỉ một reservation được chấp nhận |
| Xóa tài khoản, lặp cleaner, rollback giữa chừng | Accounted không bị mất hoặc cộng trùng |
| Deploy thay rate giữa reserve và reconcile | Dùng snapshot cũ |
| Qua nửa đêm UTC, receipt đến muộn | Đối soát đúng ngày reservation gốc |
| Budget bật nhưng thiếu cap/rate/stage | Cấu hình thất bại rõ ràng |

Integration test dùng PostgreSQL Testcontainers, Spring proxy hoặc TransactionTemplate thật; không gọi `new Service()` rồi giả định `@Transactional` có hiệu lực. Concurrency test dùng connection riêng và barrier điều phối, không dựa vào sleep ngẫu nhiên.

## 6. S3 — Frontend, xác minh email và trạng thái khả dụng

### Xác minh email

- [ ] Tách việc gửi verify khỏi effect dễ lặp bằng cơ chế chia sẻ request đang chạy theo token, dọn tham chiếu khi hoàn tất; không persist token vào localStorage hoặc log.
- [ ] Có thể bổ sung semantics backend: token VERIFY hợp lệ, chưa hết hạn và đã xác minh đúng tài khoản trả success khi gọi lại. Vẫn từ chối token sai/hết hạn; không áp dụng nguyên tắc này cho password reset.
- [ ] Khi token trên URL đổi, reset loading/error; bỏ qua response cũ. Sau thành công bỏ token khỏi URL bằng replace nhưng vẫn giữ màn thành công.
- [ ] Test render dưới StrictMode, double request, remount, token hết hạn/sai, đổi token, resend thành công/thất bại và lỗi mạng.

### Capability, quota và lỗi budget

- [ ] Giữ `/me/usage` cho quota cá nhân. Không trình bày quota cá nhân còn lượt như bảo đảm global budget còn tiền.
- [ ] Bổ sung trạng thái admission khả dụng cho speaking/context từ server: available/temporarily unavailable, reason code và retry/reset time khi biết. Không trả tổng ngân sách nội bộ cho người dùng.
- [ ] Admission trước ghi âm là kiểm tra sơ bộ, không giữ tiền xuyên thời gian người dùng ghi âm. Worker vẫn phải kiểm tra nguyên tử trước từng provider call; UI giải thích khi trạng thái thay đổi sau kiểm tra.
- [ ] Map `PROVIDER_BUDGET_EXCEEDED` thành “Tính năng đang tạm hết hạn mức xử lý”, không thành “Bạn đang thao tác quá nhanh”.
- [ ] Có nút tải lại khi bị chặn; refetch khi quay lại tab và sau mốc reset. Không giữ trạng thái quota hết lượt sang ngày mới vô thời hạn.
- [ ] Phân biệt đang tải, không tải được trạng thái và server xác nhận bị chặn. Lỗi đọc capability không thay thế kiểm tra phía server.
- [ ] Giữ bản ghi/kết quả STT khi retry feedback; kiểm tra idempotency key và checkpoint hiện có trước khi thêm endpoint mới.
- [ ] Nếu API thay đổi: cập nhật OpenAPI → sinh TypeScript → sửa service/hook/component cùng đợt, không chỉnh tay type generated.

Giữ hệ thống màu, spacing và component hiện có. Khi triển khai UI, kiểm tra keyboard, focus, status/alert, mobile/desktop và light/dark; không thiết kế lại toàn bộ trang trong đợt sửa lỗi.

## 7. S4 — Môi trường và nghiệm thu thật

### Công cụ và cấu hình cần có

| Nhu cầu | Dùng gì | Việc cần làm |
|---|---|---|
| Backend/DB | Java 21, Maven wrapper, PostgreSQL, Flyway hiện có | Chạy migrations từ DB trống và snapshot V18 |
| Audio | AWS SDK/S3 versioning, ffprobe/FFmpeg | Pin binary trong môi trường chạy; bucket private, IAM và CORS đúng origin |
| AI và email | Adapter Claude, Deepgram, Resend hiện có | Key staging, model/rate đã xác nhận, domain gửi email và callback URL đúng |
| Frontend | React/TypeScript, Yarn, Vitest hiện có | Thêm test lỗi nghiệp vụ, không thêm thư viện state/UI |
| E2E | Playwright; axe nếu chưa có | Thêm dev dependency bằng Yarn, smoke auth và recording/playback |
| DB concurrency | Testcontainers hiện có | Docker daemon hoạt động, transaction/connection thật |
| Quan sát | Logging/metrics và runbook hiện có | Theo dõi provider failures, held/spent/unknown, queue và audio inspection |

Không thêm Redis, Kafka, microservices hoặc AI framework cho phạm vi sửa lỗi này. Không gọi provider trả phí chỉ để thử cấu hình local; dùng staging đã được cấu hình với giới hạn chi phí rõ ràng.

### Ma trận smoke

- [ ] Signup → nhận email thật → verify → login.
- [ ] Forgot/reset password: token đúng, sai, hết hạn và đã sử dụng; mật khẩu cũ không đăng nhập được sau reset.
- [ ] Dán văn bản → extraction thật → chọn/lưu từ → tải lại vẫn còn dữ liệu.
- [ ] Ghi âm → upload → kiểm định → STT → feedback → playback đúng bản ghi.
- [ ] Quota cá nhân hết, global budget hết, provider timeout/429, mất mạng sau submit và reload giữa xử lý.
- [ ] Feedback bị chặn sau STT: khôi phục theo checkpoint, không mất bản ghi hoặc tự gọi STT lại.
- [ ] Mic bị từ chối, định dạng browser không hỗ trợ và audio đã hết retention có thông báo đúng.
- [ ] Người dùng B không đọc/phát/xóa bản ghi của A.
- [ ] Xóa tài khoản và audio trong bucket versioned; chi phí ngày vẫn giữ đúng. Ghi riêng phần orphan cleanup còn thiếu nếu phát hiện.

Mỗi lần nghiệm thu lưu môi trường, revision hoặc diff được kiểm tra, phiên bản provider/model, kết quả, request ID đã làm sạch và ảnh/log cần thiết. Không lưu token, API key, raw email/audio/transcript cá nhân vào report.

## 8. Các gói thay đổi có thể review

1. **Cấu hình và tài liệu:** env, UTF-8, trạng thái M1 và hướng dẫn chạy.
2. **Audio:** parse JSON, validation, mã lỗi, fixture và test ffprobe thật.
3. **Budget:** migration, rate snapshot, accounting, transaction, purge aggregate, concurrency test và ADR.
4. **Auth/capability frontend:** verify, trạng thái budget/quota, recovery, OpenAPI và test.
5. **Nghiệm thu:** E2E, staging smoke, runbook và cập nhật checklist.

Mỗi gói mô tả lỗi trước/sau, cách kiểm chứng, thay đổi contract/schema và giới hạn còn lại. Không triển khai migration phụ thuộc bằng cách bỏ qua gói budget; không rollback schema có dữ liệu để khôi phục code cũ. Khi lỗi vận hành, chặn việc AI mới bằng cơ chế admission/feature phù hợp, giữ luồng đọc/phát lại và số liệu; tắt budget không phải cách dừng chi phí.

## 9. Điều kiện hoàn thành và quay lại roadmap

- [ ] Tất cả lỗi P1 trong review được sửa và có test bắt lỗi phiên bản cũ.
- [ ] Các P2 về purge chi phí, usage thiếu và verify lặp được xử lý.
- [ ] Backend unit/format/architecture checks, frontend test/build/lint đạt; ghi rõ cảnh báo còn tồn tại từ baseline.
- [ ] PostgreSQL migration, transaction/concurrency và deletion test đạt. `mvnw.cmd test` không được dùng thay cho integration gate `mvnw.cmd verify`.
- [ ] Browser E2E và provider smoke staging đạt ma trận S4; mục chưa chạy phải ghi là chưa nghiệm thu.
- [ ] ADR, env, OpenAPI, README và trạng thái kế hoạch phản ánh đúng kết quả.
- [ ] Không có regression luồng vocabulary, speaking và auth hiện hành; có hướng phục hồi lỗi triển khai đã thử.

Sau khi các gate đạt: tiếp tục M2 (nguồn bài nói, brief và dữ liệu evidence) → M3 (chữa lỗi bằng nói lại) → M4/M5 (nội dung cá nhân và bài học hôm nay) → M6/M7 (hội thoại và tiến bộ). Giữ thứ tự chi tiết và acceptance criteria của kế hoạch sản phẩm gốc; không coi đợt sửa nền này là hoàn thành năm tính năng mới.
