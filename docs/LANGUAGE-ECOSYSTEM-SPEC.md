# HeyMimic — Đặc Tả Kiến Trúc & Thiết Kế Hệ Sinh Thái Học Ngôn Ngữ Toàn Diện

- **Ngày lập:** 07/09/2026.
- **Tác giả:** Antigravity (Google DeepMind Team) & HeyMimic Product Team.
- **Phiên bản:** 2.0 — Mở rộng từ *Vocabulary & Monologue Speaking* sang *Comprehensive Language Acquisition Ecosystem*.
- **Mục tiêu:** Xây dựng tài liệu kiến trúc, luồng người dùng (user flow) và đặc tả chi tiết cho toàn bộ các trụ cột học ngôn ngữ bổ trợ: **Listening & Shadowing**, **AI 2-Way Dialogue (Roleplay)**, **Collocations & Chunks**, và **Workplace Writing & Reflex Translation**.

---

## 1. Triết Lý & Vòng Lặp Học Tập Toàn Diện (The Integrated Learning Loop)

### 1.1 Vấn đề cốt lõi của người học ngôn ngữ
Trong giao tiếp thực tế, người học thường gặp phải 3 "điểm nghẽn" lớn:
1. **Thiếu Input âm thanh chuẩn và phản xạ bắt chước:** Nghe người bản xứ nói cảm thấy quá nhanh vì không nhận ra hiện tượng **nối âm (Connected speech)** và **ngữ điệu (Intonation)**.
2. **Nói bị "sượng" do dịch từng từ (Word-by-word translation):** Học từ vựng đơn lẻ dẫn đến việc lắp ghép từ theo ngữ pháp tiếng Việt thay vì dùng các **cụm từ cố định (Collocations / Lexical Chunks)** mà người bản xứ sử dụng tự nhiên.
3. **Chỉ luyện nói một chiều (Monologue):** Khi đi làm hoặc phỏng vấn, người học phải đối mặt với các cuộc hội thoại tương tác hai chiều (Turn-taking: AI/Đối tác hỏi dồn, phản biện, chuyển ý) chứ không phải chỉ đứng thuyết trình một đoạn 90 giây có chuẩn bị trước.

### 1.2 Vòng lặp học tập tích hợp của HeyMimic
Hệ sinh thái HeyMimic liên kết chặt chẽ 4 giai đoạn tự nhiên của não bộ khi thụ đắc ngôn ngữ:

```
[ INPUT ]                                [ PROCESSING ]                             [ OUTPUT ]
Nghe Shadowing & Đọc ngữ cảnh  ──>  Từ vựng & Cụm Collocations  ──>  Độc thoại nói (60-90s) & Hội thoại 2 chiều (AI Roleplay)
          │                                                                                       │
          │                                                                                       ▼
          └─────────────────────  SỔ TAY LỖI CÁ NHÂN & VIẾT PHẢN XẠ  <───────────────────────────┘
                                   (Theo dõi và khắc phục điểm yếu)
```

1. **Input (Đầu vào chất lượng cao):** Tiếp nhận ngữ liệu qua bài nghe ngắn kèm nhịp điệu và bài đọc ngữ cảnh công việc.
2. **Processing (Hấp thụ cấu trúc & Cụm từ):** Nhận diện từ vựng ngữ cảnh và các cụm từ tự nhiên (Collocations).
3. **Active Output (Đầu ra chủ động):** Luyện nói độc thoại (bài nói 60–90s), hội thoại tương tác 2 chiều (Roleplay qua lại) và viết email/chat công sở.
4. **Targeted Feedback (Vòng phản hồi trọng tâm):** Gom toàn bộ lỗi sai phát âm, dùng từ, ngữ pháp vào *Sổ tay lỗi* để ôn luyện đúng điểm ngập ngừng.

---

## 2. Đặc Tả 4 Trụ Cột Ngôn Ngữ Mới

---

### Trụ Cột 1: Phòng Luyện Nghe & Bắt Chước — Listening & Shadowing Lab (`/listening`)

#### 2.1 Mục tiêu trải nghiệm
Giúp người học "tai nghe - miệng bắt chước" đúng theo tinh thần của cái tên **Mimic**. Người học không chỉ nghe thụ động mà phải lặp lại ngay lập tức theo ngữ điệu và nhịp điệu của người bản xứ.

