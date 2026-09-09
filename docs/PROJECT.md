# PROJECT.md — Mimic

> File này mô tả toàn bộ bối cảnh, mục tiêu, phạm vi và yêu cầu của dự án Mimic. Đọc file này trước khi thực hiện bất kỳ thay đổi/code nào để hiểu đúng định hướng sản phẩm.

---

## 1. Mimic là gì

**Mimic** là một web app học tiếng Anh cá nhân hóa, tập trung vào hai trụ cột: **Vocabulary (từ vựng)** và **Speaking (luyện nói)**. Sản phẩm được vận hành bởi các **AI agent chuyên biệt** thay vì nội dung tĩnh soạn sẵn — mỗi agent đảm nhiệm một mảng (chọn từ vựng, phân tích giọng nói, theo dõi tiến độ) và cá nhân hóa theo đúng lỗi sai/nhu cầu của từng người dùng.

**Người dùng đầu tiên:** chính founder (build cho nhu cầu học thật của bản thân trước khi mở rộng ra người dùng khác).

**Vấn đề Mimic giải quyết:**
- Học từ vựng qua câu ví dụ vô nghĩa, không gắn với ngữ cảnh thật người học sẽ dùng
- Luyện speaking một mình không có ai/cái gì phản hồi về ngữ pháp, từ vựng, độ trôi chảy, phát âm
- Các app hiện có (Duolingo, Anki, ELSA...) phục vụ số đông nên không cá nhân hóa sâu theo đúng lỗi của từng người

**Cách Mimic khác biệt:**
- Cá nhân hóa qua AI agent thay vì bài học cố định
- Ưu tiên học từ ngữ cảnh thật (nội dung người dùng tự đưa vào) thay vì giáo trình có sẵn
- Có "sổ tay lỗi cá nhân" — hệ thống chủ động nhắm vào đúng điểm yếu lặp lại của người học, không lặp lại đều đại trà

---

## 2. Phạm vi giai đoạn hiện tại

**Đang làm:** Mở rộng nền tảng từ UI mock sang luồng API có persistence. Backend đã có modular monolith Spring Boot/PostgreSQL/Flyway; frontend dùng React/TypeScript/Vite/Tailwind/Zustand và client sinh từ OpenAPI.

**Capability matrix hiện tại:**

| Capability | Trạng thái |
|---|---|
| Auth, learner profile, vocabulary, speaking session/attempt/evaluation, progress, Study | API thật + persistence + test |
| Mistake status, evidence stage, capability/usage quota | Contract slice đã triển khai; frontend service đã nối |
| Video shadowing acoustic score | Demo-only; luôn gắn source: demo, chưa phải chấm âm thanh |
| AI extraction/evaluation | Claude adapter cho staging/prod; deterministic fake ở dev/test; output JSON được validate và lỗi được phân loại |
| STT và audio storage | Deepgram/S3 core adapter cho staging/prod; fake ở dev/test; orphan cleanup và smoke test còn mở |
| Identity email delivery | Resend adapter cho staging/prod; in-memory ở dev/test |

**Ưu tiên tiếp theo:** hoàn thiện M0 còn lại, sau đó M1 provider/audio pipeline và M3 remediation end-to-end theo implementation plan.
---

## 3. Kiến trúc AI Agent

| Agent | Vai trò | Input | Output |
|---|---|---|---|
| **Vocab Agent** | Chọn từ vựng phù hợp trình độ, tạo ví dụ theo ngữ cảnh, sinh bài ôn tập | Trình độ hiện tại, từ đã học, lỗi hay gặp | Bộ từ mới hôm nay + bài ôn tập (spaced repetition) |
| **Speaking Agent** | Đưa tình huống nói, phân tích transcript (ngữ pháp, từ vựng, độ trôi chảy), gợi ý câu tốt hơn | Transcript từ speech-to-text, lịch sử lỗi trước đó | Phản hồi chi tiết + câu hỏi follow-up để giữ hội thoại |
| **Progress/Coordinator Agent** | Theo dõi tiến bộ tổng thể, quyết định nên ưu tiên vocab mới hay ôn lỗi cũ hay luyện nói hôm nay | Lịch sử học tập, streak, lỗi lặp lại | Gợi ý ưu tiên hoạt động trong ngày |

