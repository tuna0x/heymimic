# HeyMimic — Luyện nói cùng nhau, tiến bộ theo cách riêng

Ngày: 2026-09-10. Trạng thái: kế hoạch thực thi, chưa triển khai sản phẩm.
Written against: 86816decaa26dea5fac8b8c1bd7ad6ffff1c01fa và working tree có MQ/Redis/daily planner chưa commit.

## 1. Quyết định sản phẩm

Biến Speaking thành nơi chọn hoạt động giao tiếp có mục tiêu. Trải nghiệm chủ đạo: hai người thực hiện một nhiệm vụ chung; sau phiên, mỗi người nhận phản hồi và bài luyện riêng.

Người dùng đã yêu cầu cải thiện Speaking, kết nối người học với nhau và lập plan sau khảo sát đối thủ. Đây là ưu tiên sản phẩm mới, thay đổi quyết định postpone peer trước đây; không phải yêu cầu xây toàn bộ mạng xã hội.

Mặc định đề xuất cho bản đầu:
- Tiếng Anh, giao diện tiếng Việt; pilot người lớn 18+, 10–20 người được mời. Nội dung công sở/phỏng vấn và giao tiếp đời thường.
- Audio 1–1, mời bạn bằng link; hai tài khoản đã xác thực email. Ghép người lạ và video nằm ở giai đoạn sau.
- Hội thoại 8 phút, thêm tối đa 1 phút đọc vai trước start; recap sau phiên không tính vào 8 phút.
- Sáu tình huống biên soạn, mỗi tình huống có hai biến thể gợi ý A2–B1 và B1–B2. Đây là định hướng nội dung, không phải chứng nhận trình độ.
- Hai mốc: alpha gọi thật trước; pilot có phản hồi riêng và vòng luyện lại sau.
- Chưa mua dịch vụ hoặc triển khai public trong task lập plan. Chốt version/provider/chi phí bằng technical spike.

## 2. Evidence chain và hiện trạng

Đường dẫn tương đối từ repository root. Đã đọc source, chưa kiểm tra render trong phiên lập plan này. Nhận xét basic đến từ người dùng; bố cục mới là đề xuất thiết kế, không phải visual audit đã nghiệm thu.

| Source | Hiện trạng đã xác minh | Hệ quả |
|---|---|---|
| frontend/src/route/AppRoutes.tsx, routePaths.ts | Speaking/dialogue/peer routes nằm trong AppShell sau ProtectedRoute | Tái sử dụng route owner, xử lý lời mời qua login |
| frontend/src/pages/Speaking.tsx | Solo: topic, record, upload, evaluate, complete; có Study/review integration | Giữ luồng solo thật và completion Study khi thay landing |
| frontend/src/pages/SpeakingDialogue.tsx:63 | handleSimulateUserTurn dùng timer hiện tiếp kịch bản | Không dùng làm fallback AI thật |
| frontend/src/pages/PeerPractice.tsx | Matching timer/random; số online 18 viết cố định | Thay bằng mời bạn thật, không trình bày online giả |
| frontend/src/pages/PeerRoom.tsx; store/slices/createEcosystemSlice.ts | Peer sessions dựa mocks/state/localStorage | Cần media, lifecycle và persistence mới |
| frontend/src/components/speaking/SecretMissionCard.tsx; Speaking.tsx:148 | Cụm từ cố định; phát hiện bằng substring | Phát hiện từ không đồng nghĩa dùng đúng ngữ cảnh |
| backend/.../learner/api/CapabilityController.java | Có dailyPlan/dialogue/learningEvidence, chưa có peer | Capability server/client mới |
| backend/.../platform/infrastructure/messaging/ | Có queue/relay/dispatch/fence | Tái sử dụng cho hậu kỳ; cần integration verification |
| backend/.../study/application/DailyPlanService.java | Rule-only planner, sourceBriefId unsupported | Peer/evidence/retry cần contract mới, không tự coi đã nối |

### Design language

- Audited surface: Speaking hub → peer setup → lobby → room → personal recap; solo/history/Study là regression surfaces.
- Design sources: docs/PROJECT.md mục 5; frontend/src/styles/index.css được import bởi main.tsx; AppShell và components/shared/UI.tsx.
- Documented decisions: căn trái, một khu vực chính, cyan thông tin phụ, một CTA cam đất chủ đạo, chuyển động có mục đích; không mọi khối thành card giống nhau hoặc social proof giả.
- Governing owners and consumers: styles/index.css → AppShell/Sidebar → AppRoutes → Speaking/Peer; UI.tsx sở hữu SectionLabel/StatusPill.
- Runtime: study-primary là cyan, study-accent là cam đất qua --warm. Bảng tên accent trong PROJECT.md khác alias runtime; dùng alias runtime hiện có, không đổi global palette trong task này. font-display hiện resolve Plus Jakarta Sans trước Space Grotesk.
- Explicit exceptions: None documented.