#### 2.2 Các tính năng chính
1. **Kho bài nghe tình huống ngắn (30–60 giây):**
   - Phân loại theo bối cảnh: *Tech Daily Sync, Architecture Discussion, Job Interview, Client Small Talk*.
   - Độ dài vừa phải để não bộ tập trung cao độ, không gây mệt mỏi.
2. **Trình phát âm thanh phân đoạn từng câu (Sentence-segmented Audio Player):**
   - Hiển thị dạng sóng âm thanh trực quan.
   - Cho phép bấm vào từng câu để nghe riêng câu đó.
   - Nút chỉnh tốc độ thông minh: `0.8x` (nghe rõ nối âm), `1.0x` (chuẩn), `1.2x` (thử thách phản xạ nhanh).
   - Chế độ lặp lại câu (Loop 1 sentence) để nghe đi nghe lại cho đến khi thấm ngữ điệu.
3. **Tính năng Bắt chước (Shadowing Recorder):**
   - Bước 1: Máy đọc câu mẫu với hiển thị dấu trọng âm và ngữ điệu (mũi tên lên `↗` hoặc xuống `↘`).
   - Bước 2: Đếm ngược 3-2-1, người học bấm thu âm và nói lặp lại câu đó ngay lập tức.
   - Bước 3: So sánh nhịp điệu và tốc độ nói giữa bản đọc mẫu và bản thu của người học.
4. **Điểm nhấn nối âm (Connected Speech Markers):**
   - Highlight trực quan các điểm nối âm trong câu (ví dụ: `pick_it_up`, `wanna`, `out_of`).
   - Giải thích ngắn: "Âm /k/ nối với /ɪ/ tạo thành /kɪ/".

---

### Trụ Cột 2: Hội Thoại Tương Tác 2 Chiều — AI Roleplay Dialogue (`/speaking/dialogue`)

#### 2.1 Mục tiêu trải nghiệm
Mô phỏng tình huống giao tiếp thực tế với đối tác/sếp/đồng nghiệp theo cơ chế hỏi-đáp qua lại (turn-taking), giải quyết điểm yếu "chỉ nói được một mình nhưng khi có người hỏi lại lúng túng".

#### 2.2 Luồng hội thoại mẫu (3–5 lượt trao đổi)
- **Bối cảnh:** *Thương lượng lùi deadline với Project Manager (PM).*
- **Lượt 1 (AI mở đầu):** PM hỏi: *"Alex, I noticed feature X is still in progress. Can we still deploy this Friday as planned?"*
- **Lượt 1 (Người học trả lời):** Người học bấm mic thu âm câu trả lời trong 15–20 giây (ví dụ giải thích lỗi phát sinh).
- **Lượt 2 (AI phản ứng theo câu trả lời):** PM phản hồi: *"I see the blocker. If we deploy on Monday instead, what's our rollback plan?"*
- **Lượt 2 (Người học trả lời):** Người học tiếp tục đưa ra phương án dự phòng.
- **Kết thúc cuộc trao đổi:** Hệ thống đóng phiên và đưa ra bản phân tích toàn diện.

#### 2.3 Bảng đánh giá hội thoại (Dialogue Feedback Dashboard)
- **Chỉ số lịch sự & ngoại giao (Diplomacy & Politeness):** Đánh giá mức độ khéo léo khi từ chối hoặc đưa ra đề xuất trái chiều.
- **Độ rõ ràng & mạch lạc (Clarity):** Tốc độ phản hồi và cách diễn đạt ý chính.
- **Từ vựng chuyên nghiệp đã dùng:** Liệt kê các từ ngữ/cụm từ hay mà người học đã tận dụng thành công.
- **Gợi ý cách trả lời tự nhiên hơn cho từng lượt (Turn-by-turn rephrase):** Cho phép nghe thử cách người bản xứ xử lý tình huống đó.

---

### Trụ Cột 3: Cụm Từ Tự Nhiên & Cấu Trúc Khối — Collocations & Chunks (`/vocab/collocations`)