**Ghi chú kỹ thuật:** adapter Claude dùng Messages API (/v1/messages) với system prompt riêng cho extraction và feedback. Backend gửi secret qua server, giới hạn output, validate JSON rồi mới ghi kết quả; lỗi rate limit/5xx được retry còn auth/schema lỗi kết thúc job. STT và audio storage core đã có adapter staging/prod; orphan cleanup, browser recovery và smoke test thật vẫn là gate tiếp theo; provider không được gọi từ trình duyệt.

---

## 4. Tech stack

- **Build tool:** Vite
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS, dùng CSS variables làm design tokens (chi tiết ở mục 5)
- **Routing:** react-router-dom (nhóm route thành `AppLayout` — sau đăng nhập — và `MarketingLayout` — trước đăng nhập)
- **State:** Zustand
- **Icon:** lucide-react
- **SEO (cho marketing site):** react-helmet-async

---

## 5. Design system

**Nguyên tắc bắt buộc — KHÔNG dùng công thức UI mặc định kiểu AI-generated:**
- Không cream + serif tương phản cao
- Không nền gần đen + 1 accent neon duy nhất kiểu "SaaS tối"
- Không bố cục "báo in" (hairline rules, bo góc = 0)
- Không mọi thứ chia thành card giống hệt nhau + shadow xám nhạt đồng loạt
- Không nhãn ALL-CAPS tracked-out phía trên heading, không dấu "·" nối chuỗi meta, không mũi tên "→" cuối nút/link mặc định

**Chủ đề hình ảnh:** lấy cảm hứng từ sóng âm thanh, nhịp điệu, sự lặp lại có biến thiên (waveform, echo, shadowing) — thể hiện tinh tế qua layout/rhythm, không literal hóa âm thanh khắp nơi.

### Bảng màu

**Light mode:**
| Token | Hex | Vai trò |
|---|---|---|
| `--bg` | `#F7F9FA` | Nền chính |
| `--surface` | `#FFFFFF` | Nền card/khối nổi |
| `--text` | `#1A2126` | Text chính |
| `--text-muted` | `#6B7680` | Text phụ |
| `--accent` | `#0FA8B8` | Cyan trầm — link, icon, trạng thái phụ |
| `--accent-soft` | `#E3F4F6` | Nền nhạt của accent |
| `--success` | `#2FA88E` | Trạng thái đúng/hoàn thành |
| `--warm` | `#D97A56` | Cam đất — CHỈ dùng cho 1 CTA/hành động chính trên mỗi màn hình |
| `--border` | `#E1E6E8` | Viền, chia tách |

**Dark mode:**
| Token | Hex | Vai trò |
|---|---|---|
| `--bg` | `#12181C` | Nền chính |
| `--surface` | `#1B2329` | Nền card/khối nổi |
| `--text` | `#E7EDF0` | Text chính |
| `--text-muted` | `#8A96A0` | Text phụ |
| `--accent` | `#3FD4E0` | Cyan sáng hơn |
| `--accent-soft` | `#1E343A` | Nền nhạt của accent |
| `--success` | `#48C2A4` | Trạng thái đúng/hoàn thành |
| `--warm` | `#E28A63` | Cam đất |
| `--border` | `#28323A` | Viền, chia tách |

**Nguyên tắc dùng màu:**
- `--warm`: chỉ 1 hành động quan trọng nhất/màn hình (nút ghi âm, CTA đăng ký) — không lạm dụng
- `--accent`: link, icon, tab active, viền input focus — không dùng làm màu chữ đoạn văn dài
- `--success`: dành riêng cho phản hồi tích cực, kèm icon (✓) để phân biệt với `--accent` (cùng tông lạnh, dễ lẫn nếu đặt sát nhau)
- Contrast tối thiểu WCAG AA (4.5:1) cho text trên nền

### Typography & Layout
- Heading: font geometric sans có cá tính (VD Space Grotesk hoặc tương đương)
- Body: sans-serif dễ đọc, trung tính (VD Inter)
- Số liệu/tiến độ: ưu tiên font tabular-nums
- Layout: căn trái là chính (không center toàn trang); app chính theo bố cục "phòng luyện tập" (1 khu vực chính lớn + sidebar/nav gọn); marketing site được phép "trình bày" hơn nhưng vẫn tránh mọi công thức mặc định đã liệt kê
- Chuyển động: tối giản, có chủ đích (VD waveform pulse khi ghi âm, pulse nhẹ khi agent đang phản hồi) — không fade-slide-up hàng loạt