### Findings đủ bằng chứng về presentation

| # | Problem | Evidence | Proposed change | Scope | Confidence |
|---|---|---|---|---|---|
| 1 | Số online giả trình bày như dữ liệu thật | PeerPractice render số 18 qua AppRoutes; PROJECT.md không cho social proof giả | Bỏ số online ở bản invite-only; chỉ đưa lại khi có nguồn presence thật, có độ mới xác định | PeerPractice header | Cao |

Improve first: bỏ tín hiệu cộng đồng giả khỏi peer entry. Khoảng trống media/AI là chức năng cần xây, không phân loại thành lỗi thẩm mỹ.

## 3. Tham khảo đối thủ

Tài liệu công khai, chưa trải nghiệm account trả phí. Lựa chọn HeyMimic là suy luận thiết kế; không tuyên bố đối thủ hoàn toàn thiếu các khả năng đề xuất.

| Nguồn | Điều công bố | Áp dụng |
|---|---|---|
| [HelloTalk](https://www.hellotalk.com/en/features/voiceroom) | Phòng nói nhóm, có thể nghe trước | Phòng nhóm có lịch ở giai đoạn sau |
| [Tandem](https://tandem.net/en) | Tìm bạn; text/voice/audio/video; sửa câu và dịch | Mời bạn, hỗ trợ khi bí từ, gặp lại |
| [Episoden](https://www.episoden.com/en/introduce) | Phiên 1–1 7 phút, có chủ đề | Phiên ngắn có kết thúc rõ; HeyMimic đề xuất 8 phút |
| [Speak](https://help.speak.com/en/articles/13182402-free-talk-immersive-roleplay) | Bối cảnh/nhân vật, hint, sửa và retry lượt nói | Vai, mục tiêu, trợ giúp và luyện lại; chưa đầu tư 3D |
| [Duolingo](https://blog.duolingo.com/video-call/) | AI hội thoại có nhân vật, có thể xin nhắc lại/chậm hơn | Giảm áp lực, trợ giúp khi cần; AI dialogue là nhánh riêng |

Điểm khác biệt cần kiểm chứng: nhiệm vụ chung có thông tin riêng + bạn thật + phản hồi riêng dẫn tới bài luyện phù hợp.

## 4. Phạm vi từng mốc

| Mốc | Bao gồm | Gate |
|---|---|---|
| A — Alpha nội bộ | Hub, six scenarios, invitation, lobby, audio 1–1, vai/phases, reconnect/end, report/block | Hai user thật trên hai thiết bị/mạng hoàn thành nhiệm vụ |
| B — Pilot cá nhân hóa | Consent, audio theo participant, hậu kỳ, recap riêng, own retry/recommendation, context update và lịch sử peer | Không chéo dữ liệu, evidence có căn cứ, retry không ghi đúp |
| C — Học cùng người quen | Buddy hai bên đồng ý, hẹn giờ, in-app invites, voice challenge bất đồng bộ | Có người quay lại cùng bạn; không cần online đồng thời |
| D — Cộng đồng | Matching theo mục tiêu/lịch/trình độ, phòng 3–4 người có host | Đủ mật độ người, vận hành và moderation |

A không quảng bá là có AI feedback. B hoàn thành mới đóng mục tiêu pilot của plan. C/D là roadmap có điều kiện, không nằm ngầm trong estimate A/B. Ngoài A/B: public feed, inbox mở, avatar 3D, video call, AI can thiệp liên tục, ranking người học.

## 5. Luồng học và nội dung

1. Hub ưu tiên resume active session, sau đó feedback mới, sau đó nhiệm vụ gợi ý.
2. Chọn scenario, xem common objective/roles/difficulty/time; tạo phiên và copy link.
3. Người nhận login, accept. Chỉ member mới nhận private role. Invitation invalid không tiết lộ roster.
4. Lobby: mic test, nghe tiếng thử, vai, ready. Host chọn vai; guest nhận vai còn lại. Swap trước start reset ready cả hai.
5. Start khi hai người ready và server xác nhận media connected. Host rời trước start thì hủy/chờ expire, MVP không tự chuyển host.
6. Trong phiên: 60s mở đầu, 180s trao đổi, 180s xử lý biến cố, 60s chốt phương án.
7. Server hết giờ/end sớm. End sớm ghi incomplete; self-report đạt mục tiêu không là AI score.
8. Recap chung tối thiểu, feedback riêng nếu đủ consent/audio/capability.
9. Chọn luyện lại một câu hoặc mời học tiếp; lần tiếp là session mới, snapshot và consent mới.

| Scenario | Vai | Mục tiêu | Thông tin riêng/biến cố |
|---|---|---|---|
| Thương lượng deadline | Người phụ trách dự án / khách hàng | Chốt phạm vi và ngày bàn giao | Thiếu nhân lực nhưng phải giữ ngày ra mắt |
| Phỏng vấn | Ứng viên / người phỏng vấn | Làm rõ thành tựu và cách xử lý vấn đề | Câu hỏi follow-up và ví dụ riêng |
| Cứu đơn hàng | Hỗ trợ / khách hàng | Chọn giải pháp đơn giao sai | Chính sách hoàn tiền và deadline khác nhau |
| Chuyến đi cuối tuần | Hai người bạn | Chốt lịch với ngân sách chung | Mỗi người giữ ưu tiên/giới hạn |
| Chọn cách làm việc | Hai đồng nghiệp | Đề xuất lịch cho đội | Đổi góc nhìn; hỏi rõ trước phản biện |
| Tìm đồ thất lạc | Khách / nhân viên hỗ trợ | Tìm đúng vật và điểm nhận | Mỗi bên giữ một phần manh mối |

Scenario gồm id/version, common brief, private briefs, observable objectives, phase/twist/hints, difficulty và rubric version. Hint 1 gợi ý ý tưởng, hint 2 khung câu. Ghi assistance level; đọc hint không được coi nói độc lập. Nội dung được biên soạn/review, không gọi LLM mỗi lần mở thẻ.

## 6. Design decision và routes

### Bố cục

- Hub: một nhiệm vụ chủ đạo; catalog tình huống có hình bối cảnh, vai, mục tiêu, độ khó/thời lượng; mục luyện lại từ phiên trước. Lịch hẹn chỉ hiện khi thực có dữ liệu. Không avatar giả làm người online.
- Desktop room: hai participant tiles + nhiệm vụ chung ở trung tâm, role/hint riêng bên cạnh; toolbar mic/kết nối/trợ giúp/rời luôn dễ truy cập.
- Mobile: hai tile gọn, nhiệm vụ một cột, role/hint trong sheet; toolbar tránh safe area/bàn phím, không phụ thuộc hover.
- Lobby: ai đã vào, mic test, ready, expiry/link khi chờ; không radar ghép bạn giả.
- Recap: trạng thái phiên trước, tối đa hai điểm tốt/hai correction/một retry CTA. Tách peer compliment khỏi hệ thống đánh giá; không so xếp hạng hai người.
- Không tự phát ambient sound vào cuộc gọi. Waveform chỉ phản ánh audio thật, reconnect có copy rõ. Hint mở khi cần, tránh transcript chiếm trung tâm.

### Route migration

| Route | Chức năng |
|---|---|
| /speaking | Hub mới, không tự xin microphone |
| /speaking/solo | Chuyển recorder hiện có từ Speaking.tsx, giữ upload/evaluate/Study completion |
| /peer-practice | Setup/catalog/create invite trên PeerPractice.tsx hiện có |
| /peer-practice/room/:sessionId | Lobby và room theo server state, reload phục hồi |
| /peer-practice/session/:sessionId/recap | Common summary + own feedback |
| /peer-practice/join#token=... | Entry lời mời, token trong fragment; login/accept bằng POST body |
| /speaking/dialogue | Giữ deep link, capability unavailable có copy đúng; không giả AI fallback |

Route cũ /peer-practice/room: truy vấn active session caller; có thì chuyển canonical, không có về setup. Link mời được đọc vào memory/sessionStorage tạm để qua login, bỏ fragment khỏi URL; xóa sau accept/logout, không đưa vào log/analytics/persistent Zustand.

Rà toàn bộ link/navigate Dashboard/Study/history trỏ /speaking; flow đang học phải vào recorder/resume đúng, không bị đẩy về catalog.

### Reuse, changes và scope

- Dùng AppShell, Sidebar, SectionLabel, StatusPill, ApiErrorNotice, CapabilityNotice đúng ngữ nghĩa; tokens study-*, font-display/font-sans/tabular-nums hiện có.
- Exemplars: SpeakingContextCard cho context; SpeakingAnalysisSection cho feedback. Không dùng metric demo làm kết quả.
- Tạo components/peer: ScenarioCard, ParticipantTile, RoleBriefPanel, RoomControls, ConnectionStatus, PeerRecap. Chưa cần global primitive mới.
- Sửa AppRoutes.tsx, routePaths.ts, AppShell page titles, Sidebar/mobile nav cho một flow canonical.
- Thêm peerService.ts, usePeerRoom.ts, generated DTO. Thay production peer actions trong createEcosystemSlice; dữ liệu localStorage cũ chỉ là demo, không migrate thành học thật.
- Inherit: hub/setup/lobby/room/recap. Verify: solo/history/Study/auth/theme/logout. Exclude: marketing/video/writing/listening/global palette.

### Trạng thái bắt buộc

| State | UI/action |
|---|---|
| Capability off | Giới thiệu đúng phạm vi; solo vẫn truy cập được |
| Chờ bạn/không có bạn | Link và thời hạn; hủy phiên chờ trước khi luyện solo |
| Invite hết hạn/thu hồi/đã dùng | Thông báo chung, về Speaking; không lộ roster |
| Room full/user có phiên | Không join; mở đúng active session của caller |
| Mic denied/no device | Hướng dẫn quyền/thử lại, không giả ready |
| Autoplay chặn remote audio | Nút bật âm thanh |
| Partner disconnect | Cửa sổ reconnect 60s; server pause phase |
| Quá reconnect window | End incomplete, không tự thay partner |
| Feedback pending/failed/quota | Trạng thái riêng, conversation không bị rollback |
| Consent không đủ | Call không recording, recap tối thiểu |
| Logout/account switch | Stop mic/disconnect, abort requests/streams, clear room/token cache |

## 7. Kiến trúc

Giữ modular monolith Spring Boot; tạo module peer theo api/application/domain/infrastructure. Room hai owner không nhét vào speaking session solo. Các module trao đổi publicapi/event, không truy cập chéo persistence.

~~~mermaid
flowchart LR
  A[Browser A] <-->|WebRTC audio| M[Media server]
  B[Browser B] <-->|WebRTC audio| M
  A -->|REST + SSE| P[Peer module]
  B -->|REST + SSE| P
  P --> DB[(PostgreSQL)]
  P --> R[(Redis presence)]
  M -->|Signed webhook| P
  M -->|Consented participant audio| S[Private storage]
  DB --> Q[RabbitMQ dispatch]
  Q --> W[STT + feedback workers]
  W --> S
  W --> DB
  W --> C[Own user context]
~~~

- WebRTC/media server vận chuyển audio; RabbitMQ cho hậu kỳ, Redis cho presence ngắn hạn.
- Spike mặc định LiveKit qua PeerMediaGateway, ưu tiên managed pilot, không tự xây SFU/TURN. Chốt provider/version/region/cost bằng S0; chưa mua gói.
- LiveKit token có room/identity/grants. Expiry không thay thế kick/revoke đang kết nối; server cần đóng room/remove participant và không cấp lại token. [Tokens](https://docs.livekit.io/frontends/reference/tokens-grants/)
- Egress có khả năng export room/individual tracks. Chọn mode ghi bảo toàn participant identity qua reconnect bằng spike; không trộn hai giọng rồi đoán ownership. [Egress](https://docs.livekit.io/transport/media/ingress-egress/egress/)
- Webhook server SDK xác thực; inbox dedup và provider reconciliation, không giả định delivery đúng một lần. [Webhooks](https://docs.livekit.io/intro/basics/rooms-participants-tracks/webhooks-events/)
- SDK client lo mic/remote tracks/network. REST + fetch SSE có Authorization theo auth hiện có; không JWT query string. SSE chỉ state/version đúng audience, không gửi private role/transcript đối tác; mất stream GET resync. Polling 2s chỉ khi room foreground và SSE unavailable.
- DB quyết định membership/consent/phases/terminal. Redis heartbeat TTL 30s, không transcript; Redis down dùng provider/DB reconciliation, không cấp membership dựa cache.
- Phase deadline server; client render countdown theo serverNow. Reload không kéo dài thời gian bằng timer local.

## 8. State machine và invariants

Room: WAITING → READY → ACTIVE → ENDED; trước start có thể CANCELLED/EXPIRED. READY khi đủ hai người ready/media connected, mất ready quay WAITING.
Phases ACTIVE: OPENING → EXCHANGE → TWIST → AGREEMENT.
Participant: JOINING/CONNECTED/RECONNECTING/LEFT, độc lập room state.
Feedback/user: NOT_REQUESTED/WAITING_AUDIO/QUEUED/PROCESSING/READY/INSUFFICIENT_AUDIO/FAILED/CANCELLED.

Reconnect pause lưu remaining duration; đủ hai người thì CAS resume một lần. Scheduler đóng stale rooms; hard wall limit 12 phút kể từ start. ENDED có endReason và selfReportedObjective riêng.

Invariants có transaction/DB constraint và tests:
1. Tối đa hai learner: unique(session,slot 1/2), unique(session,user); media token chỉ cho slot đã được nhận. Recorder service identity không tính learner.
2. User tối đa một peer session chưa terminal: active reservation theo user; release cùng terminal transaction, không Redis-only lock.
3. Invite accept atomically lock room, kiểm tra token hash/expiry/block/state/slot; hai guest concurrent chỉ một thắng.
4. Scenario/roles snapshot; client chỉ common + own role, không tải hai private briefs rồi CSS hide.
5. Start/end/swap/ready có expectedVersion; duplicate idempotency command trả cùng effect. Profile/scenario đổi không sửa ACTIVE.
6. Media identity ổn định/user/session; một active device. Duplicate tab bị từ chối hoặc thay thiết bị có thao tác rõ.
7. End/block/leave dừng cấp token, remove/disconnect provider bằng durable cleanup intent + reconcile khi outage; tránh DB closed nhưng audio vô hạn.
8. Không tự tạo Study/solo child. Active-session guard phải hai chiều peer và solo/Study/vocabulary qua public contract và reservation chung; kiểm tra đồng thời hai tab trong S2, không chỉ check-before-insert.
9. Host owner không có quyền đọc own-feedback của guest. Không trả asset/transcript/role riêng qua SSE chung.

## 9. Schema và API đề xuất

Số migration chọn tại lúc thực thi: working tree hiện V21–V23, không sửa migration đã áp dụng.

| Table đề xuất | Trách nhiệm |
|---|---|
| peer_scenarios / peer_scenario_versions | Published catalog/common/private roles/rubrics/hints/phases versions |
| peer_sessions | Host/scenario snapshot/version/phases/times/endReason/media ref/cleanup |
| peer_participants | User/slot/role/ready/connection/opaque media identity, unique slot/user |
| peer_active_reservations | User PK/session; acquire/release atomically; shared active policy S2 |
| peer_invites | Token hash/expiry/acceptedBy/revokedAt, không raw token |
| peer_consents | Session/user/purpose/policyVersion/grant/revoke audit |
| peer_media_assets | Owner/track/segment/private key/checksum/consentVersion/retention/delete state |
| peer_evaluations / peer_feedback_items | Owner/session/input manifest version/job/status/rubric; quotes/time spans/corrections |
| peer_webhook_inbox | Provider event id unique/minimal payload/status/reconcile |
| peer_blocks / peer_reports | Block direction, report category/details/status/operator audit |

Namespace /api/v1/peer. Owner từ JWT; CSRF theo hiện có. Idempotency-Key cho create/accept/start/end/retry. GET không ghi business state.

| Endpoint | Contract |
|---|---|
| GET /scenarios | Public fields, published, filter/pagination |
| POST /sessions | scenarioVersionId; host reservation+WAITING |
| GET /sessions/active | Active caller hoặc null |
| GET /sessions/{id} | Member only; common + own role + version/serverNow |
| POST /sessions/{id}/invites | Host; token trả một lần, expiry mặc định 15m; issue mới revoke cũ |
| POST /invites/accept | Token trong body, auth, claim slot atomic |
| PATCH /sessions/{id}/ready | Own ready/expectedVersion, server media check |
| POST /sessions/{id}/swap-roles | Host trước start; reset ready hai bên |
| POST /sessions/{id}/media-token | Membership/block/capability/state; room-scoped mic-only grant |
| POST /sessions/{id}/start | Host, version, đủ hai ready/connected, phase timing |
| GET /sessions/{id}/events | Auth SSE, versioned state, resync |
| POST /sessions/{id}/end | Participant, version/reason; duration server/cleanup intent |
| PUT /sessions/{id}/consent | Purpose/policy/granted; revoke xử lý mục 10 |
| GET /sessions/{id}/recap | Common minimal + own evaluation, không partner raw data |
| POST /sessions/{id}/feedback/retry | Own retryable result, quota/asset/consent checks, không bản sao |
| POST /sessions/{id}/reports | Participant, bounded details/category |
| POST/DELETE /blocks/{userId} | Block/unblock; enforce pending invite/current room |
| POST /integrations/livekit/webhook | Ngoại lệ JWT/CSRF hẹp; bắt buộc signed provider body |

Lỗi: PEER_CAPABILITY_DISABLED, ACTIVE_SESSION_EXISTS, PEER_ROOM_FULL, PEER_INVITE_INVALID, PEER_SESSION_VERSION_CONFLICT, PEER_MIC_NOT_READY, PEER_PARTNER_DISCONNECTED, PEER_MEDIA_UNAVAILABLE, PEER_FEEDBACK_UNAVAILABLE.
Room/asset không thuộc caller trả 404 không lộ existence; invalid invite/blocked không tiết lộ partner. Error envelope theo shared contract. OpenAPI có examples waiting/active/ended và feedback pending/failed.

## 10. Consent, feedback và learning loop

### Dữ liệu

- Alpha không ghi âm. Pilot chỉ ghi khi cả hai consent trước start; recording indicator theo server/provider ACK, không theo local click.
- Một người từ chối: vẫn call, không recording/STT/AI recap cho cả hai; recap metadata/self-report.
- Revoke trong phiên: dừng recording cả phòng, hủy evaluation chưa công bố, xóa audio và dữ liệu phân tích phiên qua workflow; callback sau network call phải recheck cancellation/consent.
- Default pilot đề xuất raw audio 7 ngày, transcript/feedback 30 ngày, xóa sớm theo user action. Metadata duration tối thiểu theo progress policy hiện có. Ghi rõ trong settings/consent; đây là sản phẩm đề xuất, chưa phải kết luận pháp lý.
- Playback private TTL ngắn, ownership mỗi lần, chỉ audio caller. Không log transcript/raw tokens hoặc đưa chúng vào metric labels.
- Account deletion đóng media, chặn jobs/tokens, xóa own assets/feedback/context refs; anonymize membership cần giữ cho partner. Partner giữ nội dung riêng của họ, không giữ lời trích của user bị xóa. Cleaner order phải trace các FK; provider cleanup intents tồn tại tới khi hoàn tất kể cả platform jobs đã được dọn.
- Reports có operator quyền hạn/audit và trạng thái xử lý; không tự gửi private transcript tới đối tác. Pilot cần người xử lý report.

### Pipeline

1. Room end → chờ recording finalized có timeout → seal immutable manifest theo participant identity, segments/time ranges/consent/inputVersion.
2. Reconnect track mới phải nối đúng manifest; missing segment trả unavailable/partial rõ, không gán audio khác. Late webhook không đổi manifest của result đã public.
3. EVALUATE_PEER_PARTICIPANT owner=participant user, resource=evaluationId; một resource riêng mỗi người/inputVersion.
4. Queue mới jobs.peer, concurrency đầu 1, prefetch 1. Cùng task cập nhật route mapping SQL bằng migration mới, topology/listener/DLQ/docs/tests. Không đưa raw audio lên broker.
5. STT checkpoint từng segment rồi feedback; retry không chạy lại stage đã lưu. S0 kiểm tra codec/STT/transcoding và giới hạn file thực.
6. Input v1: own audio/transcript + common scenario + own role + hint usage. Đánh giá cách diễn đạt/câu hỏi quan sát được; không đánh giá nghe-hiểu hay trả lời đúng ý đối tác khi thiếu bằng chứng lời đối tác.
7. Output: source, own quote/span, strengths<=2, corrections<=2, suggestedRetry<=1, rubric/prompt/model version, assistance và limitations. Validate quote thuộc own transcript, schema/ownership/consent/fence trước publish.
8. Silence/noise/đọc hint → insufficient hoặc assisted, không score giả. Không suy pronunciation từ text, mastery từ substring/completion/self-report/compliment. Transcript là untrusted input.
9. PeerPracticeCompleted và PeerFeedbackReady v1 phát riêng từng owner; source transaction cùng outbox/context revision, required consumers đăng ký trước producer. Dedup theo owner/evaluation/inputVersion, retries không tăng revision đúp.
10. Luyện lại dùng solo pipeline qua public contract target snapshot mới. Chưa có contract thì chỉ CTA solo scenario; không tuyên bố chấm đúng target.

### Nối planner

- PeerPracticeQueries trả own recommendations/evaluation; Progress sở hữu evidence/learning targets khi capability sẵn sàng. Không tạo peer mastery cạnh tranh.
- Pilot tối thiểu correction-backed recommendation có bằng chứng, own retry. Target-aware assessment đầy đủ phụ thuộc P02 của learning-loop plan; không coi remediation hoàn tất khi chỉ có correction.
- Trước bật auto-refresh, harden planner hiện tại: createRefreshRequest bắt DuplicateKeyException trong transaction PostgreSQL có thể để transaction aborted; dùng ON CONFLICT phù hợp. Rà expired plans khác local day, active requests chiếm hết batch, settings race với background, finalization/isCompleted và recovery.
- Context pending → UPDATING; FAILED_FINAL dependency → BLOCKED; repaired contiguous readiness mới publish. ACTIVE peer luôn giữ snapshot, plan mới không sửa bài đang học.
- User rút consent/xóa result cần evidence withdrawal/context revision tương ứng khi evidence consumer được bật.

## 11. Capabilities, quota và vận hành

- peerPractice/peerFeedback defaults false, server authorize và frontend render cùng policy. Pilot allowlist ở server; không chỉ hidden button.
- Quota pilot đề xuất 3 phiên/user/ngày và 8 phút nói/phiên; create reservation, charge tại start, release nếu hủy trước start. Cả host và guest có reservation, accept/start concurrent kiểm tra atomic; caller timezone theo quota policy hiện hành. Expired/incomplete rules được test.
- Feedback mỗi người là operation/budget riêng. Invite không tiêu STT/LLM; retry evaluation/checkpoint không reserve quota mới. Hết feedback budget không chặn call.
- Cost model: participant-minutes media + TURN/egress nếu tính riêng + storage/bandwidth + STT minutes + feedback tokens + worker/DB/Redis. Bảng giá/version/region xác minh S0, chưa đặt số tiền giả.
- Metrics: create/accept/start/end outcomes, first remote audio latency, reconnect/abort, webhook/finalization/job lag, feedback outcomes và cost/session; không user/session ID metric labels.
- Soft kill: chặn create/join mới, drain active với deadline, giữ token refresh đúng member active trong drain. Hard kill khi consent/media incident: revoke/close rooms và durable cleanup.

## 12. Tasks, dependency và estimate

Một kỹ sư full-stack quen repo, có nội dung và thiết bị test hỗ trợ. Ngày công dự kiến, cập nhật sau S0; không cam kết deadline.

| Task | Deliverable và owner | Dependency | Gate | Ngày |
|---|---|---|---|---|
| S0 | Contract/state/API/ADR draft; LiveKit adapter spike, NAT/mobile/kick/reconnect/recording identity, giá | — | Hai thiết bị gọi thật; quyết định provider/version | 2–3 |
| S1 | Hub/solo route migration, six scenarios, peer entry đúng state; components/peer | S0 contract | Wireframes hub/setup/lobby/room/recap, solo/Study regression | 3–4 |
| S2 | peer module/schema/invites/reservations/roles/auth/capability/shared active guard | S0 | DB concurrency/CSRF/ownership/idempotency tests | 4–6 |
| S3 | Media tokens/webhooks/inbox/SSE/resync/phases/end reconciliation | S2 | Call thật, reconnect, không ghost room | 4–6 |
| S4 | Lobby/room responsive, permissions, block/report/metadata recap | S1/S3 | Alpha A dùng được, operator reports | 3–4 |
| S5 | Consent/audio assets/STT/jobs.peer/quota/fence/cancellation/own recap | S3/S4 | Ownership, deletion, duplicate/failure tests | 5–8 |
| S6 | Retry target public contract, own recommendation/context consumer, planner hardening | S5/P01; target-aware cần P02 | A/B kết quả riêng dẫn tới own retry/next recommendation | 3–5 |
| S7 | Browser E2E, controlled load, outages/deletion, runbook/flags/pilot | A:S4; B:S6 | Acceptance report, không bỏ qua unmet gate | 3–4 |

Tổng A+B 27–40 ngày công, khoảng 6–8 tuần một người tập trung nếu dịch vụ sẵn sàng. Alpha A khoảng 19–27 ngày công nếu tính toàn bộ S7 tương ứng; S7 được chia A/B, không cộng hai lần vào tổng. Không gồm thời gian chờ account/provider, tuyển pilot hoặc theo dõi sử dụng nhiều tuần.

C: buddy mutual consent, scheduling/timezone/no-show, opt-in notifications, voice challenge threads có ownership/retention; dùng lại module peer/assets. D: matching availability/preferences/block/active filters, wait timeout, rooms nhỏ có host. Estimate C/D sau pilot, chưa gán số ngày thiếu contract.

## 13. Acceptance tests

| ID | Fixture | Expected |
|---|---|---|
| T01 | A invite B, C dùng lại link | Chỉ A/B vào, C không thấy private data |
| T02 | Guest accept đồng thời, create/start double click | Một guest thắng, hai slots, một effect/idempotency |
| T03 | Swap role, update scenario sau start | Ready reset, own role đúng, snapshot không đổi |
| T04 | Refresh/reconnect/two tabs/device switch | Same session/phase, một publisher/user, timer không kéo dài |
| T05 | Chrome/Firefox desktop, Safari iOS, Chrome Android; mic/autoplay denied | Audio hai chiều thật, errors actionable |
| T06 | Khác mạng/NAT/TURN, mất mạng 30s và >60s | Pause/resume hoặc incomplete, cleanup đúng |
| T07 | Client timer giả, phase events lặp/đảo | Server authoritative/version monotonic |
| T08 | Consent từ chối/revoke khi worker đang gọi provider | Không record hoặc stop/delete/cancel, không publish stale |
| T09 | A nói X/B nói Y; track missing/reconnect | Đúng owner/quote, missing là unavailable |
| T10 | Rabbit duplicate, crash sau STT, delayed webhook, Redis down | Không quota/evidence đúp, checkpoint recover, membership DB |
| T11 | Noise/silence/hints/prompt injection | Không mastery giả, output bounded/validated |
| T12 | Context pending/blocked/replay/settings race | Freshness đúng, ACTIVE snapshot giữ nguyên |
| T13 | Đoán room/asset/recap ID, thiếu CSRF, revoked invite | Ownership/auth, không rò audio/role |
| T14 | Block/report/end lúc provider down, reuse token cũ | Cleanup bền, không cấp lại, không ghost room |
| T15 | Delete account/assets/result, job in-flight; account switch | Không tái xuất hiện dữ liệu đã xóa, không UI cross-account |
| T16 | Solo/Study/history/generated API | Flow cũ và completion vẫn chạy |
| T17 | Flags/allowlist/soft/hard kill | New entry bị chặn, active drain/stop đúng |
| T18 | End rồi luyện lại | Own target và result, không lấy correction partner |

Interface: 360/390/768/1280/1440 CSS px, light/dark, tên dài, mục tiêu dài, mọi empty/loading/error/permission/reconnect/feedback state. Test keyboard/focus cho controls mới, reduced motion, trạng thái có text thay vì chỉ màu. Render inspection trong thực thi, không đánh dấu đạt trong plan.

Repository checks sau thay đổi tương ứng:
~~~powershell
cd backend
.\scripts\export-openapi.ps1
.\mvnw.cmd verify
cd ../frontend
yarn generate:api
yarn test
yarn build
yarn lint
yarn check:api
~~~

check:api hiện dùng git diff; generated changes chưa commit có thể báo dirty dù generation ổn định. Khi phát triển so output trước/sau regeneration và rà intentional schema diff riêng; CI sau commit dùng command chuẩn. Không commit chỉ để che check.

Frontend package hiện có Vitest, chưa thấy browser E2E harness. S7 thêm harness như Playwright, hai browser contexts/tài khoản với fixture audio cho CI; thiết bị/mạng thật kiểm tra riêng. Docker/provider unavailable là blocked integration, không coi unit pass là gọi thật pass. Nếu IDE ghi target, dùng build directory riêng theo runbook hiện có.

## 14. Pilot và quyết định mở rộng

- Mời 10–20 người, ghép cặp trong vài giờ cố định; không phụ thuộc random matching để có phiên đầu.
- Review UX sau tối thiểu 30 phiên, báo số mẫu/lỗi; chưa đủ mẫu không kết luận retention.
- Mục tiêu kỹ thuật thử nghiệm: >=95% phiên đủ hai người ready nghe audio hai chiều trong 15 giây. Phân nhóm browser/network; chưa là SLA.
- Đo accepted→started, time-to-first-audio, completion, speaking time mỗi bên khi có phép đo đáng tin cậy, muốn học lại, cặp thực sự học lại trong 7 ngày, chọn retry tiếp theo.
- Speaking time không là proficiency score. Nếu nhiều người bỏ lobby, không hiểu mục tiêu hoặc một người gần như không nói, sửa luồng/nội dung trước tăng số mode.
- C khi có nhu cầu gặp lại; D khi có demand cùng slot/trình độ và quy trình moderation đủ. Chọn matching thresholds từ pilot.

## 15. Stop conditions

Gate cho slice phụ thuộc, không phải xin lại phép đọc code hoặc làm việc độc lập:
- Media spike không đạt reconnect/kick/identity isolation: giải quyết provider/adapter trước S3/S5; content/S1 vẫn làm.
- Consent/delete/cancellation không đáng tin: chỉ alpha không ghi âm, chưa mở peerFeedback.
- STT/quota/evaluation thật chưa có: feedback unavailable, không bịa score.
- P02/target retry chưa xong: recap correction-backed, hoàn thiện S6 trước tuyên bố target-aware loop xong.
- Schema/owner thay đổi từ nhánh khác: reconcile, không tạo bảng mastery thứ hai hoặc sửa migration đã apply.
- Launch gồm người dưới 18: thiết kế eligibility/consent/moderation riêng trước mở nhóm đó; pilot này chỉ người lớn.
- Chi phí/region/retention chưa chốt: đưa proposal và số liệu spike cụ thể; không tự mua gói/deploy public.

## 16. Design documentation và quan hệ plan cũ

- File này sở hữu Social Speaking A/B và roadmap C/D. Không thay thế solo/AI dialogue, P02 evidence hay Study LAZY trong MIMIC-PERSONAL-LEARNING-LOOP-IMPLEMENTATION-PLAN.md.
- Yêu cầu mới đổi ưu tiên peer; các quyết định postpone trong backend/competitive plans là lịch sử.
- Executor cập nhật docs/PROJECT.md capability matrix/navigation sau nghiệm thu, đối chiếu tên token với runtime trong task tài liệu riêng; không đổi global palette.
- ADR mới cho peer/media/session authority/consent; runbook peer incidents/deletion/cost, cập nhật MQ jobs.peer sau triển khai.
- Task lập plan chỉ tạo file trong design-plans, không sửa product source, cài dependencies, commit hoặc bật capability.

## 17. Checklist bàn giao

- [ ] S0: ADR draft, proof hai thiết bị, version và giá đã kiểm tra.
- [ ] S1: wireframes năm màn, six scenarios được review, route migration rõ.
- [ ] S2–S4: alpha audio thật, state/errors/report/ownership đạt.
- [ ] S5: consent/isolation/checkpoint/delete/feedback fixtures đạt.
- [ ] S6: own retry/recommendation/context freshness; ghi đúng giới hạn evidence.
- [ ] S7: browser/load/outage/cleanup report, runbook, cohort flags.
- [ ] Pilot B hoàn thành theo gate; không gộp alpha call với social learning đầy đủ.