#### 2.1 Mục tiêu trải nghiệm
Xóa bỏ thói quen dịch từng từ (word-by-word) từ tiếng Việt sang tiếng Anh. Dạy não bộ tư duy theo khối ngữ liệu (Lexical Chunks) để nói bật ra cả cụm trôi chảy.

#### 2.2 Các dạng học tập trọng tâm
1. **Bộ thẻ Collocation đối chiếu ("Don't say X, Say Y"):**
   - Cặp đối chiếu trực quan:
     - ✗ *Make a meeting* → ✓ **Set up a meeting** / **Schedule a meeting**
     - ✗ *Delay the deadline* → ✓ **Push back the deadline**
     - ✗ *Do a decision* → ✓ **Make a decision** / **Reach a decision**
   - Giải thích sắc thái nghĩa và tần suất người bản xứ sử dụng.
2. **Cụm động từ công sở thiết yếu (Workplace Phrasal Verbs):**
   - *Follow up with*, *Bring up*, *Touch base on*, *Wrap up*, *Walk through*.
   - Kèm câu ví dụ thực tế trong ngữ cảnh họp hoặc viết tin nhắn.
3. **Mini-game ghép cụm từ phản xạ (Chunk Matching Drill):**
   - Kéo hoặc chọn nhanh động từ ghép với danh từ thích hợp trong 5 giây để rèn phản xạ vô điều kiện.

---

### Trụ Cột 4: Viết Phản Xạ & Mài Giũa Tin Nhắn Công Sở — Workplace Writing & Reflex (`/writing`)

#### 2.1 Mục tiêu trải nghiệm
Hỗ trợ người học làm chủ kỹ năng Viết tiếng Anh trong công việc hằng ngày (Email, Slack/Teams, báo cáo ngắn), đồng thời rèn tư duy "Nghĩ bằng tiếng Việt → Bật ra cách nói tiếng Anh tự nhiên".

#### 2.2 Hai công cụ cốt lõi
1. **Email & Slack Message Polisher (Mài giũa văn phong):**
   - Người học dán đoạn nháp tiếng Anh mà mình chuẩn bị gửi cho đối tác hoặc đồng nghiệp.
   - Hệ thống cung cấp song song 2 phiên bản:
     - **Phiên bản Trang trọng (Professional):** Dành cho khách hàng, đối tác, ban giám đốc.
     - **Phiên bản Thân thiện (Casual / Team Friendly):** Dành cho đồng nghiệp cùng team qua Slack/Discord.
   - Ghi chú phân tích từng điểm sửa để người học tích lũy kinh nghiệm cho các lần viết sau.
2. **Dịch phản xạ câu công sở (Reflex Translation Drills):**
   - Mỗi ngày đưa ra 1 tình huống tiếng Việt rất đỗi quen thuộc:
     - *Ý muốn nói:* "Tôi bận họp cả chiều nay, có gì bạn cứ nhắn lại rồi tôi xem sau nhé."
   - Người học gõ hoặc nói câu tiếng Anh của mình.
   - Hệ thống đối chiếu và phân tích: Thay vì dịch thô *"I am busy meeting all afternoon..."*, người bản xứ sẽ nói *"I'm tied up in meetings all afternoon. Drop me a note and I'll get back to you later."*

---

## 3. Kiến Trúc Dữ Liệu & Mô Hình State (Domain Models)

### 3.1 Các Type mở rộng (`frontend/src/type/index.ts`)

```typescript
// 1. Listening & Shadowing Models
export interface ListeningSegment {
  id: string
  sentence: string
  translation: string
  startTime: number
  endTime: number
  connectedSpeechNotes?: string
  intonationPattern: 'rising' | 'falling' | 'flat'
}

export interface ListeningExercise {
  id: string
  title: string
  category: 'meeting' | 'interview' | 'casual' | 'tech'
  duration: string
  audioUrl: string
  transcript: string
  segments: ListeningSegment[]
  keyCollocations: string[]
}

// 2. AI Roleplay Dialogue Models
export interface DialogueTurn {
  id: string
  speaker: 'ai' | 'user'
  avatar?: string
  text: string
  audioUrl?: string
  suggestedRephrase?: string
  feedbackNote?: string
}

export interface DialogueScenario {
  id: string
  title: string
  role: string
  aiRole: string
  objective: string
  starterPrompt: string
  turns: DialogueTurn[]
  metricsSummary?: {
    politenessScore: number
    clarityScore: number
    naturalnessScore: number
  }
}

// 3. Collocations Models
export interface CollocationPair {
  id: string
  verbOrAdj: string
  noun: string
  fullChunk: string
  commonMistake: string
  contextExample: string
  translation: string
  category: 'management' | 'tech' | 'communication'
}

// 4. Workplace Writing Models
export interface WritingExercise {
  id: string
  title: string
  vietnamesePrompt: string
  targetChunks: string[]
  naturalEnglish: string
  explanation: string
}
```