---

## 6. Cấu trúc trang & tính năng

### 6.1 App chính (sau đăng nhập)

**Dashboard (`/`)**
- Chào theo trạng thái học (streak)
- 2 khối hành động chính "Học từ mới" / "Luyện nói" — visual weight khác nhau tùy agent gợi ý ưu tiên
- Tóm tắt tiến độ tuần

**Vocab (`/vocab`)**
- Danh sách từ đang học hôm nay (mock 5-8 từ): từ, nghĩa, ví dụ ngữ cảnh, trạng thái (mới/đang ôn/đã thuộc)
- Chế độ flashcard: lật thẻ, nút "Nhớ"/"Chưa nhớ"
- Khu vực "Thêm từ từ ngữ cảnh của bạn": input dán đoạn văn, mock hiển thị từ được bóc ra

**Speaking (`/speaking`)**
- Chủ đề/tình huống hôm nay, nút ghi âm lớn (trạng thái: sẵn sàng/đang ghi/đang xử lý)
- Sau ghi âm (mock): transcript giả + phản hồi (lỗi ngữ pháp/từ vựng/gợi ý câu tốt hơn)
- Lịch sử các lượt nói gần đây

**Progress (`/progress`)**
- Tổng số từ đã học, số buổi speaking, streak
- Danh sách lỗi hay gặp nhất — điểm nhấn khác biệt của Mimic, hiển thị nổi bật

### 6.2 Marketing site (trước đăng nhập)

**Landing (`/`)**
- Hero thể hiện đúng trải nghiệm shadowing (không chỉ mô tả bằng chữ)
- Vấn đề & giải pháp
- 3 trụ cột chính (có ví dụ cụ thể/screenshot thật, không icon + text chung chung)
- Cách hoạt động (numbered steps — hợp lý ở đây vì là chuỗi bước thật)
- Social proof: để trống hoặc thay bằng "nhật ký xây dựng", không fake testimonial
- CTA cuối trang → `/signup`

**Login (`/login`)** — email + password, link sang signup
**Signup (`/signup`)** — tên, email, password, có thể hỏi mục tiêu học ngay từ đầu (mock)
**About (`/about`)** — câu chuyện thật vì sao Mimic ra đời, triết lý sản phẩm
**Contact (`/contact`)** — form đơn giản hoặc email liên hệ trực tiếp
**Blog (`/blog`, `/blog/:slug`)** — danh sách bài viết mock + trang đọc chi tiết (layout đọc dài, không bọc card quanh nội dung)

### 6.3 Trang bổ sung — bắt buộc để sản phẩm hoàn chỉnh

**Forgot Password (`/forgot-password`)** — nhập email để reset mật khẩu, đi kèm flow với Login (chỉ cần UI, mock submit ở giai đoạn này)

**Settings/Profile (`/settings`)** — đổi tên, email, mật khẩu, chọn theme sáng/tối, xóa tài khoản; sau này thêm mục tiêu học ở đây

**Terms of Service (`/terms`)** và **Privacy Policy (`/privacy`)** — bắt buộc về mặt pháp lý khi có thu thập email/dữ liệu người dùng, kể cả sản phẩm nhỏ. Nội dung có thể là placeholder hợp lý ở giai đoạn UI, cần thay bằng nội dung pháp lý thật trước khi launch công khai

**404 / Not Found** — trang lỗi khi truy cập route không tồn tại, dùng chung design system, có nút quay về Dashboard/Landing tùy đang ở khu vực nào

### 6.4 Trang/luồng nên có sớm

**Onboarding (`/onboarding`)** — bước đầu ngay sau khi signup: hỏi trình độ hiện tại, mục tiêu học, để Coordinator Agent có dữ liệu cá nhân hóa từ đầu. Tách thành flow riêng (nhiều bước) thay vì gộp vào Signup nếu số câu hỏi nhiều hơn 1-2 câu

**Empty states** — không phải trang riêng nhưng bắt buộc thiết kế: giao diện Vocab/Speaking/Progress khi người dùng mới, chưa có dữ liệu (chưa học buổi nào, chưa có lỗi nào được ghi nhận) — tránh để trống trơn hoặc lỗi layout

### 6.5 Trang để sau (chưa cấp bách với giai đoạn 1 người dùng)

- **Pricing (`/pricing`)** — chỉ cần khi có ý định thu phí
- **Email verification (`/verify-email`)** — chỉ cần khi nối auth thật (Supabase Auth hoặc tương đương)

---

## 7. Cấu trúc thư mục

```
mimic/
├── src/
│   ├── components/
│   │   ├── layout/          (Sidebar, Nav, AppLayout)
│   │   ├── vocab/            (FlashCard, VocabList, ...)
│   │   ├── speaking/          (RecordButton, Waveform, FeedbackCard, ...)
│   │   ├── marketing/          (Hero, PillarSection, HowItWorks, MarketingNav, MarketingFooter)
│   │   └── shared/             (Button, Badge, ProgressBar, ...)
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Vocab.tsx
│   │   ├── Speaking.tsx
│   │   ├── Progress.tsx
│   │   ├── Settings.tsx
│   │   ├── NotFound.tsx
│   │   └── marketing/
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       ├── Signup.tsx
│   │       ├── ForgotPassword.tsx
│   │       ├── Onboarding.tsx
│   │       ├── About.tsx
│   │       ├── Contact.tsx
│   │       ├── Terms.tsx
│   │       ├── Privacy.tsx
│   │       ├── BlogIndex.tsx
│   │       └── BlogPost.tsx
│   ├── mocks/
│   │   ├── vocab.ts
│   │   ├── speaking.ts
│   │   ├── progress.ts
│   │   └── blog.ts
│   ├── store/                  (Zustand store)
│   ├── styles/                  (tokens, globals)
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.ts
├── index.html
└── vite.config.ts
```

---

## 8. Việc cần làm sau (KHÔNG làm ở giai đoạn hiện tại, chỉ để tham khảo hướng)
- Mở rộng Claude adapter cho brief/roleplay/coordinator sau khi nghiệm thu extraction và feedback hiện tại
- Speech-to-text qua Deepgram prerecorded API
- Auth thật (Supabase Auth hoặc tương đương) cho `/login`, `/signup`
- Nối `/contact` với email service thật
- Blog: chuyển từ mock sang markdown/CMS thật
- Persistence thật thay cho mock/localStorage

---

## 9. Việc CẦN LÀM và ưu tiên ngay bây giờ

1. ✅ Setup Vite + React + TS + Tailwind, cấu hình design tokens ở mục 5
2. ✅ Dựng layout shell (AppShell + MarketingLayout + routing)
3. ✅ Dựng từng trang app chính theo thứ tự: Dashboard → Vocab (kèm ContextCapture & VocabReview) → Speaking (kèm SpeakingHistory & SpeakingSessionDetail) → SessionSummary → Progress (kèm Sổ tay lỗi & MistakeDetail) → Settings
4. ✅ Dựng từng trang marketing theo thứ tự: Landing → Login/Signup/Forgot Password/Reset Password → Onboarding → About → Contact → Terms/Privacy → Blog (Index & Post)
5. ✅ Dựng trang 404 dùng chung cho cả 2 khu vực (app + marketing)
6. ✅ Thiết kế empty state cho Vocab/Speaking/Progress/Search khi chưa có dữ liệu
7. ✅ Đảm bảo responsive, dark mode (light/dark/system), accessibility cơ bản (contrast, keyboard focus, esc modal) trên toàn bộ trang (Hoàn thành nghiệm thu Mốc 1 – Mốc 4 theo MIMIC-TASKS-AND-PAGE-SPECS.md).

**Lưu ý quan trọng cho AI agent thực thi:** Trước khi code bất kỳ trang/component nào, brainstorm ngắn gọn plan thiết kế (màu/type/layout) đối chiếu với mục 5 để tránh rơi vào mẫu UI mặc định. Không tự thêm tính năng, trang, hay logic backend ngoài phạm vi mô tả ở file này — nếu thấy cần, hỏi lại trước khi làm.