### 3.2 Cập nhật Store tập trung (`useMimicStore.ts`)
- Mở rộng `STORAGE_KEYS`:
  - `mimic_v2_listening`: Lưu các bài nghe đã hoàn thành và điểm số shadowing.
  - `mimic_v2_dialogue`: Lưu lịch sử các phiên hội thoại 2 chiều.
  - `mimic_v2_collocations`: Lưu trạng thái làm chủ cụm từ.
- Bổ sung các action:
  - `completeListeningShadowing(exerciseId, segmentId)`
  - `addDialogueTurn(turn)` & `finishDialogueSession(sessionId)`
  - `rateCollocation(pairId, status)`

---

## 4. Cấu Trúc Điều Hướng & Routing

### 4.1 Cập nhật Menu điều hướng chính (`AppShell` & `Sidebar`)
- **Hôm nay (`/dashboard`)**: Trung tâm điều phối, nhận gợi ý tổng hợp từ cả 4 trụ cột.
- **Từ vựng & Cụm từ (`/vocab`)**: Thẻ từ đơn + Tab cụm từ *Collocations*.
- **Luyện nói & Hội thoại (`/speaking`)**:
  - Tab 1: Độc thoại 60–90 giây (`/speaking`).
  - Tab 2: Hội thoại 2 chiều Roleplay (`/speaking/dialogue`).
  - Tab 3: Lịch sử bài nói (`/speaking/history`).
- **Luyện nghe & Shadowing (`/listening`)**: Trang nghe ngắt câu và thu âm bắt chước.
- **Viết & Phản xạ câu (`/writing`)**: Mài giũa email và dịch phản xạ ngữ cảnh.
- **Tiến độ & Sổ tay lỗi (`/progress`)**: Tổng hợp số liệu và lỗi từ mọi kỹ năng.

---

## 5. Kế Hoạch Triển Khai Phân Kỳ (Implementation Roadmap)

### Giai đoạn A: Trụ cột Listening & Shadowing + Kho Collocations
1. Tạo mock dữ liệu cho Listening exercises và Collocation pairs.
2. Dựng trang [Listening.tsx](file:///d:/WEB/heymimic/frontend/src/pages/Listening.tsx) với trình phát phân đoạn câu, nút lặp câu, thu âm bắt chước và hiển thị nối âm.
3. Dựng tab Collocations trong [Vocab.tsx](file:///d:/WEB/heymimic/frontend/src/pages/Vocab.tsx) với cặp đối chiếu *"Don't say X, Say Y"*.

### Giai đoạn B: Trụ cột Hội thoại AI Roleplay 2 Chiều + Viết Công Sở
1. Dựng trang [SpeakingDialogue.tsx](file:///d:/WEB/heymimic/frontend/src/pages/SpeakingDialogue.tsx) mô phỏng trao đổi theo lượt với AI đóng vai đối tác.
2. Dựng trang [Writing.tsx](file:///d:/WEB/heymimic/frontend/src/pages/Writing.tsx) với bộ mài giũa Email/Slack (Professional vs Casual) và bài tập dịch phản xạ câu.

### Giai đoạn C: Kết Nối Bàn Điều Phối (Unified Coordinator) & Nghiệm Thu
1. Cập nhật Dashboard để gợi ý luân phiên giữa: Nghe Shadowing → Ôn cụm từ → Nói tương tác → Mài giũa viết.
2. Đồng bộ lỗi sai từ cả 4 module vào trang [Progress.tsx](file:///d:/WEB/heymimic/frontend/src/pages/Progress.tsx).
3. Kiểm thử toàn diện qua `npm run build` và Browser Subagent.
