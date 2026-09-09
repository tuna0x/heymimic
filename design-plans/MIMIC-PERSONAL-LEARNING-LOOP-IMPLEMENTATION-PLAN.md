# HeyMimic â€” Káº¿ hoáº¡ch triá»ƒn khai vÃ²ng há»c cÃ¡ nhÃ¢n hÃ³a

NgÃ y: 09/09/2026. Tráº¡ng thÃ¡i: **Ä‘ang triá»ƒn khai theo milestone; M0-B02, M0-F01, M0-F02, M1-B01, M1-F01, M1-B03 vÃ  pháº§n core cá»§a M1-B02/M1-B04 (usage + budget)/M1-F02, cÃ¹ng pháº§n contract cá»§a M0-Q01 Ä‘Ã£ hoÃ n thÃ nh**.

Pháº¡m vi: thiáº¿t káº¿ backend, frontend, dá»¯ liá»‡u, API, nhÃ  cung cáº¥p, triá»ƒn khai vÃ  nghiá»‡m thu cho 5 tÃ­nh nÄƒng Ä‘Ã£ thá»‘ng nháº¥t: chá»¯a lá»—i báº±ng nÃ³i láº¡i; ná»™i dung cÃ¡ nhÃ¢n thÃ nh bÃ i luyá»‡n; há»™i thoáº¡i AI; bÃ i há»c hÃ´m nay; nghe trÆ°á»›c/sau vÃ  tiáº¿n bá»™ theo lá»—i.

Äá»c nhanh: [cÃ´ng nghá»‡ cáº§n dÃ¹ng](#3-dÃ¹ng-nhá»¯ng-cÃ´ng-nghá»‡-vÃ -dá»‹ch-vá»¥-nÃ o), [dá»¯ liá»‡u vÃ  migration](#5-thiáº¿t-káº¿-dá»¯-liá»‡u-vÃ -migration), [frontend](#8-thiáº¿t-káº¿-frontend), [backlog theo má»‘c](#12-backlog-triá»ƒn-khai-theo-má»‘c), [thÃ´ng tin cáº§n chuáº©n bá»‹](#14-thÃ´ng-tin-cáº§n-chuáº©n-bá»‹-khi-báº¯t-Ä‘áº§u-thá»±c-hiá»‡n).

Äá»c cÃ¹ng: [Ä‘Ã¡nh giÃ¡ Ä‘á»‘i thá»§](../docs/COMPETITIVE-REVIEW-2026-09-09.md), [kiáº¿n trÃºc backend hiá»‡n cÃ³](MIMIC-BACKEND-MODULAR-MONOLITH-PLAN.md), [Ä‘áº·c táº£ trang hiá»‡n cÃ³](MIMIC-TASKS-AND-PAGE-SPECS.md), [backend README](../backend/README.md). Plan nÃ y lÃ  pháº§n má»Ÿ rá»™ng; khÃ´ng Ä‘Ã¡nh dáº¥u cÃ¡c cÃ´ng viá»‡c cÅ© hoáº·c má»›i lÃ  hoÃ n thÃ nh thay cho kiá»ƒm chá»©ng.

## 1. Quyáº¿t Ä‘á»‹nh sáº£n pháº©m

### 1.1 Káº¿t quáº£ cáº§n Ä‘áº¡t

NgÆ°á»i há»c cÃ³ thá»ƒ thá»±c hiá»‡n má»™t buá»•i há»c khoáº£ng 10 phÃºt:

1. ÄÆ°a ná»™i dung cÃ´ng viá»‡c vÃ o app hoáº·c dÃ¹ng má»™t chá»§ Ä‘á» cÃ³ sáºµn.
2. Ã”n 3â€“5 tá»«/cá»¥m tháº­t sá»± cáº§n dÃ¹ng.
3. NÃ³i vá» tÃ¬nh huá»‘ng Ä‘Ã³.
4. Nháº­n tá»‘i Ä‘a 2 lá»—i Æ°u tiÃªn, hiá»ƒu cÃ¡ch sá»­a vÃ  nÃ³i láº¡i.
5. Gáº·p láº¡i cáº¥u trÃºc/cá»¥m Ä‘Ã³ trong bÃ i má»›i vÃ o ngÃ y sau.
6. Nghe láº¡i báº£n ghi vÃ  xem báº±ng chá»©ng thay Ä‘á»•i cá»§a chÃ­nh mÃ¬nh.

NgÃ¡ch thá»­ nghiá»‡m: ngÆ°á»i Viá»‡t lÃ m cÃ´ng nghá»‡/sáº£n pháº©m cáº§n há»p, giáº£i thÃ­ch váº¥n Ä‘á», phá»ng váº¥n; há»— trá»£ bÃ i má»©c A2â€“B2 trÆ°á»›c. ÄÃ¢y lÃ  giáº£ thuyáº¿t sáº£n pháº©m Ä‘á»ƒ kiá»ƒm chá»©ng báº±ng sá»­ dá»¥ng thá»±c táº¿, khÃ´ng pháº£i káº¿t luáº­n thá»‹ trÆ°á»ng.

### 1.2 Pháº¡m vi báº£n Ä‘áº§u

| MÃ£ | TÃ­nh nÄƒng | Báº£n Ä‘áº§u pháº£i cÃ³ | Äá»ƒ sau |
|---|---|---|---|
| F1 | Chá»¯a lá»—i vÃ  nÃ³i láº¡i | Chá»n 1â€“2 lá»—i, giáº£i thÃ­ch, bÃ i nÃ³i má»›i, Ä‘Ã¡nh giÃ¡ cÃ³ báº±ng chá»©ng, lá»‹ch kiá»ƒm tra láº¡i | Cháº¥m Ã¢m vá»‹, suy luáº­n Ä‘Ã£ thÃ nh tháº¡o tá»« má»™t láº§n luyá»‡n |
| F2 | Ná»™i dung thÃ nh bÃ i luyá»‡n | DÃ¡n vÄƒn báº£n, chá»n chunks, giá»¯ nguá»“n, táº¡o brief nÃ³i | Import URL tá»± Ä‘á»™ng, PDF/OCR, extension, toÃ n bá»™ YouTube |
| F3 | Roleplay | 5 tÃ¬nh huá»‘ng Ä‘áº§u, audio theo lÆ°á»£t, hint, káº¿t thÃºc vÃ  feedback toÃ n phiÃªn | WebRTC, ngáº¯t lá»i, avatar 3D, gá»i ngÆ°á»i tháº­t |
| F4 | BÃ i há»c hÃ´m nay | Káº¿ hoáº¡ch 5/10/15 phÃºt, lÃ½ do chá»n bÃ i, tiáº¿p tá»¥c phiÃªn, táº¡o tá»«ng bÆ°á»›c khi cáº§n | Tá»± Ä‘á»™ng láº­p giÃ¡o trÃ¬nh dÃ i háº¡n báº±ng nhiá»u agent |
| F5 | Báº±ng chá»©ng tiáº¿n bá»™ | Nghe trÆ°á»›c/sau, sá»­a lá»—i qua Ä‘á» má»›i, cá»¥m dÃ¹ng Ä‘Ãºng, sá»‘ lÆ°á»£t vÃ  khoáº£ng thá»i gian | Chá»©ng nháº­n CEFR, Ä‘iá»ƒm phÃ¡t Ã¢m khi chÆ°a cÃ³ bá»™ cháº¥m audio |

Æ¯u tiÃªn triá»ƒn khai: ná»n tháº­t â†’ F1 â†’ F2 â†’ F4 báº£n Ä‘áº§u â†’ F3 â†’ F4 Ä‘áº§y Ä‘á»§ + F5. F5 thu tháº­p dá»¯ liá»‡u ngay tá»« F1, hoÃ n thiá»‡n mÃ n hÃ¬nh sau; khÃ´ng chá» Ä‘áº¿n cuá»‘i má»›i thiáº¿t káº¿ dá»¯ liá»‡u báº±ng chá»©ng.

### 1.3 NguyÃªn táº¯c nghiá»‡m thu

- Má»™t tÃ­nh nÄƒng hoÃ n thÃ nh khi ngÆ°á»i há»c má»›i Ä‘i háº¿t luá»“ng frontend â†’ backend â†’ provider tháº­t â†’ má»Ÿ láº¡i dá»¯ liá»‡u Ä‘Æ°á»£c.
- BÃ i há»c khÃ´ng gá»i lÃ  thÃ nh cÃ´ng chá»‰ vÃ¬ cÃ³ controller, trang demo hoáº·c JSON há»£p lá»‡.
- Äiá»ƒm sá»‘, duration, tiáº¿n Ä‘á»™ vÃ  sá»‘ láº§n há»c do server tÃ­nh. UI khÃ´ng tá»± cá»™ng thÃ nh tÃ­ch.
- PhÃ¢n biá»‡t nháº­n biáº¿t cÃ¢u Ä‘Ãºng, tá»± nÃ³i Ä‘Ãºng vÃ  dÃ¹ng Ä‘Ãºng á»Ÿ ngá»¯ cáº£nh má»›i.
- BÃ i nÃ³i ngáº¯n, má»™t hÃ nh Ä‘á»™ng chÃ­nh má»—i mÃ n hÃ¬nh; khÃ´ng báº¯t ngÆ°á»i dÃ¹ng hiá»ƒu worker, model hay queue.

## 2. Äiá»ƒm xuáº¥t phÃ¡t vÃ  pháº§n cáº§n sá»­a trÆ°á»›c

| Hiá»‡n tráº¡ng xÃ¡c minh | TÃ¡c Ä‘á»™ng | Viá»‡c cáº§n lÃ m |
|---|---|---|
| Java 21, Spring Boot modular monolith, PostgreSQL/Flyway; React/TypeScript/Vite/Tailwind/Zustand | ÄÃ£ Ä‘á»§ cho pháº¡m vi nÃ y | Giá»¯ stack, chÆ°a tÃ¡ch microservices |
| CÃ³ queue/outbox, idempotency, quota, CSRF/JWT, account deletion vÃ  audio retention | CÃ³ ná»n Ä‘á»ƒ váº­n hÃ nh viá»‡c AI tá»‘n phÃ­ | Má»Ÿ rá»™ng cÃ¹ng cÆ¡ cháº¿, khÃ´ng táº¡o scheduler/queue song song |
| `DevelopmentSpeakingEvaluationAdapter`, `DevelopmentAudioObjectStorage`, extraction giáº£, email in-memory | Luá»“ng há»c tháº­t cÃ²n phá»¥ thuá»™c provider | Viáº¿t adapter production vÃ  test há»£p Ä‘á»“ng |
| `speaking_sessions.topic_id` Ä‘ang NOT NULL; session chá»‰ khá»Ÿi táº¡o tá»« topic | Brief cÃ¡ nhÃ¢n/chá»¯a lá»—i khÃ´ng vá»«a contract | ThÃªm nguá»“n prompt vÃ  mode theo má»¥c 5; khÃ´ng nhÃ©t Ä‘á» cÃ¡ nhÃ¢n vÃ o catalog toÃ n cá»¥c |
| Má»™t speaking session active/user; Study táº¡o sáºµn má»i child, tá»‘i Ä‘a 2 bÆ°á»›c | Hai bÆ°á»›c nÃ³i trong cÃ¹ng buá»•i sáº½ xung Ä‘á»™t | Study má»›i materialize tá»«ng bÆ°á»›c, giá»¯ tÆ°Æ¡ng thÃ­ch luá»“ng legacy |
| Backend mistake status: `active/resolved/ignored`; frontend dÃ¹ng `needsPractice/improving/mastered` | Gá»­i `improving` bá»‹ tá»« chá»‘i; dá»¯ liá»‡u status tháº­t bá»‹ map sai | DÃ¹ng enum wire chuáº©n vÃ  tÃ¡ch evidence stage riÃªng |
| `MistakeOccurrenceView` cÃ³ evaluationId; frontend gÃ¡n speakingSessionId rá»—ng | KhÃ´ng má»Ÿ Ä‘Ãºng báº£n ghi gá»‘c Ä‘Æ°á»£c | Bá»• sung liÃªn káº¿t attempt/session vÃ  availability trong API Ä‘á»c |
| Profile tá»± Ä‘Ã¡nh giÃ¡: `beginner/elementary/intermediate/unspecified`; topic level: `A2-B1/B1-B2/B2+` | Recommendation cáº§n mapping rÃµ rÃ ng | ThÃªm `PracticeLevelResolver`, khÃ´ng truyá»n tháº³ng profile level vÃ o filter topic |
| Video shadowing lÆ°u `score: 93` cá»‘ Ä‘á»‹nh, roleplay má»Ÿ lÆ°á»£t soáº¡n sáºµn | CÃ³ nguy cÆ¡ hiá»ƒu demo lÃ  káº¿t quáº£ Ä‘o | Gáº¯n tráº¡ng thÃ¡i demo/chÆ°a cÃ³ cháº¥m tháº­t; chá»‰ báº­t roleplay tháº­t sau nghiá»‡m thu |
| TÃ i liá»‡u PROJECT váº«n mÃ´ táº£ giai Ä‘oáº¡n frontend mock | Dá»… triá»ƒn khai theo giáº£ Ä‘á»‹nh cÅ© | Cáº­p nháº­t báº£ng capability vÃ  liÃªn káº¿t plan nÃ y khi báº¯t Ä‘áº§u thá»±c hiá»‡n |

Baseline tá»« lÆ°á»£t Ä‘Ã¡nh giÃ¡ trÆ°á»›c: 35/35 frontend tests qua; TypeScript vÃ  build qua; lint 119 warnings, 0 errors. Sau khi báº¯t Ä‘áº§u triá»ƒn khai, frontend hiá»‡n cÃ³ 39 tests qua; backend suite hiá»‡n cÃ³ 112 tests qua; usage receipt/provider parsing Ä‘Ã£ cÃ³ targeted coverage. Claude/Deepgram client vÃ  S3 versioned audio core Ä‘Ã£ cÃ³ test giáº£ láº­p; provider smoke tháº­t, orphan cleanup vÃ  browser smoke váº«n lÃ  gate cá»§a M1+.

## 3. DÃ¹ng nhá»¯ng cÃ´ng nghá»‡ vÃ  dá»‹ch vá»¥ nÃ o

### 3.1 Lá»±a chá»n Ä‘á» xuáº¥t

| Nhu cáº§u | Chá»n cho báº£n Ä‘áº§u | TÃ­ch há»£p á»Ÿ Ä‘Ã¢u | Cáº§n chuáº©n bá»‹ |
|---|---|---|---|
| API vÃ  nghiá»‡p vá»¥ | Spring Boot hiá»‡n cÃ³ | CÃ¡c module hiá»‡n táº¡i + `content` má»›i | Java 21, Maven wrapper, cáº¥u hÃ¬nh dev/test/prod |
| Dá»¯ liá»‡u | PostgreSQL hiá»‡n cÃ³ | JPA/JDBC + Flyway | Database local, DB staging, backup/restore |
| AI ngÃ´n ngá»¯ | Claude API qua adapter | Extraction, feedback, brief, roleplay | API key backend, model ID Ä‘Æ°á»£c benchmark vÃ  pin, ngÃ¢n sÃ¡ch |
| STT | Deepgram prerecorded API | `SpeakingTranscriptionPort` | Key backend; táº­p audio tiáº¿ng Anh cá»§a ngÆ°á»i Viá»‡t Ä‘á»ƒ Ä‘Ã¡nh giÃ¡ |
| TTS tiáº¿ng Anh | Deepgram TTS qua adapter riÃªng | Máº«u cÃ¢u, cÃ¢u tráº£ lá»i roleplay | Voice ID cá»‘ Ä‘á»‹nh vÃ  kiá»ƒm tra tÃªn riÃªng/thuáº­t ngá»¯ |
| Audio storage | AWS S3 cÃ³ versioning | `AudioObjectStorage` | Bucket private tÃ¡ch dev/staging/prod; IAM vÃ  CORS Ä‘Ãºng origin |
| Email auth | Resend | `IdentityEmailSender` | Domain gá»­i Ä‘Ã£ xÃ¡c minh, API key, máº«u verify/reset |
| Web | React/Router/Tailwind/Zustand hiá»‡n cÃ³ | Route/page/component/service | Giá»¯ API client hiá»‡n táº¡i, type sinh tá»« OpenAPI |
| Kiá»ƒm tra audio | `ffprobe`/FFmpeg Ä‘Ã³ng gÃ³i trong worker image | Adapter kiá»ƒm Ä‘á»‹nh media | Chá»‘t báº£n binary vÃ  kiá»ƒm tra Ä‘á»‹nh dáº¡ng browser thá»±c dÃ¹ng |
| E2E | Playwright + axe cho kiá»ƒm tra tá»± Ä‘á»™ng há»— trá»£ accessibility | `frontend/e2e/` | `@playwright/test`, `@axe-core/playwright`; browser CI |

ÄÃ¢y lÃ  cáº¥u hÃ¬nh triá»ƒn khai hiá»‡n táº¡i; key vÃ  smoke test tráº£ phÃ­ váº«n cáº§n staging. Claude model vÃ  Deepgram model Ä‘Ã£ cÃ³ default ID dáº¡ng pin trong env, cÃ²n voice vÃ  ngÃ¢n sÃ¡ch cá»¥ thá»ƒ pháº£i Ä‘Æ°á»£c benchmark rá»“i ghi vÃ o ADR trÆ°á»›c khi báº­t rá»™ng.

Claude há»— trá»£ Ä‘áº§u ra theo schema; backend váº«n pháº£i kiá»ƒm tra Ã½ nghÄ©a vÃ  giá»›i háº¡n ná»™i dung. [TÃ i liá»‡u structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs). Deepgram cÃ³ API nháº­n file Ã¢m thanh vÃ  TTS; Ä‘Ã¢y lÃ  cÆ¡ sá»Ÿ chá»n thá»­ nghiá»‡m, khÃ´ng pháº£i báº±ng chá»©ng tá»‘t nháº¥t cho má»i giá»ng Viá»‡t. [STT](https://developers.deepgram.com/docs/pre-recorded-audio), [TTS](https://developers.deepgram.com/docs/text-to-speech).

S3 há»— trá»£ presigned URL vÃ  versioning, phÃ¹ há»£p contract lÆ°u `objectVersion` hiá»‡n cÃ³. [Presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), [Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html). KhÃ´ng thay báº±ng má»™t dá»‹ch vá»¥ â€œS3-compatibleâ€ náº¿u chÆ°a kiá»ƒm chá»©ng version/read/delete semantics.

### 3.2 Dependencies cáº§n bá»• sung

- Backend: AWS SDK for Java 2.x module s3, hiá»‡n pin 2.31.29 trong Maven; cáº­p nháº­t qua ADR sau kiá»ƒm tra tÆ°Æ¡ng thÃ­ch.
- DÃ¹ng Spring `RestClient` vÃ  DTO/Jackson hiá»‡n cÃ³ cho Claude, Deepgram, Resend; tÃ¡ch client theo provider, cáº¥u hÃ¬nh HTTP timeout tháº­t. [Spring REST clients](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html).
- ChÆ°a cáº§n thÃªm LangChain, Spring AI, Redis, Kafka, vector database hoáº·c graph database cho pháº¡m vi nÃ y.
- Frontend chÆ°a cáº§n thÃªm UI framework, chart library hay state library. Native audio + hook hiá»‡n cÃ³ Ä‘Ã¡p á»©ng báº£n Ä‘áº§u; báº£ng vÃ  SVG Ä‘Æ¡n giáº£n Ä‘Ã¡p á»©ng bÃ¡o cÃ¡o nhá».
- Dev dependencies má»›i: Playwright vÃ  axe; giá»¯ Vitest/Testing Library. DÃ¹ng package manager/lockfile Yarn hiá»‡n cÃ³, khÃ´ng sinh thÃªm package-lock.
- KhÃ´ng cáº§n SDK provider phÃ­a browser. Má»i secret Ä‘áº·t backend.

### 3.3 Cáº¥u hÃ¬nh pháº£i cÃ³

CÃ¡c tÃªn dÆ°á»›i lÃ  **biáº¿n cáº¥u hÃ¬nh má»›i Ä‘á» xuáº¥t**, chá»‰ cÃ³ tÃ¡c dá»¥ng sau khi thÃªm validated configuration properties; khÃ´ng coi chÃºng Ä‘Ã£ Ä‘Æ°á»£c app há»— trá»£.

| NhÃ³m | Cáº¥u hÃ¬nh Ä‘á» xuáº¥t |
|---|---|
| AI | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_CONNECT_TIMEOUT`, `AI_REQUEST_TIMEOUT`, `AI_MAX_OUTPUT_TOKENS` |
| Speech | `DEEPGRAM_API_KEY`, `STT_MODEL`, `TTS_VOICE`, `STT_REQUEST_TIMEOUT`, `TTS_REQUEST_TIMEOUT` |
| Storage | `AUDIO_S3_BUCKET`, `AWS_REGION`, credentials qua IAM role; `AUDIO_INSPECTION_TIMEOUT`, `AUDIO_RETENTION_DAYS` |
| Email | `RESEND_API_KEY`, `IDENTITY_EMAIL_FROM`, `PUBLIC_APP_URL` |
| Budget | `AI_DAILY_BUDGET_MICRO_USD`, quota tá»«ng operation; rate card version dÃ¹ng tÃ­nh chi phÃ­ |
| Feature | `FEATURE_REMEDIATION`, `FEATURE_CONTENT_PRACTICE`, `FEATURE_DAILY_PLAN`, `FEATURE_DIALOGUE`, `FEATURE_LEARNING_EVIDENCE` |

Giá»¯ nguyÃªn cÃ¡c biáº¿n JWT/DB/CSRF/origin vÃ  fake flags hiá»‡n cÃ³. Prod pháº£i fail startup náº¿u báº­t capability nhÆ°ng thiáº¿u provider/config; dev/test cho phÃ©p fake rÃµ nguá»“n. ThÃªm `GET /api/v1/me/capabilities` vÃ  `/me/usage` Ä‘á»ƒ frontend biáº¿t quyá»n dÃ¹ng vÃ  quota cÃ²n láº¡i, khÃ´ng tá»± suy ra tá»« environment client. Má»i endpoint váº«n thá»±c thi guard riÃªng.

## 4. Kiáº¿n trÃºc backend

### 4.1 Ranh giá»›i module

| Module | TrÃ¡ch nhiá»‡m sau má»Ÿ rá»™ng |
|---|---|
| `identity` | Email tháº­t, verification UI contract, auth/recovery vÃ  deletion hiá»‡n cÃ³ |
| `learner` | Má»¥c tiÃªu há»c, bá»‘i cáº£nh cÃ´ng viá»‡c, má»©c bÃ i luyá»‡n Ä‘Æ°á»£c chá»n; thay Ä‘á»•i cáº¥u hÃ¬nh báº±ng version |
| `content` â€” má»›i | VÄƒn báº£n nguá»“n riÃªng tÆ°, revision, segment, xÃ³a nguá»“n; khÃ´ng Ä‘iá»u khiá»ƒn phiÃªn há»c |
| `vocabulary` | Tá»«/chunk Ä‘Ã£ lÆ°u, nguá»“n vÃ­ dá»¥, extraction, review session; khÃ´ng tá»± cháº¥m speaking |
| `speaking` | Cáº£ monologue, remediation vÃ  dialogue; chung session/attempt/audio, brief, turn, evaluation |
| `study` | Káº¿ hoáº¡ch ngÃ y, thá»© tá»± bÆ°á»›c, materialize/advance/complete/abandon, Ä‘iá»u phá»‘i public APIs |
| `progress` | Sá»• lá»—i, lá»‹ch luyá»‡n má»¥c tiÃªu, evidence vÃ  projection; khÃ´ng gá»i provider trong consumer |
| `platform` | Queue/outbox, idempotency, quota, provider usage, guards vÃ  metrics dÃ¹ng chung |

KhÃ´ng thÃªm module media chung ngay: toÃ n bá»™ báº£n ghi trong pháº¡m vi nÃ y thuá»™c Speaking. Máº«u TTS cÅ©ng do Speaking quáº£n lÃ½. CÃ¡c adapter transport chung khÃ´ng Ä‘Æ°á»£c biáº¿n thÃ nh nÆ¡i chá»©a nghiá»‡p vá»¥ há»c.

Module chá»‰ gá»i `application.publicapi` cá»§a module khÃ¡c; khÃ´ng import repository/entity chÃ©o module. FK cÆ¡ sá»Ÿ dá»¯ liá»‡u Ä‘Æ°á»£c cÃ¢n nháº¯c theo precedent hiá»‡n táº¡i nhÆ°ng khÃ´ng táº¡o cross-module JPA association. Event payload cÃ³ schemaVersion vÃ  ID á»•n Ä‘á»‹nh.

### 4.2 Luá»“ng dá»¯ liá»‡u chÃ­nh

```mermaid
flowchart LR
    UI[React app] --> API[Spring API]
    API --> C[Content vÃ  Vocabulary]
    API --> S[Speaking]
    API --> D[Study]
    D --> C
    D --> S
    C --> Q[PostgreSQL jobs]
    S --> Q
    Q --> P[Claude / Deepgram / S3]
    P --> R[Káº¿t quáº£ Ä‘Ã£ kiá»ƒm tra]
    R --> O[Outbox]
    O --> G[Progress: lá»—i vÃ  báº±ng chá»©ng]
    G --> D
```

Khi worker gá»i provider, khÃ´ng giá»¯ transaction database má»Ÿ. Claim â†’ gá»i provider â†’ validate â†’ commit káº¿t quáº£ + usage/quota + outbox báº±ng lease fencing. Retry á»Ÿ bÆ°á»›c feedback khÃ´ng gá»i láº¡i STT Ä‘Ã£ checkpoint thÃ nh cÃ´ng.

### 4.3 CÃ¡c public port cáº§n thÃªm/má»Ÿ rá»™ng

- `ContentSources`: create/read owned revision, list, delete; `ContentSourceSnapshot` chá»‰ tráº£ ná»™i dung cá»§a Ä‘Ãºng owner.
- `VocabularyContextAnalysis`: nháº­n thÃªm optional sourceId/sourceRevision, váº«n há»— trá»£ input text cÅ©.
- `SpeakingPractice`: thÃªm startFromBrief vÃ  startDialogue; giá»¯ start(topicId) cho legacy.
- `PracticeBriefs`: yÃªu cáº§u táº¡o brief, Ä‘á»c tráº¡ng thÃ¡i; loáº¡i `content` hoáº·c `remediation`.
- `DialogueSessions`: submit turn, hint, finish, restore; `SpeechSynthesis` cho audio máº«u vÃ  lÆ°á»£t AI.
- `LearningTargetQueries`: má»¥c tiÃªu Ä‘áº¿n háº¡n vÃ  snapshot pattern/chunk; khÃ´ng má»Ÿ repository Progress sang Speaking.
- `LearningEvidenceQueries`: káº¿t quáº£ cÃ³ nguá»“n, so sÃ¡nh attempt, Ä‘iá»u kiá»‡n Ä‘á»§ dá»¯ liá»‡u.
- `DailyStudyPlans`: compose/get/start; `StudySessions` má»Ÿ rá»™ng activate step cho flow má»›i.
- `ProviderUsageRecorder`: má»™t báº£n ghi/call attempt, usage tháº­t hoáº·c tráº¡ng thÃ¡i chÆ°a biáº¿t; khÃ´ng giáº£ Ä‘á»‹nh quota há»c báº±ng phÃ­ provider.

## 5. Thiáº¿t káº¿ dá»¯ liá»‡u vÃ  migration

TÃªn báº£ng/field dÆ°á»›i Ä‘Ã¢y lÃ  thiáº¿t káº¿ Ä‘Ã­ch. Táº¥t cáº£ dá»¯ liá»‡u cÃ¡ nhÃ¢n cÃ³ userId, createdAt/updatedAt; aggregate ghi Ä‘á»“ng thá»i cÃ³ `version`. DTO dÃ¹ng camelCase, DB dÃ¹ng snake_case. Timestamp lÆ°u UTC; ngÃ y há»c dÃ¹ng timezone snapshot cá»§a phiÃªn.

### 5.1 Ná»™i dung vÃ  tá»«/cá»¥m

| Báº£ng | Field quan trá»ng | RÃ ng buá»™c/index |
|---|---|---|
| `content_sources` | id, user_id, title, source_type=`pasted_text`, current_revision, lifecycle=`ACTIVE/DELETING`, version | Index user/created_at/id; title â‰¤200 |
| `content_source_revisions` | source_id, revision, body_text, content_hash, detected_language, created_at | PK source/revision; text 50â€“10.000 kÃ½ tá»± báº£n Ä‘áº§u; immutable |
| `content_segments` | id, source_id, revision, position, text, start_offset, end_offset | Unique source/revision/position; offset UTF-16 half-open trÃªn text Ä‘Ã£ chuáº©n hÃ³a newline |
| Má»Ÿ rá»™ng `vocabulary_context_analyses` | nullable source_id/source_revision, extraction_version | Ná»™i dung snapshot phá»¥c vá»¥ job; váº«n giá»¯ expiry hiá»‡n cÃ³ |
| Má»Ÿ rá»™ng `vocabulary_words` | item_kind=`WORD/CHUNK`, optional usage_note | Giá»¯ semantic identity user/language/normalized_word/sense_key; khÃ´ng phÃ¡ cÃ¡c review cÅ© |
| `vocabulary_source_links` | id, word_id, source_id/segment_id nullable, source_revision, example_snapshot, example_origin=`SOURCE/GENERATED`, offsets | Má»™t tá»«/chunk cÃ³ nhiá»u nguá»“n; check origin vÃ  offset; index word_id |

Sá»­a source táº¡o revision má»›i; analysis/brief Ä‘Ã£ táº¡o váº«n gáº¯n revision cÅ©. Save 3â€“5 chunks dÃ¹ng upsert tá»« vá»±ng hiá»‡n cÃ³. Analysis 7 ngÃ y cÃ³ thá»ƒ háº¿t háº¡n mÃ  tá»« Ä‘Ã£ lÆ°u vÃ  nguá»“n cÃ²n tá»“n táº¡i. KhÃ´ng lÆ°u tÃ i liá»‡u quan trá»ng chá»‰ trong record analysis táº¡m.

XÃ³a source: cháº·n job má»›i, há»§y job Ä‘ang Ä‘á»£i, worker Ä‘ang cháº¡y pháº£i recheck trÆ°á»›c commit; xÃ³a revision/segment/analysis/brief chÆ°a há»c chá»©a nguá»“n. Dialog xÃ¡c nháº­n nÃªu rÃµ cÃ¡c tá»«/cá»¥m Ä‘Ã£ chá»§ Ä‘á»™ng lÆ°u Ä‘Æ°á»£c giá»¯ nhÆ° ghi chÃº riÃªng, liÃªn káº¿t nguá»“n Ä‘á»•i thÃ nh â€œNguá»“n Ä‘Ã£ xÃ³aâ€; cÃ³ lá»±a chá»n xÃ³a cáº£ vÃ­ dá»¥ sao chÃ©p tá»« nguá»“n. Transcript do ngÆ°á»i há»c Ä‘Ã£ nÃ³i Ä‘Æ°á»£c quáº£n lÃ½ theo lá»‹ch sá»­ Speaking. Account deletion xÃ³a toÃ n bá»™ nhá»¯ng dá»¯ liá»‡u nÃ y, khÃ´ng giá»¯ ngoáº¡i lá»‡.

### 5.2 Speaking dÃ¹ng chung ba mode

Má»Ÿ rá»™ng `speaking_sessions`:

- `mode`: `MONOLOGUE` máº·c Ä‘á»‹nh cho dá»¯ liá»‡u cÅ©, `REMEDIATION`, `DIALOGUE`.
- `prompt_origin`: `CATALOG`, `BRIEF`, `SCENARIO`; thÃªm nullable `brief_id`, `scenario_id`; topic_id vÃ  topic_revision chá»‰ nullable cho nguá»“n khÃ´ng pháº£i CATALOG.
- Check Ä‘Ãºng má»™t nguá»“n: CATALOG cÃ³ topic; BRIEF cÃ³ brief; SCENARIO cÃ³ scenario; prompt_snapshot vÃ  prompt_revision luÃ´n cÃ³.
- `targets_snapshot` JSON, `rubric_version`, `evaluation_schema_version`, optional `baseline_attempt_id`, `coaching_mode`.
- Giá»¯ má»™t session IN_PROGRESS/user cho cáº£ ba mode.
- Giá»¯ lifecycle hiá»‡n cÃ³ `IN_PROGRESS/COMPLETED/ABANDONED`; tráº¡ng thÃ¡i xá»­ lÃ½ AI náº±m á»Ÿ resource job/evaluation riÃªng.

| Báº£ng | Field quan trá»ng | Quy táº¯c |
|---|---|---|
| `speaking_practice_briefs` | id, user_id, kind, source_ref, origin_occurrence_id nullable, baseline_attempt_id nullable, status, revision, prompt_json, targets_json, generation_job_id, provider/model/prompt_version | PENDING/READY/FAILED; brief READY immutable; regenerate táº¡o revision/resource má»›i |
| `speaking_scenarios` | id, revision, title, level_band, roles, objectives_json, opener, turn_limit, duration_budget_seconds, archived_at | Ná»™i dung seed cÃ³ phiÃªn báº£n; phiÃªn chá»¥p snapshot |
| `speaking_transcriptions` | id, attempt_id, raw_text, word_timings_json, provider/model, source, confidence nullable | Má»™t transcript STT chuáº©n/attempt; trÆ°á»ng cÅ© váº«n Ä‘Æ°á»£c tráº£ tÆ°Æ¡ng thÃ­ch |
| `speaking_transcript_amendments` | id, transcription_id, user_id, corrected_text, created_at | KhÃ´ng ghi Ä‘Ã¨ raw STT; evidence cÃ³ amendment khÃ´ng Ä‘á»§ cho nháº­n xÃ©t phÃ¡t Ã¢m |
| `speaking_dialogue_turns` | id, session_id, ordinal, speaker, attempt_id nullable, text, processing_status, reply_to_turn_id, hint_used, created_at | Unique session/ordinal; unique reply_to_turn_id cho cÃ¢u AI Ä‘Ã¡p; má»™t lÆ°á»£t user Ä‘ang xá»­ lÃ½/session |
| `speaking_synthesized_audio` | id, user_id, session_id hoáº·c brief_id, turn_id nullable, text_hash, voice/model, object_key/version, status, expires_at | Audio riÃªng tÆ° theo owner; khÃ´ng cache xuyÃªn user cho ná»™i dung cÃ¡ nhÃ¢n |
| `speaking_session_evaluations` | id, session_id, status, result_json, schema/rubric/prompt/model versions, job_id, quota_reservation_id | Má»™t final evaluation/dialogue session; checkpoint vÃ  unique session_id |
| `speaking_feedback_reports` | id, user_id, evaluation_ref, feedback_item_id, reason_code, optional note | Cho bÃ¡o pháº£n há»“i sai; khÃ´ng tá»± xÃ³a occurrence lá»‹ch sá»­ |

`speaking_attempts` váº«n lÃ  nguá»“n sá»± tháº­t cho audio upload/seal/duration/retention. Má»™t lÆ°á»£t user trong dialogue tham chiáº¿u má»™t attempt thuá»™c Ä‘Ãºng session; khÃ´ng lÆ°u blob, signed URL hoáº·c báº£n sao audio trong báº£ng turn.

Dialogue khÃ´ng gá»i cháº¥m toÃ n bÃ i cho tá»«ng turn. STT phá»¥c vá»¥ táº¡o reply; final evaluation cháº¡y má»™t láº§n sau finish. Extend feedback store/event vá»›i evaluation scope `ATTEMPT/SESSION`, khÃ´ng táº¡o ID attempt giáº£ cho final evaluation. Giá»¯ contract attempt evaluation cÅ©; Ä‘Æ°a pháº§n evaluate transcription/targets dÃ¹ng chung vÃ o service ná»™i bá»™.

Monologue/remediation complete váº«n chá»n attempt Ä‘Ã£ cháº¥m theo contract cÅ©. Dialogue complete dÃ¹ng endpoint riÃªng, khÃ´ng yÃªu cáº§u selectedAttemptId; chá»‰ hoÃ n thÃ nh sau final evaluation thÃ nh cÃ´ng. Worker gá»i domain finalizer Ä‘Æ°á»£c báº£o vá»‡ version/lease; khÃ´ng cho client tá»± gÃ¡n completed.

### 5.3 Evidence vÃ  lá»‹ch chá»¯a lá»—i

| Báº£ng | Field quan trá»ng | RÃ ng buá»™c/index |
|---|---|---|
| `progress_learning_targets` | id, user_id, target_kind=`PATTERN/CHUNK`, pattern_id hoáº·c word_id, taxonomy_version, next_due_at, evidence_stage, schedule_version, version | Unique owner/kind/ref/taxonomy; index user/next_due_at |
| `progress_learning_evidence` | id, target_id, source_evaluation_id, evaluation_scope, feedback_item_id nullable, session_id, attempt_id nullable, outcome, context_key, practice_phase, hint_used, transcript_amended, rubric_version, occurred_at | Unique target/evaluation/scope/phase; append-only; index target/occurred_at |
| `progress_attempt_comparisons` | id, user_id, baseline_attempt_id, followup_attempt_id, target_snapshot, comparison_kind, comparability, reason_codes, result_json nullable, rubric_version | Unique user/pair/rubric; owner kiá»ƒm tra cáº£ hai attempts |

Outcome: `CORRECT`, `INCORRECT`, `NOT_OBSERVED`, `UNCERTAIN`. `NOT_OBSERVED` khÃ´ng pháº£i Ä‘Ãºng: ngÆ°á»i há»c cÃ³ thá»ƒ trÃ¡nh dÃ¹ng cáº¥u trÃºc. `UNCERTAIN` khÃ´ng lÃ m giáº£m hoáº·c tÄƒng thÃ nh tÃ­ch. Backend kiá»ƒm tra báº±ng chá»©ng trÃ­ch tá»« transcript thá»±c; khÃ´ng láº¥y self-reported boolean tá»« frontend.

TÃ¡ch hai loáº¡i tráº¡ng thÃ¡i:

- **Sá»• lá»—i** giá»¯ `active/resolved/ignored` Ä‘á»ƒ ngÆ°á»i há»c quáº£n lÃ½ danh sÃ¡ch. Báº¥m â€œÄÃ£ xá»­ lÃ½â€ chá»‰ Ä‘á»•i tráº¡ng thÃ¡i sá»•, khÃ´ng táº¡o evidence.
- **Má»©c báº±ng chá»©ng** má»›i: `not_practiced`, `practicing`, `improving`, `demonstrated`. Server tÃ­nh tá»« evidence; UI khÃ´ng PATCH trá»±c tiáº¿p.
- Quy táº¯c v1: `improving` sau má»™t láº§n tá»± nÃ³i Ä‘Ãºng khÃ´ng hint; `demonstrated` sau Ã­t nháº¥t hai láº§n Ä‘Ãºng á»Ÿ hai context khÃ¡c nhau, hai ngÃ y khÃ¡c nhau vÃ  cÃ³ má»™t láº§n kiá»ƒm tra cháº­m Ã­t nháº¥t 24 giá». ÄÃ¢y lÃ  quy táº¯c sáº£n pháº©m, khÃ´ng kháº³ng Ä‘á»‹nh Ä‘Ã£ thÃ nh tháº¡o ngÃ´n ngá»¯.
- NgÃ y luyá»‡n láº¡i: sau bÃ i Ä‘áº§u +1 ngÃ y, sau lÆ°á»£t Ä‘Ãºng káº¿ tiáº¿p +3, rá»“i +7; sai quay +1; uncertain/no opportunity khÃ´ng pháº¡t. CÃ³ tá»‘i Ä‘a 2 má»¥c tiÃªu chá»¯a lá»—i/ngÃ y. Schedule v1 Ä‘á»™c láº­p SRS cá»§a tá»« vá»±ng.
- Khi Ä‘Ã£ demonstrated mÃ  xuáº¥t hiá»‡n lá»—i má»›i, evidence_stage quay practicing; giá»¯ lá»‹ch sá»­ thay vÃ¬ xÃ³a thÃ nh tÃ­ch cÅ©.

### 5.4 Daily plan vÃ  Study

| Báº£ng/thay Ä‘á»•i | Field quan trá»ng | Quy táº¯c |
|---|---|---|
| `study_daily_plans` | id, user_id, local_date, timezone_snapshot, goal_minutes, plan_version, state, input_snapshot, recommendation_reasons, planner_version | Unique user/local_date/timezone/plan_version; partial unique user/local_date/timezone WHERE is_current=true; READY/STARTED/COMPLETED/EXPIRED |
| `study_daily_plan_steps` | id, plan_id, position, kind, practice_mode nullable, target_refs, estimated_seconds, preparation_status, brief_id nullable | Unique plan/position; khÃ´ng táº¡o child session táº¡i Ä‘Ã¢y |
| Má»Ÿ rá»™ng `study_sessions` | nullable daily_plan_id; execution_mode=`LEGACY_EAGER/LAZY` | Dá»¯ liá»‡u cÅ© default LEGACY_EAGER |
| Má»Ÿ rá»™ng `study_steps` | execution_status=`PENDING/ACTIVE/COMPLETED/SKIPPED/ABANDONED`, specification_json, practice_mode nullable, activated_at | BÆ°á»›c PENDING/SKIPPED chÆ°a kÃ­ch hoáº¡t Ä‘Æ°á»£c phÃ©p chÆ°a cÃ³ child |

Giá»¯ `kind=VOCABULARY/SPEAKING`; chá»¯a lá»—i/dialogue lÃ  `practice_mode` cá»§a Speaking, khÃ´ng dá»±ng thÃªm child aggregate trÃ¹ng audio. Thay constraint child cá»§a V11 báº±ng constraint má»›i: PENDING khÃ´ng child; ACTIVE/COMPLETED Ä‘Ãºng má»™t child phÃ¹ há»£p kind; SKIPPED chÆ°a kÃ­ch hoáº¡t khÃ´ng child; ABANDONED cÃ³ hoáº·c khÃ´ng child nhÆ°ng náº¿u cÃ³ pháº£i Ä‘Ãºng kind. Unique reference cho má»—i child váº«n giá»¯.

API create Study cÅ© tiáº¿p tá»¥c chá»‰ nháº­n cÃ¡c tá»• há»£p legacy hiá»‡n cÃ³, tá»‘i Ä‘a 2 bÆ°á»›c vÃ  eager semantics. API start daily plan má»›i dÃ¹ng LAZY tá»‘i Ä‘a 3 bÆ°á»›c. KhÃ´ng Ä‘á»•i ngáº§m semantics cÅ©. DTO tráº£ mode/status má»›i theo kiá»ƒu bá»• sung; cáº­p nháº­t frontend Ä‘á»c Ä‘Æ°á»£c trÆ°á»›c khi báº­t flow LAZY.

### 5.5 Migration strategy

- Repo hiá»‡n Ä‘Ã£ cÃ³ V16 Ä‘ang trong working tree. Khi triá»ƒn khai láº¥y sá»‘ migration tiáº¿p theo thá»±c táº¿, khÃ´ng máº·c Ä‘á»‹nh chiáº¿m V17 hoáº·c sá»­a migration Ä‘Ã£ cháº¡y.
- NhÃ³m migration theo feature: capability/usage â†’ prompt origin & evidence â†’ content & source links â†’ lazy Study â†’ dialogue & final evaluation â†’ comparison indexes.
- Expand trÆ°á»›c: field nullable/default, backfill dá»¯ liá»‡u cÅ© theo batch, kiá»ƒm tra, rá»“i thÃªm constraint. KhÃ´ng Ä‘á»ƒ legacy topic snapshot biáº¿n thÃ nh brief rá»—ng.
- Vocab cÅ© cÃ³ `interval_days <=30`; náº¿u triá»ƒn khai FSRS á»Ÿ giai Ä‘oáº¡n sau pháº£i thay constraint, dá»¯ liá»‡u scheduler vÃ  undo snapshots cÃ¹ng nhau. FSRS khÃ´ng thuá»™c critical path cá»§a 5 tÃ­nh nÄƒng.
- Daily/activity ledger cÅ© khÃ´ng backfill Ä‘iá»ƒm tá»‘t tá»« mastery/streak. Dá»¯ liá»‡u thiáº¿u evidence hiá»ƒn thá»‹ â€œChÆ°a cÃ³ dá»¯ liá»‡u so sÃ¡nhâ€.
- Test upgrade tá»« snapshot schema V16 vÃ  khá»Ÿi táº¡o database rá»—ng. KhÃ´ng dÃ¹ng `ddl-auto=update`.

## 6. Luá»“ng nghiá»‡p vá»¥ chi tiáº¿t

### 6.1 F1 â€” Sá»­a lá»—i rá»“i nÃ³i láº¡i

1. Sau speaking evaluation, UI hiá»‡n tá»‘i Ä‘a hai correction cÃ³ Ã½ nghÄ©a; má»—i correction cÃ³ feedbackItemId, occurrenceId, báº£n ghi/cÃ¢u gá»‘c.
2. NgÆ°á»i há»c chá»n â€œLuyá»‡n lá»—i nÃ yâ€. Backend xÃ¡c minh owner, lá»—i cÃ²n dÃ¹ng Ä‘Æ°á»£c, reserve quota, táº¡o brief generation job. Náº¿u phiÃªn gá»‘c cÃ²n active, pháº£i hoÃ n thÃ nh/abandon qua flow rÃµ rÃ ng trÆ°á»›c khi táº¡o phiÃªn remediation; táº¡o brief thÃ¬ Ä‘Æ°á»£c phÃ©p.
3. Worker táº¡o giáº£i thÃ­ch tiáº¿ng Viá»‡t ngáº¯n, cÃ¢u máº«u vÃ  cÃ¢u há»i má»›i báº¯t buá»™c táº¡o cÆ¡ há»™i dÃ¹ng cáº¥u trÃºc. KhÃ´ng táº¡o distractor báº±ng thay chuá»—i mÃ¡y mÃ³c.
4. UI cho Ä‘á»c/nghe máº«u; báº¯t Ä‘áº§u remediation session tá»« brief Ä‘Ã£ READY.
5. NgÆ°á»i há»c nÃ³i 10â€“45 giÃ¢y, upload, STT, evaluation theo target. CÃ³ hint thÃ¬ lÆ°u hintUsed, khÃ´ng tÃ­nh lÆ°á»£t Ä‘Ã³ lÃ  tá»± dÃ¹ng Ä‘á»™c láº­p.
6. Káº¿t quáº£ chá»‰ rÃµ cÃ¢u báº±ng chá»©ng, Ä‘Ãºng/sai/chÆ°a quan sÃ¡t Ä‘Æ°á»£c vÃ  má»™t viá»‡c cáº§n lÃ m tiáº¿p. Thá»­ láº¡i táº¡o attempt má»›i; khÃ´ng xÃ³a attempt trÆ°á»›c.
7. Complete session phÃ¡t event duration má»™t láº§n; evaluation phÃ¡t evidence má»™t láº§n. Progress lÃªn lá»‹ch láº§n sau, khÃ´ng tÃ­nh láº¡i khi event replay.

### 6.2 F2 â€” Tá»« tÃ i liá»‡u tá»›i bÃ i nÃ³i

1. Form nháº­n title, vÄƒn báº£n vÃ  má»¥c tiÃªu â€œTÃ´i cáº§n nÃ³i Ä‘iá»u gÃ¬?â€ tá»‘i Ä‘a 500 kÃ½ tá»±; preview ná»™i dung sáº½ gá»­i AI.
2. Táº¡o source revision, gá»i extraction hiá»‡n cÃ³ vá»›i source ref; polling khÃ´i phá»¥c Ä‘Æ°á»£c sau refresh.
3. AI gá»£i Ã½ tá»‘i Ä‘a 8 items; máº·c Ä‘á»‹nh chá»n 3, cho chá»n tá»‘i Ä‘a 5; cÃ³ nghÄ©a, cÃ¢u gá»‘c, giáº£i thÃ­ch vÃ¬ sao há»¯u Ã­ch.
4. NgÆ°á»i há»c chá»‰nh nghÄ©a/vÃ­ dá»¥ rá»“i lÆ°u qua vocabulary semantic upsert; nhiá»u nguá»“n khÃ´ng táº¡o nhiá»u báº£n tá»« cÃ¹ng sense.
5. YÃªu cáº§u táº¡o content brief cÃ³ 1 má»¥c tiÃªu giao tiáº¿p, 3â€“5 chunks, gá»£i Ã½ dÃ n Ã½ vÃ  rubric. Backend chá»‰ nháº­n wordIds Ä‘Ã£ lÆ°u, tá»± Ä‘á»c ná»™i dung thuá»™c owner.
6. Khi READY: â€œÃ”n cá»¥m tá»« rá»“i luyá»‡n nÃ³iâ€ táº¡o káº¿ hoáº¡ch gá»“m vocabulary â†’ speaking tá»« brief. Náº¿u Ä‘ang cÃ³ phiÃªn active, tiáº¿p tá»¥c hoáº·c káº¿t thÃºc phiÃªn Ä‘Ã³ trÆ°á»›c.
7. Feedback xem cá»¥m dÃ¹ng Ä‘Ãºng nghÄ©a/cáº¥u trÃºc/ngá»¯ cáº£nh; khÃ´ng Ä‘Ã¡nh giÃ¡ chá»‰ báº±ng substring match. Ná»™i dung AI táº¡o Ä‘Æ°á»£c gáº¯n lÃ  vÃ­ dá»¥ gá»£i Ã½, khÃ´ng nháº­n lÃ  cÃ¢u trÃ­ch tÃ i liá»‡u.

### 6.3 F3 â€” Roleplay theo lÆ°á»£t

Seed Ä‘áº§u: standup, xin lÃ¹i deadline, giáº£i thÃ­ch bug, phá»ng váº¥n báº£n thÃ¢n, pháº£n biá»‡n trong há»p. Má»—i scenario cÃ³ role, má»¥c tiÃªu, má»©c Ä‘á»™, opener, tiÃªu chÃ­ káº¿t thÃºc vÃ  phiÃªn báº£n.

```mermaid
sequenceDiagram
    participant U as NgÆ°á»i há»c
    participant A as API
    participant W as Worker
    participant P as STT / LLM / TTS
    U->>A: Táº¡o dialogue session
    A-->>U: Session + opener
    U->>A: Táº¡o attempt vÃ  xÃ¡c nháº­n upload
    U->>A: Submit turn (attemptId, version, idempotency)
    A-->>U: 202 + turn resource
    W->>P: STT audio Ä‘Ã£ seal
    W->>W: LÆ°u checkpoint transcript
    W->>P: Táº¡o reply theo history vÃ  objectives
    W->>W: Commit reply text
    W->>P: Sinh audio cho reply Ä‘Ã£ commit
    U->>A: Poll lÆ°á»£t hiá»‡n táº¡i
    A-->>U: Transcript, reply, audio state
    U->>A: Finish dialogue
    W->>P: Cháº¥m toÃ n phiÃªn
    W->>W: Finalize + outbox
    A-->>U: Summary khi polling hoÃ n thÃ nh
```

- Máº·c Ä‘á»‹nh 3â€“5 phÃºt, tá»‘i Ä‘a 8 lÆ°á»£t user, tá»‘i Ä‘a 60 giÃ¢y/lÆ°á»£t; server enforce cáº£ turn count vÃ  verified duration budget. Browser timer lÃ  trá»£ giÃºp.
- Má»™t lÆ°á»£t user pending xá»­ lÃ½/session; request tiáº¿p theo trÆ°á»›c khi reply hoÃ n táº¥t tráº£ `409 TURN_IN_PROGRESS`.
- Duy nháº¥t má»™t reply Ä‘Æ°á»£c commit cho replyToTurnId, ká»ƒ cáº£ retry/lease expired.
- Checkpoint STT â†’ reply â†’ TTS. TTS tháº¥t báº¡i váº«n hiá»ƒn thá»‹ text reply; cho â€œThá»­ phÃ¡t láº¡iâ€ vá»›i resource/key riÃªng, khÃ´ng gá»i láº¡i LLM.
- Cháº¿ Ä‘á»™ guided: hint tá»‘i Ä‘a hai láº§n/lÆ°á»£t. Cháº¿ Ä‘á»™ simulation: khÃ´ng hiá»‡n sá»­a lá»—i giá»¯a cÃ¢u; feedback cuá»‘i phiÃªn.
- Opener dÃ¹ng text seed, TTS cÃ³ thá»ƒ táº¡o trÆ°á»›c cho ná»™i dung catalog cÃ´ng khai. Audio phÃ¡t cáº§n tÆ°Æ¡ng tÃ¡c ngÆ°á»i dÃ¹ng; khÃ´ng há»©a tá»± autoplay khi browser cháº·n.
- Finish khi cÃ³ lÆ°á»£t pending tráº£ 409 vÃ  hÆ°á»›ng dáº«n chá»; sau khi submit finish thÃ nh cÃ´ng, khÃ³a nháº­n turn má»›i báº±ng finish state. Retry finish tráº£ cÃ¹ng evaluation, khÃ´ng cháº¥m láº§n ná»¯a.
- Final evaluation tráº£ task achievement theo tá»«ng objective, grammar/chunk evidence vÃ  tá»‘i Ä‘a hai correction Æ°u tiÃªn. KhÃ´ng táº¡o â€œÄ‘iá»ƒm phÃ¡t Ã¢mâ€ tá»« transcript.
- Khi final evaluation lá»—i cuá»‘i, giá»¯ session chÆ°a complete vÃ  transcript; cho retry báº±ng command rÃµ rÃ ng, hoáº·c abandon. KhÃ´ng máº¥t cuá»™c há»™i thoáº¡i.

### 6.4 F4 â€” BÃ i hÃ´m nay vÃ  materialize tá»«ng bÆ°á»›c

Planner v1 dÃ¹ng rule cÃ³ phiÃªn báº£n; khÃ´ng cáº§n gá»i LLM Ä‘á»ƒ quyáº¿t Ä‘á»‹nh thá»© tá»±:

1. CÃ³ Study hoáº·c Speaking/Vocab Ä‘á»™c láº­p active: tráº£ tiáº¿p tá»¥c phiÃªn Ä‘Ã³ trÆ°á»›c.
2. Chá»n tá»«/chunk Ä‘áº¿n háº¡n tá»‘i Ä‘a 5 items, khoáº£ng 2 phÃºt.
3. Chá»n tá»‘i Ä‘a 1 brief chá»¯a lá»—i Ä‘áº¿n háº¡n, khoáº£ng 2 phÃºt.
4. Chá»n 1 content brief hoáº·c scenario theo má»¥c tiÃªu, khoáº£ng 3â€“5 phÃºt.
5. Cáº¯t theo budget: 5 phÃºt gá»“m tá»‘i Ä‘a 2 bÆ°á»›c; 10/15 phÃºt tá»‘i Ä‘a 3 bÆ°á»›c. Budget lÃ  Æ°á»›c lÆ°á»£ng, khÃ´ng Ä‘á»“ng nghÄ©a credit phÃºt há»c.
6. Náº¿u khÃ´ng cÃ³ tá»«/lá»—i/ná»™i dung, dÃ¹ng scenario/bÃ i nÃ³i catalog phÃ¹ há»£p; khÃ´ng yÃªu cáº§u cÃ³ data má»›i há»c Ä‘Æ°á»£c.

Default level mapping: beginner/elementary â†’ A2-B1; intermediate â†’ B1-B2; unspecified â†’ A2-B1 kÃ¨m chá»n dá»… hÆ¡n/khÃ³ hÆ¡n. ThÃªm preference levelBand riÃªng náº¿u cáº§n B2+; khÃ´ng sá»­a self-assessment thÃ nh chá»©ng nháº­n. Má»i mapping cÃ³ test vÃ  version.

Plan READY chá»‰ tham chiáº¿u brief Ä‘Ã£ READY; planner khÃ´ng gá»i provider trong transaction. Khi chÆ°a cÃ³ brief, dÃ¹ng bÃ i cÃ³ sáºµn vÃ  cÃ³ thá»ƒ chuáº©n bá»‹ brief qua job riÃªng; khÃ´ng Ä‘á»ƒ toÃ n dashboard Ä‘á»£i AI.

Start plan: lock theo user + check cáº£ Study/review/speaking active; táº¡o parent vÃ  step specs, chá»‰ activate step 0 trong transaction. Concurrent start pháº£i serialize á»Ÿ cÃ¹ng advisory lock transaction cho cáº£ API Study má»›i vÃ  start phiÃªn Ä‘á»™c láº­p; unique indexes lÃ  lá»›p báº£o vá»‡ cuá»‘i.

Activate next: lock parent, validate version vÃ  child hiá»‡n táº¡i completed; táº¡o child tiáº¿p theo qua public port báº±ng deterministic key tá»« parentId/stepId; cáº­p nháº­t currentStep trong cÃ¹ng transaction. Náº¿u fail, rollback khÃ´ng Ä‘á»ƒ child má»“ cÃ´i. Refactor toÃ n bá»™ Ä‘Æ°á»ng start/complete/abandon theo thá»© tá»± lock thá»‘ng nháº¥t user â†’ parent â†’ child Ä‘á»ƒ trÃ¡nh deadlock.

KhÃ´ng tá»± gáº¯n phiÃªn Ä‘á»™c láº­p vÃ o Study. BÆ°á»›c chÆ°a activate chÆ°a giá»¯ review lock/audio quota. Skip chá»‰ Ä‘Æ°á»£c phÃ©p cho bÆ°á»›c PENDING, ghi lÃ½ do ngÆ°á»i dÃ¹ng chá»n vÃ  khÃ´ng credit duration. Complete parent khi táº¥t cáº£ bÆ°á»›c COMPLETED hoáº·c SKIPPED vÃ  Ã­t nháº¥t má»™t child COMPLETED; khÃ´ng phÃ¡t thÃªm event phÃºt há»c. Abandon parent giá»¯ completed children, abandon active child, Ä‘Ã¡nh dáº¥u pending abandoned.

Refresh Ä‘á»c server state; phiÃªn qua ná»­a Ä‘Ãªm tiáº¿p tá»¥c vá»›i timezone snapshot cÅ©. Khi Ä‘á»•i timezone, Æ°u tiÃªn active session; chá»‰ plan má»›i dÃ¹ng timezone má»›i. Kiá»ƒm tra láº¡i dá»¯ liá»‡u lÃºc activate: tá»« Ä‘Ã£ xÃ³a hoáº·c brief khÃ´ng cÃ²n há»£p lá»‡ â†’ Ä‘á» nghá»‹ thay bÆ°á»›c trÆ°á»›c khi táº¡o child, khÃ´ng láº·ng láº½ Ä‘á»•i Ä‘á» cá»§a phiÃªn Ä‘ang há»c.

### 6.5 F5 â€” Nghe trÆ°á»›c/sau vÃ  tiáº¿n bá»™

- Same-task comparison: hai attempt cá»§a cÃ¹ng remediation/brief revision vÃ  rubric; nghe A/B, xem transcript, target outcomes. DÃ¡n nhÃ£n â€œLuyá»‡n láº¡i cÃ¹ng bÃ iâ€, khÃ´ng coi lÃ  kháº£ nÄƒng chuyá»ƒn ngá»¯ cáº£nh.
- Transfer comparison: cÃ¹ng target/taxonomy, khÃ¡c context vÃ  ngÃ y, cÃ³ delayed test; hiá»‡n â€œDÃ¹ng láº¡i trong tÃ¬nh huá»‘ng má»›iâ€. KhÃ´ng trá»« hai Ä‘iá»ƒm overall náº¿u rubric/model khÃ¡c nhau.
- Source links: occurrence â†’ evaluation â†’ attempt/session; táº¥t cáº£ truy váº¥n owner-scoped. DTO tráº£ audioAvailability vÃ  expiresAt, khÃ´ng tráº£ signed URL cá»‘ Ä‘á»‹nh trong projection.
- Báº£n ghi háº¿t retention: giá»¯ pháº§n evidence/transcript theo chÃ­nh sÃ¡ch, hiá»‡n â€œBáº£n ghi Ä‘Ã£ háº¿t thá»i gian lÆ°uâ€; váº«n so sÃ¡nh vÄƒn báº£n. KhÃ´ng tá»± kÃ©o dÃ i retention vÃ¬ má»Ÿ comparison.
- Má»™t audio player phÃ¡t táº¡i má»™t thá»i Ä‘iá»ƒm; Ä‘á»•i A/B pause player trÆ°á»›c, xin grant 60 giÃ¢y khi cáº§n.
- Metric tuáº§n: correct opportunities / assessable opportunities; máº«u sá»‘ chá»‰ gá»“m CORRECT + INCORRECT, loáº¡i hints/uncertain/no opportunity khá»i chá»‰ sá»‘ Ä‘á»™c láº­p. Hiá»‡n sá»‘ lÆ°á»£t vÃ  sá»‘ ngÃ y, khÃ´ng chá»‰ pháº§n trÄƒm.
- DÆ°á»›i 5 cÆ¡ há»™i trong cá»­a sá»•: hiá»‡n sá»‘ lÆ°á»£t vÃ  â€œChÆ°a Ä‘á»§ dá»¯ liá»‡u Ä‘á»ƒ káº¿t luáº­n xu hÆ°á»›ngâ€; ngÆ°á»¡ng nÃ y lÃ  quy táº¯c hiá»ƒn thá»‹ sáº£n pháº©m, khÃ´ng pháº£i kiá»ƒm Ä‘á»‹nh thá»‘ng kÃª.
- Thá»i gian há»c tiáº¿p tá»¥c tá»« immutable activity ledger. Chá»‰ duration audio cá»§a ngÆ°á»i há»c Ä‘Æ°á»£c xÃ¡c minh vÃ  Ä‘Æ°á»£c lifecycle cháº¥p nháº­n; khÃ´ng tÃ­nh TTS, thá»i gian chá» AI hay parent Study láº§n ná»¯a.

## 7. Thiáº¿t káº¿ API vÃ  há»£p Ä‘á»“ng frontend/backend

### 7.1 Quy Æ°á»›c chung

- Prefix `/api/v1`. CÃ¡c API dÆ°á»›i Ä‘Ã¢y lÃ  thiáº¿t káº¿ Ä‘Ã­ch, chÆ°a tá»“n táº¡i trá»« nÆ¡i ghi cÃ³ sáºµn.
- Browser mutation dÃ¹ng Bearer + CSRF hiá»‡n cÃ³. UserId luÃ´n láº¥y tá»« JWT; kiá»ƒm tra owner cho táº¥t cáº£ ID Ä‘áº§u vÃ o.
- Command táº¡o resource hoáº·c gá»i AI dÃ¹ng `Idempotency-Key: UUID`, scope user/operation/key vÃ  hash payload. Retry máº¡ng giá»¯ nguyÃªn key; cÃ¹ng key khÃ¡c payload tráº£ 409. HÃ nh Ä‘á»™ng má»›i dÃ¹ng key má»›i.
- Aggregate mutable dÃ¹ng expectedVersion. Conflict tráº£ 409 vÃ  code á»•n Ä‘á»‹nh; UI refetch trÆ°á»›c khi thá»­ láº¡i. Resource khÃ´ng thuá»™c owner tráº£ 404.
- 201 cho táº¡o Ä‘á»“ng bá»™; 202 cho async kÃ¨m Location, Retry-After vÃ  resourceId/status. KhÃ´ng tráº£ káº¿t quáº£ giáº£ trong lÃºc pending.
- DTO dÃ¹ng enum lowercase cÃ³ schema rÃµ. Pagination default 20/max 100; date window max 366 ngÃ y. KhÃ´ng táº£i toÃ n transcript lÃªn dashboard.
- OpenAPI code-first: thÃªm enum/schema há»¯u háº¡n thay cho string tÃ¹y Ã½; regenerate frontend, khÃ´ng sá»­a tay generated file.
- Giá»¯ resource status cÅ©: context analysis pending/completed/failed; evaluation queued/running/stage. Service frontend chuyá»ƒn sang shared AsyncResource náº¿u cáº§n, khÃ´ng Ä‘á»•i wire contract ngáº§m.

### 7.2 API Ä‘Ã­ch

| Endpoint | Request chÃ­nh | Káº¿t quáº£/quy táº¯c |
|---|---|---|
| `GET /me/capabilities` | â€” | Feature availability/reason vÃ  limits, khÃ´ng secret |
| `GET /me/usage` | â€” | Quota remaining/resetAt theo operation |
| `POST /auth/verify-email`, `/auth/resend-verification` â€” cÃ³ sáºµn | Theo DTO hiá»‡n táº¡i | UI má»›i gá»i contract hiá»‡n cÃ³; expired/used/rate limit |
| `POST /content/sources` | title, text, learningGoal | 201 source/revision; chÆ°a gá»i AI |
| `GET /content/sources` | page, size | Danh sÃ¡ch excerpt ngáº¯n |
| `GET /content/sources/{id}` | revision optional | Source + segments thuá»™c owner |
| `PUT /content/sources/{id}/revisions` | title, text, expectedVersion | 201 revision má»›i |
| `DELETE /content/sources/{id}` | expectedVersion, purgeSavedExamples | 202 deletion resource, lifecycle DELETING |
| `GET /content/deletions/{id}` | â€” | Pending/completed/failed, owner-scoped |
| `POST /vocabulary/context-analysis` â€” má»Ÿ rá»™ng | InputText legacy hoáº·c sourceId/sourceRevision, khÃ´ng cáº£ hai | 202 theo resource hiá»‡n táº¡i; quota má»™t láº§n |
| `GET /vocabulary/context-analyses/{id}` â€” cÃ³ sáºµn | â€” | ThÃªm source refs vÃ  suggestion evidence |
| `POST /vocabulary/words` â€” má»Ÿ rá»™ng | Suggestion selection + source link | Semantic upsert, tráº£ wordIds tháº­t |
| `POST /speaking/practice-briefs` | kind, sourceRef hoáº·c occurrenceId, selectedWordIds, goal | 202 generation; backend Ä‘á»c láº¡i nguá»“n/target |
| `GET /speaking/practice-briefs/{id}` | â€” | Pending/ready/failed; prompt khi ready |
| `POST /speaking/practice-briefs/{id}/retry` | expectedVersion | 202 cÃ¹ng logical brief, execution má»›i cÃ³ giá»›i háº¡n |
| `POST /speaking/sessions` â€” cÃ³ sáºµn | topicId | Giá»¯ monologue legacy |
| `POST /speaking/practice-sessions` | briefId, coachingMode | 201 session mode tá»« brief, khÃ´ng nháº­n target tÃ¹y Ã½ |
| `POST /speaking/sessions/{id}/attempts` â€” cÃ³ sáºµn | mimeType, sizeBytes | Upload grant theo contract hiá»‡n táº¡i |
| `POST /speaking/attempts/{id}/upload-complete` â€” cÃ³ sáºµn | Checksum/version theo DTO cÅ© | Kiá»ƒm Ä‘á»‹nh audio tháº­t trÆ°á»›c AVAILABLE |
| `POST /speaking/attempts/{id}/evaluate` â€” má»Ÿ rá»™ng | Giá»¯ request cÅ© | Dispatch theo mode, targets server snapshot |
| `GET /speaking/attempts/{id}/evaluation` â€” cÃ³ sáºµn | â€” | ThÃªm targetAssessments/evidence; giá»¯ field cÅ© |
| `POST /speaking/attempts/{id}/evaluation/retry` | expectedVersion | Chá»‰ tráº¡ng thÃ¡i cho phÃ©p retry; giá»¯ transcript checkpoint |
| `POST /speaking/practice-sessions/{id}/hints` | targetId, practicePhase, expectedVersion | 202 hint remediation; server ghi assistance trÆ°á»›c khi tráº£ gá»£i Ã½ |
| `POST /speaking/feedback-reports` | evaluationRef, feedbackItemId, reasonCode, note | 201 report, khÃ´ng tá»± Ä‘á»•i Ä‘iá»ƒm |
| `GET /speaking/scenarios` | levelBand/category/page/size | Catalog roleplay |
| `POST /speaking/dialogue-sessions` | scenarioId, coachingMode | 201 Speaking mode dialogue + opener |
| `GET /speaking/dialogue-sessions/{id}` | afterOrdinal optional | Session/turns/evaluation/nextAction phá»¥c vá»¥ restore |
| `POST /speaking/dialogue-sessions/{id}/turns` | attemptId, expectedVersion, clientTurnId UUID | 202 turn; chá»‘ng duplicate clientTurnId |
| `GET /speaking/dialogue-sessions/{id}/turns/{turnId}` | â€” | Stage/transcript/reply/TTS status |
| `POST /speaking/dialogue-sessions/{id}/hints` | replyToTurnId, expectedVersion | 202 hint; server ghi Ä‘Ã£ cung cáº¥p trá»£ giÃºp |
| `GET /speaking/hints/{id}` | â€” | Pending/ready/failed; tá»‘i Ä‘a 2 gá»£i Ã½ |
| `POST /speaking/dialogue-sessions/{id}/finish` | expectedVersion | 202 final evaluation; khÃ³a nháº­n lÆ°á»£t má»›i |
| `POST /speaking/dialogue-sessions/{id}/evaluation/retry` | expectedVersion | 202 cÃ¹ng logical evaluation vÃ  transcript |
| `POST /speaking/synthesized-audio` | briefId hoáº·c turnId, purpose | 202; backend tá»± láº¥y text, khÃ´ng proxy TTS tÃ¹y Ã½ |
| `GET /speaking/synthesized-audio/{id}` | â€” | Status/audioAvailability |
| `POST /speaking/synthesized-audio/{id}/retry` | expectedVersion | 202 cÃ¹ng text resource, khÃ´ng gá»i láº¡i LLM, cÃ³ quota/budget guard |
| `GET /speaking/synthesized-audio/{id}/audio` | â€” | Grant 60s, no-store, owner check |
| `POST /study/daily-plans` | goalMinutes 5/10/15, sourceBriefId optional | 201 plan/reasons; compose khÃ´ng gá»i AI |
| `GET /study/daily-plans/today` | â€” | Current plan hoáº·c null; GET khÃ´ng táº¡o resource |
| `POST /study/daily-plans/{id}/start` | expectedVersion | 201 Study LAZY, activate bÆ°á»›c Ä‘áº§u |
| `POST /study-sessions/{id}/steps/{stepId}/activate` | expectedVersion | 200 child/current step, retry khÃ´ng táº¡o trÃ¹ng |
| `POST /study-sessions/{id}/steps/{stepId}/skip` | expectedVersion, reason | Chá»‰ pending; update pointer nguyÃªn tá»­ |
| `GET /study-sessions/{id}` â€” má»Ÿ rá»™ng | â€” | Steps array status/mode/spec/child refs/nextAction |
| `POST /study-sessions/{id}/complete`, `/abandon` â€” má»Ÿ rá»™ng | expectedVersion | Dispatch theo LEGACY_EAGER/LAZY |
| `GET /progress/mistakes/{id}` â€” má»Ÿ rá»™ng | page,size | Status wire Ä‘Ãºng + evidenceStage riÃªng; attempt/session refs |
| `GET /progress/learning-targets` | dueBefore/kind/page/size | Target do server láº­p lá»‹ch |
| `GET /progress/learning-targets/{id}/evidence` | page,size | Timeline outcome/assistance/context |
| `GET /progress/learning-evidence/summary` | from,to | Counts/máº«u sá»‘/insufficientData/projectedThrough |
| `POST /progress/attempt-comparisons` | baselineAttemptId,followupAttemptId | 201 metadata tá»« káº¿t quáº£ cÅ©, khÃ´ng gá»i AI láº¡i báº£n Ä‘áº§u |
| `GET /progress/attempt-comparisons/{id}` | â€” | Comparability/target differences/audio availability |

Read API tiáº¿p tá»¥c hoáº¡t Ä‘á»™ng khi háº¿t quota. Retry khÃ´ng Ä‘Æ°á»£c bypass quota hoáº·c biáº¿n thÃ nh job má»›i khÃ´ng giá»›i háº¡n. Chá»‘t DTO thá»±c táº¿ vÃ  thÃªm táº¥t cáº£ controller vÃ o OpenApiContractTest trÆ°á»›c khi viáº¿t service frontend.

DELETE source truyá»n expectedVersion/purgeSavedExamples qua query parameters Ä‘Ã£ validate Ä‘á»ƒ khÃ´ng phá»¥ thuá»™c DELETE body qua proxy. Create/retry/start/finish Ä‘á»u dÃ¹ng Idempotency-Key theo quy Æ°á»›c chung.

### 7.3 VÃ­ dá»¥ DTO vÃ  validation

Táº¡o brief chá»¯a lá»—i:

```json
{
  "kind": "remediation",
  "occurrenceId": "11111111-1111-4111-8111-111111111111",
  "goal": "Diá»…n Ä‘áº¡t sá»± Ä‘á»“ng Ã½ trong má»™t cuá»™c há»p"
}
```

Server tra occurrence â†’ evaluation â†’ attempt gá»‘c â†’ taxonomy. Client khÃ´ng gá»­i overallScore hoáº·c cÃ¢u sá»­a Ä‘á»ƒ server tin lÃ m káº¿t quáº£.

Pháº§n bá»• sung vÃ o evaluation:

```json
{
  "schemaVersion": "learning-feedback.v1",
  "source": "provider",
  "assessedFrom": "audio_transcription",
  "rubricVersion": "workplace-speaking.v1",
  "targetAssessments": [
    {
      "targetId": "22222222-2222-4222-8222-222222222222",
      "outcome": "correct",
      "evidenceQuote": "I agree with the proposed deadline.",
      "explanationVi": "Báº¡n Ä‘Ã£ dÃ¹ng agree trá»±c tiáº¿p, khÃ´ng thÃªm am.",
      "assistance": "none"
    }
  ],
  "pronunciation": null
}
```

Kiá»ƒm tra targetId náº±m trong snapshot, evidenceQuote cÃ³ tháº­t trong transcript, category há»£p lá»‡. Source value pháº£i map cÃ³ chá»§ Ä‘Ã­ch vá»›i validators hiá»‡n cÃ³ trÆ°á»›c khi thÃªm giÃ¡ trá»‹ wire má»›i. KhÃ´ng tá»± coi JSON Ä‘Ãºng schema lÃ  feedback chÃ­nh xÃ¡c.

Study step má»›i:

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "position": 1,
  "kind": "speaking",
  "practiceMode": "remediation",
  "status": "pending",
  "title": "Luyá»‡n cÃ¡ch diá»…n Ä‘áº¡t sá»± Ä‘á»“ng Ã½",
  "estimatedSeconds": 120,
  "reviewSessionId": null,
  "speakingSessionId": null,
  "canSkip": true
}
```

Activate tráº£ cÃ¹ng stepId vá»›i child ref vÃ  status active. Frontend pháº£i dÃ¹ng steps array, khÃ´ng má»™t speakingSessionId duy nháº¥t cho cáº£ buá»•i cÃ³ hai bÆ°á»›c nÃ³i.

Summary báº±ng chá»©ng cáº§n tráº£: from/to, correctOpportunities, assessableOpportunities, hintedOpportunities, uncertainOpportunities, distinctPracticeDays, insufficientData, projectedThrough. VÃ­ dá»¥3/4 lÆ°á»£t Ä‘Ãºng trong 2 ngÃ y pháº£i hiá»‡n chÆ°a Ä‘á»§ dá»¯ liá»‡u náº¿u threshold 5, khÃ´ng tá»± suy thÃ nh 75% cáº£i thiá»‡n.

### 7.4 Lá»—i vÃ  cÃ¡ch phá»¥c há»“i

| TrÆ°á»ng há»£p | API | HÃ nh vi UI |
|---|---|---|
| Email chÆ°a xÃ¡c minh | 403 | Verify/resend banner, giá»¯ draft |
| ACTIVE_SESSION_EXISTS | 409 | Tiáº¿p tá»¥c phiÃªn; lá»±a chá»n káº¿t thÃºc gá»i command tháº­t |
| Version conflict | 409 | Refetch, khÃ´ng overwrite |
| Quota háº¿t | 429 + resetAt | Hiá»‡n khi nÃ o dÃ¹ng tiáº¿p; Ä‘á»c bÃ i cÅ© Ä‘Æ°á»£c |
| TURN_IN_PROGRESS/finish Ä‘Ã£ báº¯t Ä‘áº§u | 409 | Poll resource Ä‘ang cháº¡y, khÃ³a gá»­i thÃªm |
| Audio khÃ´ng há»£p lá»‡ | 400/422 thá»‘ng nháº¥t vá»›i audio contract á»Ÿ M0 | HÆ°á»›ng dáº«n thu láº¡i, khÃ´ng cháº¥m giáº£ |
| STT khÃ´ng rÃµ | Resource uncertain/failed | Nghe láº¡i/thu láº¡i, khÃ´ng tá»± táº¡o transcript |
| Provider timeout/unavailable | Resource retryable | NÃºt thá»­ láº¡i Ä‘Ãºng stage vÃ  logical resource |
| Provider auth/model invalid | Resource terminal | ThÃ´ng bÃ¡o táº¡m chÆ°a dÃ¹ng Ä‘Æ°á»£c; requestId cho váº­n hÃ nh |
| TTS lá»—i | Audio failed | Giá»¯ reply text, cho thá»­ phÃ¡t láº¡i |
| Source/brief bá»‹ xÃ³a hoáº·c háº¿t háº¡n | 404/410 theo contract | Äá»•i bÃ i, khÃ´ng lÃ m máº¥t input chÆ°a gá»­i |
| Projection cháº­m | 200 + pendingProjection | DÃ¹ng káº¿t quáº£ source session trÆ°á»›c; ghi Äang cáº­p nháº­t |
| Audio háº¿t retention | 410 + availability | Transcript/evidence váº«n Ä‘á»c Ä‘Æ°á»£c |

## 8. Thiáº¿t káº¿ frontend

### 8.1 Äiá»u hÆ°á»›ng vÃ  route

Äiá»u hÆ°á»›ng chÃ­nh: HÃ´m nay, Luyá»‡n nÃ³i, Tá»« & Cá»¥m, Tiáº¿n bá»™. Ná»™i dung cá»§a tÃ´i cÃ³ entry trong Tá»« & Cá»¥m vÃ  CTA á»Ÿ HÃ´m nay. Roleplay lÃ  tab Luyá»‡n nÃ³i vÃ  váº«n cÃ³ deep link. Peer/video/writing demo vÃ o nhÃ³m KhÃ¡m phÃ¡ cÃ³ tráº¡ng thÃ¡i rÃµ; khÃ´ng tá»± xÃ³a trang cÅ©.

| Route | MÃ n hÃ¬nh/file Ä‘Ã­ch |
|---|---|
| `/verify-email` | Má»›i `pages/marketing/VerifyEmail.tsx`, token/expired/resend |
| `/dashboard` | Sá»­a Dashboard/TodaySessionFocus: plan/resume/reasons |
| `/content` | Má»›i `pages/ContentLibrary.tsx` |
| `/content/new` | Má»›i `pages/ContentCapture.tsx` |
| `/content/:sourceId` | Má»›i `pages/ContentDetail.tsx`: nguá»“n/chunks/brief |
| `/practice/remediation/:briefId` | Má»›i `pages/RemediationPractice.tsx`: prepare/session/result |
| `/speaking` | Giá»¯ Speaking, thÃªm entry brief vÃ  tab mode |
| `/speaking/dialogue` | Sá»­a SpeakingDialogue thÃ nh scenario catalog tháº­t |
| `/speaking/dialogue/:sessionId` | Má»›i `pages/DialogueSession.tsx`: turns/restore/summary |
| `/study/:studySessionId` | Má»›i `pages/StudyRunner.tsx`: steps array |
| `/session/:sessionId/summary` | Giá»¯ SessionSummary vá»›i Ä‘Ãºng Study session contract |
| `/speaking/history/:sessionId` | Sá»­a SpeakingSessionDetail cho ba mode |
| `/progress/mistakes/:mistakeId` | Sá»­a MistakeDetail: status/evidence/CTA remediation |
| `/progress/comparisons/:comparisonId` | Má»›i `pages/AttemptComparison.tsx` |
| `/progress` | Sá»­a Progress: evidence, counts, delayed transfer |

URL chá»‰ chá»©a resource ID, khÃ´ng transcript, vÄƒn báº£n nguá»“n hay signed URL. Trang verify loáº¡i token khá»i URL sau xá»­ lÃ½, khÃ´ng log token, dÃ¹ng no-referrer. CÃ¡c route má»›i khai bÃ¡o trong routePaths/AppRoutes, protected/onboarding guard nháº¥t quÃ¡n.

### 8.2 NgÃ´n ngá»¯ thiáº¿t káº¿ vÃ  responsive

Nguá»“n sá»± tháº­t: `frontend/src/styles/index.css`, vá»›i Plus Jakarta Sans, ná»n sÃ¡ng láº¡nh/charcoal tá»‘i, primary cyan vÃ  accent cam Ä‘áº¥t. Tra cá»©u design-system chung tráº£ phong cÃ¡ch tráº» em khÃ´ng phÃ¹ há»£p nÃªn Ä‘Ã£ loáº¡i; giá»¯ thiáº¿t káº¿ repo. Káº¿t quáº£ tra cá»©u React async/error states phÃ¹ há»£p Ä‘Æ°á»£c dÃ¹ng cho plan.

- Desktop content tá»‘i Ä‘a khoáº£ng 1120px; vÃ¹ng luyá»‡n 640â€“720px vÃ  aside 280â€“320px khi Ä‘á»§ chá»—. Trang chá»¯a lá»—i cÃ³ má»™t vÃ¹ng chÃ­nh rÃµ.
- Tablet: aside thÃ nh disclosure. Mobile 360â€“430px má»™t cá»™t, padding 16px, CTA dá»… cháº¡m, chá»«a safe area vÃ  bÃ n phÃ­m áº£o.
- Body 16px, metadata 14px, line-height1.5â€“1.7; heading 24â€“32px. KhÃ´ng dÃ¹ng chá»¯12px cho hÆ°á»›ng dáº«n chÃ­nh.
- Spacing 4/8/12/16/24/32; radius 16px vÃ¹ng lá»›n, 12px control. KhÃ´ng chia má»i Ä‘oáº¡n thÃ nh card giá»‘ng nhau.
- DÃ¹ng class study-* vÃ  token hiá»‡n cÃ³. ThÃªm component aliases nhÆ° `--recorder-action-bg`, `--practice-evidence-bg`, `--practice-focus-ring` trá» vÃ o semantic layer; khÃ´ng thÃªm raw hex vÃ o page.
- Äo contrast tá»«ng cáº·p; náº¿u foreground hiá»‡n cÃ³ chÆ°a Ä‘áº¡t thÃ¬ bá»• sung semantic foreground phÃ¹ há»£p, khÃ´ng thay toÃ n palette.
- Má»™t CTA accent/mÃ n hÃ¬nh; Ä‘Ãºng/sai luÃ´n cÃ³ icon vÃ  chá»¯. Diff chá»‰ nháº¥n pháº§n thay Ä‘á»•i cáº§n há»c.
- Target tá»‘i thiá»ƒu 44Ã—44px, mic chÃ­nh 56px trá»Ÿ lÃªn; focus rÃµ; disabled cÃ³ lÃ½ do gáº§n control.
- Motion 150â€“200ms Ä‘á»ƒ pháº£n há»“i tráº¡ng thÃ¡i; reduced-motion táº¯t waveform Ä‘á»™ng vÃ  hiá»‡u á»©ng khÃ´ng cáº§n. KhÃ´ng cáº§n animation library má»›i.

### 8.3 F1 â€” MÃ n hÃ¬nh chá»¯a lá»—i

```text
Quay láº¡i bÃ i nÃ³i                             BÆ°á»›c 1/3
Luyá»‡n cÃ¡ch diá»…n Ä‘áº¡t sá»± Ä‘á»“ng Ã½
Báº¡n vá»«a nÃ³i: I am agree with this.           [Nghe láº¡i]

Giáº£i thÃ­ch ngáº¯n + cÃ¢u sá»­a                    [Nghe máº«u]

Thá»­ trong tÃ¬nh huá»‘ng má»›i:
Äá»“ng nghiá»‡p Ä‘á» xuáº¥t dá»i buá»•i há»p. HÃ£y Ä‘á»“ng Ã½ vÃ  nÃªu lÃ½ do.

                    [Báº¯t Ä‘áº§u nÃ³i]
                    Gá»£i Ã½ cÃ¡ch nÃ³i
```

Ba bÆ°á»›c: hiá»ƒu lá»—i â†’ tá»± nÃ³i â†’ xem káº¿t quáº£. Trong lÃºc thu, áº©n Ä‘Ã¡p Ã¡n Ä‘áº§y Ä‘á»§ máº·c Ä‘á»‹nh; má»Ÿ hint Ä‘Æ°á»£c ghi nháº­n. Káº¿t quáº£ cÃ³ evidence quote, giáº£i thÃ­ch vÃ  CTA thá»­ láº¡i/hoÃ n thÃ nh; nghe A/B khi cÃ³ hai attempts. KhÃ´ng coi chá»n Ä‘Ãºng tráº¯c nghiá»‡m lÃ  evidence tá»± nÃ³i.

States pháº£i thiáº¿t káº¿: generating/failed/ready; mic denied; recording; reviewing recording; uploading; evaluating; correct/incorrect/not observed/uncertain; completed/resume; source deleted. Má»—i tráº¡ng thÃ¡i lá»—i cÃ³ hÃ nh Ä‘á»™ng phá»¥c há»“i.

### 8.4 F2 â€” Ná»™i dung vÃ  chunks

Capture: title, textarea, bá»™ Ä‘áº¿m kÃ½ tá»±, má»¥c tiÃªu nÃ³i; CTA TÃ¬m cá»¥m tá»« há»¯u Ã­ch. Cáº¥u hÃ¬nh nÃ¢ng cao thu gá»n, khÃ´ng Ã©p chá»n hÃ ng loáº¡t CEFR/tone trÆ°á»›c láº§n thá»­ Ä‘áº§u.

Detail desktop: nguá»“n highlight bÃªn trÃ¡i, tá»‘i Ä‘a 8 suggestions bÃªn pháº£i. Mobile: nguá»“n thu gá»n rá»“i danh sÃ¡ch; chá»n cá»¥m má»Ÿ cÃ¢u nguá»“n tÆ°Æ¡ng á»©ng. Checkbox cÃ³ label; sá»‘ ÄÃ£ chá»n 3/5 vÃ  CTA LÆ°u cá»¥m vÃ  táº¡o bÃ i nÃ³i.

Má»—i suggestion cÃ³ cá»¥m, nghÄ©a Viá»‡t, cÃ¢u nguá»“n, lÃ½ do chá»n, nhÃ£n trÃ­ch nguá»“n/AI gá»£i Ã½. Sá»­a meaning/example Ä‘Æ°á»£c, khÃ´ng sá»­a quote mÃ  váº«n nháº­n lÃ  nguyÃªn vÄƒn. KhÃ´ng tÃ¬m Ä‘Æ°á»£c cá»¥m: Ä‘á»•i vÄƒn báº£n hoáº·c dÃ¹ng bÃ i cÃ³ sáºµn.

States: empty/saving/analysing/selecting/saving words/generating brief/ready; duplicate merged; analysis expired; deletion pending/error. LÆ°u tá»« thÃ nh cÃ´ng nhÆ°ng brief lá»—i: giá»¯ wordIds vÃ  retry brief, khÃ´ng cháº¡y láº¡i extraction toÃ n bá»™.

### 8.5 F3 â€” Há»™i thoáº¡i

Setup: scenario, vai hai bÃªn, 2â€“3 objectives, duration, guided/simulation; CTA Báº¯t Ä‘áº§u há»™i thoáº¡i. Trong phiÃªn: má»¥c tiÃªu thu gá»n, cÃ¢u AI má»›i nháº¥t vÃ  lÆ°á»£t user gáº§n nháº¥t lÃ  trá»ng tÃ¢m; lá»‹ch sá»­ má»Ÿ disclosure. Control bar nghe láº¡i/ghi Ã¢m/dá»«ng/hint; káº¿t thÃºc lÃ  secondary.

```text
loading â†’ ready â†’ recording â†’ review-recording â†’ uploading
        â†’ transcribing â†’ thinking â†’ reply-text-ready â†’ speaking/ready
        â†’ finishing â†’ evaluating-session â†’ completed
```

CÃ³ error/retry á»Ÿ tá»«ng async stage. TÃ¡ch sessionStatus/turnStatus/ttsStatus, khÃ´ng má»™t isLoading toÃ n trang. TTS lá»—i váº«n Ä‘á»c cÃ¢u AI Ä‘Æ°á»£c. KhÃ´ng hiá»ƒn thá»‹ transcript user soáº¡n sáºµn trÆ°á»›c STT. Káº¿t quáº£ final cÃ³ objective checklist, evidence vÃ  tá»‘i Ä‘a 2 lá»—i Æ°u tiÃªn vá»›i CTA luyá»‡n tiáº¿p.

### 8.6 F4 â€” HÃ´m nay vÃ  StudyRunner

```text
HÃ´m nay                              [5 phÃºt] [10 phÃºt] [15 phÃºt]
Luyá»‡n cho cuá»™c há»p tiáº¿p theo
Báº¡n cÃ³ 3 cá»¥m Ä‘áº¿n háº¡n vÃ  má»™t lá»—i cáº§n kiá»ƒm tra láº¡i.

1. Ã”n 3 cá»¥m tá»«                         khoáº£ng 2 phÃºt
2. Luyá»‡n nÃ³i vá» viá»‡c hÃ´m qua          khoáº£ng 2 phÃºt
3. Daily standup                     khoáº£ng 4 phÃºt

[Báº¯t Ä‘áº§u buá»•i há»c]
Hoáº·c Ä‘Æ°a ná»™i dung cá»§a báº¡n vÃ o
```

Active session thay CTA báº±ng Tiáº¿p tá»¥c bÆ°á»›c 2/3, khÃ´ng che báº±ng plan má»›i. NgÆ°á»i má»›i tháº¥y bÃ i máº«u/Ä‘Æ°a ná»™i dung vÃ o, khÃ´ng dashboard toÃ n sá»‘ 0. Káº¿t thÃºc nÃªu há»c Ä‘Æ°á»£c gÃ¬ vÃ  lá»‹ch luyá»‡n láº¡i.

Runner Ä‘á»c steps array vÃ  kind/mode; step pending chÆ°a cÃ³ child. Activate qua mutation do ngÆ°á»i dÃ¹ng, khÃ´ng táº¡o job trong useEffect mount. Next/retry dÃ¹ng version má»›i nháº¥t; tab khÃ¡c Ä‘Ã£ chuyá»ƒn bÆ°á»›c thÃ¬ refetch vÃ  resume theo server. PhÃ¢n biá»‡t thá»i lÆ°á»£ng dá»± kiáº¿n vá»›i phÃºt há»c Ä‘Ã£ Ä‘Æ°á»£c tÃ­nh.

### 8.7 F5 â€” So sÃ¡nh vÃ  progress

Desktop hai cá»™t trÆ°á»›c/sau; mobile hai tab Láº§n trÆ°á»›c/Láº§n nÃ y. Má»—i bÃªn cÃ³ ngÃ y, Ä‘á», há»— trá»£ Ä‘Ã£ dÃ¹ng, audio availability vÃ  transcript. Má»™t player phÃ¡t táº¡i má»™t thá»i Ä‘iá»ƒm; xin grant ngáº¯n háº¡n khi báº¥m nghe.

BÃªn dÆ°á»›i: target outcome, evidence quote, cÃ¹ng bÃ i/bÃ i má»›i, lÃ½ do khÃ´ng so sÃ¡nh Ä‘Æ°á»£c náº¿u rubric khÃ¡c. Háº¿t audio chá»‰ khÃ³a playback, khÃ´ng khÃ³a trang. Progress nhá» dÃ¹ng biá»ƒu Ä‘á»“ Ä‘Æ¡n giáº£n kÃ¨m báº£ng counts; khÃ´ng váº½ trend tá»« má»™t Ä‘iá»ƒm.

Copy máº«u: DÃ¹ng Ä‘Ãºng 3/4 láº§n cÃ³ cÆ¡ há»™i, trong 2 ngÃ y. KhÃ´ng Ä‘á»•i thÃ nh Báº¡n Ä‘Ã£ cáº£i thiá»‡n 75%. DÆ°á»›i threshold cÃ³ ChÆ°a Ä‘á»§ dá»¯ liá»‡u vÃ  gá»£i Ã½ bÃ i kiá»ƒm tra káº¿ tiáº¿p.

### 8.8 Component, hook vÃ  service

| NhÃ³m | Táº­n dá»¥ng | Bá»• sung/sá»­a |
|---|---|---|
| Audio | useAudioRecorder/useAudioPlayer/RecordButton/AudioPlayerBar/Waveform | PracticeRecorder, MIME negotiation, upload retry, useExclusiveAudioPlayback |
| Async | apiClient/ApiErrorNotice | useAsyncResourcePolling, AbortController, Retry-After vÃ  visibility-aware polling |
| Remediation | SentenceDiffCard/FeedbackCard/MistakeDetail | TargetEvidenceCard, RemediationPrompt, PracticeOutcome, HintButton |
| Content | ContextCapture/VocabList | SourceTextPanel, ChunkSuggestionRow, SelectedChunkTray, PracticeBriefPreview |
| Dialogue | SpeakingDialogue/transcript components | DialogueTurnList, DialogueComposer, ObjectiveChecklist, DialogueSummary |
| Study | TodaySessionFocus/studyService | DailyPlan, StudyStepList, StudyRunner, ActiveSessionNotice |
| Progress | Progress/MistakeDetail | AttemptABPlayer, EvidenceTimeline, LearningEvidenceSummary |
| Services | auth/vocab/speaking/progress/study | contentService, practiceBriefService, dialogueService, capabilityService |

TÃ¡ch component theo lifecycle hoáº·c tÃ¡i sá»­ dá»¥ng, khÃ´ng báº¯t má»i Ä‘oáº¡n nhá» thÃ nh file riÃªng. Component khÃ´ng gá»i provider trá»±c tiáº¿p.

### 8.9 State vÃ  vÃ²ng Ä‘á»i browser

- Server sá»Ÿ há»¯u session/step/quota/transcript/evidence. Zustand giá»¯ UI preferences vÃ  resource refs cáº§n chia sáº», khÃ´ng giá»¯ báº£n sao authoritative cá»§a cáº£ API.
- Thay mapper Study Ä‘ang láº¥y má»™t speakingSessionId báº±ng typed steps array; unknown enum pháº£i Ä‘Æ°á»£c xá»­ lÃ½ rÃµ, khÃ´ng default vá» vocab/grammar.
- Mistake status map Ä‘Ãºng wire; evidenceStage riÃªng. Bá» PATCH improving/mastered. Tests dÃ¹ng giÃ¡ trá»‹ backend thá»±c tráº£.
- Poll theo Retry-After, khoáº£ng 1â€“2s khi active, backoff tá»‘i Ä‘a 5s; pause khi tab hidden, refetch khi focus, abort unmount. Hiá»‡n stage thay cho pháº§n trÄƒm giáº£.
- useEffect chá»‰ Ä‘á»c/subscribe; StrictMode remount khÃ´ng táº¡o job tá»‘n phÃ­. Command giá»¯ key Ä‘áº¿n khi xÃ¡c nháº­n; timeout Ä‘á»c láº¡i resource hoáº·c retry cÃ¹ng key.
- Blob/object URL chá»‰ in-memory, revoke khi thay/unmount; stop mic tracks. Reload trÆ°á»›c upload cÃ³ thá»ƒ cáº§n thu láº¡i, pháº£i nÃ³i rÃµ. Audio Ä‘Ã£ seal khÃ´i phá»¥c tá»« server.
- KhÃ´ng persist source text/transcript/audio trong localStorage dÃ¹ng chung tÃ i khoáº£n. Báº£n Ä‘áº§u draft in-memory + cáº£nh bÃ¡o rá»i trang; lÆ°u draft riÃªng opt-in Ä‘á»ƒ sau.
- Logout/account switch abort requests, reset store; káº¿t quáº£ tráº£ muá»™n cá»§a user trÆ°á»›c khÃ´ng Ä‘Æ°á»£c gÃ¡n vÃ o user má»›i.
- Render AI text báº±ng text node, khÃ´ng dangerouslySetInnerHTML.

### 8.10 Accessibility vÃ  kiá»ƒm tra thá»±c táº¿

- Label/aria-describedby vÃ  error summary; focus Ä‘Ãºng field khi lá»—i. Mic/play controls cÃ³ accessible name theo tráº¡ng thÃ¡i.
- Announce upload/káº¿t quáº£/AI reply báº±ng live region; khÃ´ng announce timer má»—i giÃ¢y hoáº·c waveform.
- Dialog giá»¯/tráº£ focus, Escape há»£p lÃ½; sticky footer khÃ´ng che focus hoáº·c input khi má»Ÿ bÃ n phÃ­m.
- Test keyboard, zoom 200%, light/dark, contrast, reduced-motion. axe chá»‰ há»— trá»£, khÃ´ng thay kiá»ƒm tra thá»§ cÃ´ng.
- E2E Chromium; kiá»ƒm tra WebKit/Firefox vÃ  thá»±c táº¿ iOS Safari/Android Chrome cho mic, codec, interruption vÃ  playback. [Playwright](https://playwright.dev/docs/intro), [Accessibility testing](https://playwright.dev/docs/accessibility-testing).


## 9. AI, audio, chi phÃ­ vÃ  váº­n hÃ nh

### 9.1 TrÃ¡ch nhiá»‡m tá»«ng lá»i gá»i AI

| Operation | Input cÃ³ giá»›i háº¡n | Output pháº£i kiá»ƒm tra | Ghi nháº­n |
|---|---|---|---|
| Vocabulary extraction | Source revision, má»¥c tiÃªu, level band, tá»‘i Ä‘a 10.000 kÃ½ tá»± | Tá»‘i Ä‘a8 suggestions, nguá»“n chÃ­nh xÃ¡c, nghÄ©a/chunk/sense; quote vÃ  offsets há»£p lá»‡ | sourceHash, promptVersion, model, usage |
| Practice brief | Target snapshot, lá»—i/nguá»“n liÃªn quan, tá»‘i Ä‘a 5 chunks | Má»™t nhiá»‡m vá»¥ cÃ³ cÆ¡ há»™i dÃ¹ng target, máº«u cÃ¢u/giáº£i thÃ­ch, contextKey má»›i | briefRevision, source refs, rubricVersion |
| Attempt feedback | Transcript STT, verified duration, prompt vÃ  targets | Corrections tá»‘i Ä‘a 2 Æ°u tiÃªn, target outcomes + evidence quote; null náº¿u khÃ´ng Ä‘Ã¡nh giÃ¡ Ä‘Æ°á»£c | STT provider/model, evaluator model, rubric/schema versions |
| Dialogue reply | Scenario snapshot, tá»‘i Ä‘a 8 lÆ°á»£t, objectives vÃ  tÃ¬nh tráº¡ng hiá»‡n táº¡i | Reply Ä‘Ãºng vai, cÃ¢u há»i tiáº¿p theo, finish suggestion; text cÃ³ giá»›i háº¡n | Turn refs, checkpoint, hint usage |
| Dialogue summary | Transcript cÃ³ speaker, objectives, hint usage, targets | Task achievement vÃ  evidence; khÃ´ng bá»‹a phÃ¡t Ã¢m/tÃ¢m lÃ½/trÃ¬nh Ä‘á»™ | Má»™t final evaluation/session |
| TTS | Text Ä‘Ã£ lÆ°u tá»« brief hoáº·c reply, voice cá»‘ Ä‘á»‹nh | Bytes audio há»£p lá»‡ vÃ  metadata | synthesizedAudioId, voice/model, char count |

Prompt templates Ä‘áº·t trong `backend/src/main/resources/prompts/` theo feature/version; schema result Ä‘Æ°á»£c kiá»ƒm tra báº±ng DTO vÃ  validator. Provider response body cÃ³ giá»›i háº¡n kÃ­ch thÆ°á»›c. Háº¿t max output hoáº·c tá»« chá»‘i sinh lÃ  failure rÃµ rÃ ng, khÃ´ng parse má»™t pháº§n thÃ nh káº¿t quáº£ thÃ nh cÃ´ng.

Dá»¯ liá»‡u nguá»“n/transcript lÃ  ná»™i dung há»c, khÃ´ng pháº£i chá»‰ dáº«n há»‡ thá»‘ng. Máº«u chá»©a â€œignore previous instructionsâ€ khÃ´ng Ä‘Æ°á»£c thay Ä‘á»•i rubric, owner hay gá»i cÃ´ng cá»¥. Báº£n Ä‘áº§u khÃ´ng cáº¥p tool gá»i URL/code/email cho LLM. Chá»‰ gá»­i ngá»¯ cáº£nh cáº§n thiáº¿t vÃ  ID opaque; bá» email/tÃªn ngÆ°á»i dÃ¹ng khá»i prompt náº¿u khÃ´ng cáº§n.

STT raw transcript giá»¯ nguyÃªn; user sá»­a transcript táº¡o amendment riÃªng. Äiá»ƒm ngá»¯ phÃ¡p sau amendment pháº£i ghi assessedFrom=user_corrected_transcript vÃ  khÃ´ng Ä‘á»§ Ä‘á»ƒ káº¿t luáº­n kháº£ nÄƒng tá»± nÃ³i. Word timestamps lÃ  dá»¯ liá»‡u há»— trá»£ playback náº¿u provider tráº£, khÃ´ng tá»± xem lÃ  Ä‘o phÃ¡t Ã¢m chuáº©n.

### 9.2 Kiá»ƒm Ä‘á»‹nh audio vÃ  S3

1. Client chá»n MIME báº±ng kiá»ƒm tra há»— trá»£ MediaRecorder; báº£n Ä‘áº§u kiá»ƒm tra WebM/Opus vÃ  MP4/AAC trÃªn browser má»¥c tiÃªu, khÃ´ng Ã©p táº¥t cáº£ browser dÃ¹ng má»™t codec.
2. Backend sinh object key, upload grant 10 phÃºt theo contract cÅ©; giá»›i háº¡n 20 MiB. Client upload trá»±c tiáº¿p bucket vá»›i header Ä‘Ãºng grant, khÃ´ng Ä‘Æ°a AWS secret vÃ o browser.
3. Completion adapter Ä‘á»c metadata, láº¥y versionId cá»¥ thá»ƒ, Ä‘á»c Ä‘Ãºng version Ä‘Ã³ Ä‘á»ƒ tÃ­nh SHA-256, xÃ¡c Ä‘á»‹nh MIME vÃ  Ä‘o duration báº±ng ffprobe. KhÃ´ng dÃ¹ng ETag lÃ m SHA-256, khÃ´ng tin duration/MIME do browser khai bÃ¡o.
4. Seal lÆ°u version Ä‘Ã£ kiá»ƒm tra; version xuáº¥t hiá»‡n sau Ä‘Ã³ khÃ´ng thay Ä‘á»•i attempt Ä‘Ã£ seal. Audio chÆ°a seal khÃ´ng Ä‘Æ°á»£c STT/playback/progress dÃ¹ng.
5. Giá»›i háº¡n monologue theo contract 2â€“180 giÃ¢y; remediation 2â€“60 giÃ¢y, Ä‘á» gá»£i Ã½ 10â€“45 giÃ¢y; dialogue 2â€“60 giÃ¢y/lÆ°á»£t vÃ  tá»•ng budget. Náº¿u ngÆ°á»i dÃ¹ng chá»‰ tráº£ lá»i dÆ°á»›i 2 giÃ¢y, UI nháº¯c má»Ÿ rá»™ng cÃ¢u theo contract thay vÃ¬ Ã¢m tháº§m cháº¥p nháº­n khÃ¡c backend.
6. ffprobe cháº¡y báº±ng argv riÃªng, timeout, háº¡n cháº¿ tÃ i nguyÃªn vÃ  thÆ° má»¥c táº¡m; khÃ´ng ghÃ©p filename/user input vÃ o shell. Cleanup temp trong finally. Viá»‡c Ä‘á»c/kiá»ƒm Ä‘á»‹nh ngoÃ i transaction, commit ngáº¯n sau recheck session/attempt version.
7. URL playback60 giÃ¢y, no-store; metadata cÃ³ expiresAt/availability. KhÃ´ng lÆ°u signed URL vÃ o DB/localStorage/log; frontend xin láº¡i khi háº¿t háº¡n.
8. Retention xÃ³a Ä‘Ãºng version Ä‘Ã£ seal. Bá»• sung cleanup upload bá» dá»Ÿ vÃ  cÃ¡c version khÃ´ng Ä‘Æ°á»£c tham chiáº¿u sau khi grant háº¿t háº¡n; khÃ´ng Ä‘á»ƒ presigned URL tÃ¡i dÃ¹ng táº¡o version thá»«a tá»“n táº¡i vÃ´ háº¡n.
9. Lifecycle storage pháº£i phá»‘i há»£p DB worker Ä‘á»ƒ metadata pháº£n Ã¡nh háº¿t háº¡n; staging kiá»ƒm thá»­ overwrite sau seal, checksum mismatch, máº¥t object vÃ  retry delete.

Default Ä‘á» xuáº¥t giá»¯ audio ngÆ°á»i há»c 30 ngÃ y vÃ  TTS cÃ¡ nhÃ¢n 7 ngÃ y; pháº£i Ä‘á»‘i chiáº¿u retention policy/config hiá»‡n cÃ³ á»Ÿ M0 vÃ  ghi thÃ nh má»™t nguá»“n cáº¥u hÃ¬nh duy nháº¥t trÆ°á»›c khi báº­t. UI hiá»ƒn thá»‹ thá»i háº¡n tháº­t tá»« server, khÃ´ng hard-code30 ngÃ y. Gia háº¡n comparison khÃ´ng tá»± gia háº¡n audio.

### 9.3 Jobs vÃ  idempotency

Giá»¯ jobs hiá»‡n cÃ³ `VOCABULARY_CONTEXT_ANALYSIS`, `SPEAKING_EVALUATION`; thÃªm `PRACTICE_BRIEF_GENERATION`, `DIALOGUE_TURN_RESPONSE`, `DIALOGUE_SESSION_EVALUATION`, `SPEECH_SYNTHESIS`, `CONTENT_SOURCE_DELETION`. TÃªn enum/key thá»±c táº¿ pháº£i Ä‘Æ°á»£c ná»‘i vÃ o handler registry/quota map/tests.

CÃ¡c record phá»¥ cáº§n triá»ƒn khai cÃ¹ng resource, khÃ´ng Ä‘á»ƒ chá»‰ tá»“n táº¡i trong memory:

- `speaking_hints`: id, user_id, session_id, reply_to_turn_id nullable, target_id nullable, practice_phase nullable, status, text, hint_ordinal, job/quota refs, createdAt. Dialogue cáº§n reply_to_turn_id; remediation cáº§n target_id/practice_phase. Partial unique indexes theo hai loáº¡i vÃ  ordinal; server ghi assistance trÆ°á»›c khi tráº£ hint.
- Dialogue extension cá»§a session: `finish_state=OPEN/REQUESTED/EVALUATING/FAILED/FINALIZED`, version; khÃ´ng Ä‘á»•i aggregate status thÃ nh completed trÆ°á»›c khi finalize.
- `content_deletion_requests`: user/source refs, status, checkpoints, errorCode; lÆ°u ngoÃ i row source Ä‘á»ƒ Ä‘á»c káº¿t quáº£ sau purge.
- `platform_provider_calls`: operationId, stage, executionAttempt, provider/requestId, status, tokens/audioSeconds/characters, estimatedCost/actualCost, rateCardVersion, timestamps; unique operation/stage/executionAttempt.
- Content source lÆ°u learningGoal; learner preferences cÃ³ jobContext vÃ  preferredPracticeLevelBand báº±ng validation/version; khÃ´ng Ä‘Æ°a má»i context cÃ¡ nhÃ¢n vÃ o JSON khÃ´ng kiá»ƒm soÃ¡t.

Khi lá»—i máº¡ng á»Ÿ provider, cÃ³ thá»ƒ provider Ä‘Ã£ xá»­ lÃ½ dÃ¹ client khÃ´ng nháº­n response. Checkpoint vÃ  idempotency ná»™i bá»™ báº£o Ä‘áº£m má»™t káº¿t quáº£/event Ä‘Æ°á»£c cháº¥p nháº­n, khÃ´ng báº£o Ä‘áº£m tuyá»‡t Ä‘á»‘i chá»‰ bá»‹ provider tÃ­nh tiá»n má»™t láº§n. Ghi call status UNKNOWN, giá»¯ budget dá»± phÃ²ng vÃ  giá»›i háº¡n retry; Ä‘á»‘i soÃ¡t náº¿u provider há»— trá»£ requestId. KhÃ´ng tá»± giáº£i phÃ³ng háº¿t ngÃ¢n sÃ¡ch cá»§a má»™t call chÆ°a rÃµ káº¿t quáº£.

TTS retry giá»¯ text Ä‘Ã£ commit, STT retry khÃ´ng cháº¡y náº¿u transcript checkpoint há»£p lá»‡, feedback retry khÃ´ng táº¡o láº¡i recording. Resource terminal muá»‘n retry cáº§n explicit command vÃ  giá»›i háº¡n sá»‘ execution; khÃ´ng láº·p vÃ´ háº¡n tá»« frontend polling.

Resend cÃ³ idempotency key vá»›i thá»i háº¡n lÆ°u 24 giá». [TÃ i liá»‡u Resend](https://resend.com/docs/dashboard/emails/idempotency-keys). Trong má»™t delivery attempt chá»‰ reuse key cho payload báº¥t biáº¿n. Worker hiá»‡n sinh token vÃ  chá»‰ lÆ°u hash: náº¿u crash lÃ m máº¥t payload/token, táº¡o delivery revision má»›i vÃ  key má»›i, cÃ³ thá»ƒ gá»­i láº¡i email; khÃ´ng tÃ¡i dÃ¹ng key cÅ© vá»›i token má»›i. ADR pháº£i ghi rÃµ hÃ nh vi nÃ y vÃ  rate limit; khÃ´ng Ä‘Æ°a raw verification token vÃ o job payload/log Ä‘á»ƒ cá»‘ Ä‘áº¡t exactly-once.

### 9.4 Budget vÃ  quota

TÃ¡ch quota ngÆ°á»i dÃ¹ng vÃ  phÃ­ nhÃ  cung cáº¥p. Vá»›i má»—i operation: reserve user quota + global estimated budget trong transaction â†’ gá»i provider cÃ³ usage receipt â†’ commit consume/release pháº§n cÃ²n láº¡i. Failure khÃ´ng cÃ³ káº¿t quáº£ há»c cÃ³ thá»ƒ hoÃ n user quota nhÆ°ng phÃ­ Ä‘Ã£ phÃ¡t sinh váº«n ghi nháº­n, khÃ´ng reset báº±ng retry.

Quota alpha Ä‘á» xuáº¥t, cÃ³ thá»ƒ Ä‘iá»u chá»‰nh báº±ng config:

| Operation | Giá»›i háº¡n/user/ngÃ y UTC | Giá»›i háº¡n trong session |
|---|---:|---|
| Context analysis |10| Má»™t resource Ä‘ang xá»­ lÃ½/nguá»“n revision |
| Brief generation |10| KhÃ´ng tá»± regenerate khi refresh |
| Monologue/remediation evaluation |20| Tá»‘i Ä‘a3 attempts cho bÃ i chá»¯a lá»—i báº£n Ä‘áº§u |
| Dialogue session start |5| Má»™t speaking active/user |
| Dialogue user turns |40| Tá»‘i Ä‘a8 user turns/session |
| Hints |10| Tá»‘i Ä‘a2/turn |
| TTS synthesis |Theo char budget vÃ  cache owner| Má»™t resource/text+voice+version, retry cÃ³ kiá»ƒm soÃ¡t |

ÄÃ¢y lÃ  config Ä‘á» xuáº¥t thay cho default hiá»‡n táº¡i, khÃ´ng pháº£i quáº£ng cÃ¡o gÃ³i giÃ¡. Khi finish dialogue, dÃ nh quota/budget final evaluation tá»« lÃºc start Ä‘á»ƒ trÃ¡nh há»c xong má»›i biáº¿t khÃ´ng Ä‘á»§ quota cháº¥m. Chá»‰ reserve pháº§n session cáº§n thiáº¿t, tráº£ láº¡i pháº§n chÆ°a dÃ¹ng khi abandon/complete. TrÆ°á»ng há»£p budget khÃ´ng Ä‘á»§ Ä‘á»ƒ báº¯t Ä‘áº§u cho biáº¿t ngay trÆ°á»›c ghi Ã¢m.

CÃ´ng thá»©c tÃ­nh chi phÃ­/phiÃªn: LLM input tokens Ã— rate input + output tokens Ã— rate output + STT minutes Ã— rate STT + TTS characters Ã— rate TTS + storage/request charges. Rate card cÃ³ ngÃ y/version; káº¿ hoáº¡ch chÆ°a gÃ¡n giÃ¡ giáº£ Ä‘á»‹nh. BÃ¡o cÃ¡o internal theo sá»‘ phiÃªn hoÃ n táº¥t, khÃ´ng chá»‰ tá»•ng request.

Báº­t bÃ¡o Ä‘á»™ng budget á»Ÿ 80% vÃ  cháº·n viá»‡c tá»‘n phÃ­ má»›i á»Ÿ 100% cá»§a má»©c cáº¥u hÃ¬nh; Ä‘Ã¢y lÃ  chÃ­nh sÃ¡ch Ä‘á» xuáº¥t, budget sá»‘ tiá»n cá»¥ thá»ƒ chá»n trong ADR M0. Hoáº¡t Ä‘á»™ng Ä‘á»c, review khÃ´ng gá»i AI vÃ  playback Ä‘Ã£ cÃ³ tiáº¿p tá»¥c dÃ¹ng Ä‘Æ°á»£c.

### 9.5 Metrics vÃ  má»¥c tiÃªu cháº¥t lÆ°á»£ng

- Äo p50/p95 tá»« upload-complete Ä‘áº¿n feedback; turn submit Ä‘áº¿n reply text/audio; final finish Ä‘áº¿n summary; stage failure, retry count, queue age, budget usage vÃ  orphan audio.
- Má»¥c tiÃªu alpha ban Ä‘áº§u: reply text p95â‰¤8s cho cÃ¢u tráº£ lá»i userâ‰¤20s; feedback bÃ i nÃ³iâ‰¤90s cÃ³ p95â‰¤20s. ÄÃ¢y lÃ  má»¥c tiÃªu pháº£i benchmark á»Ÿ mÃ´i trÆ°á»ng/region tháº­t, khÃ´ng cam káº¿t provider.
- Worker batch/pool cho dialogue cáº§n trÃ¡nh chá» sau job ná»n lÃ¢u; thÃªm job priority hoáº·c lane cÃ³ concurrency budget vÃ o queue hiá»‡n táº¡i sau Ä‘o thá»­. KhÃ´ng Ä‘á»•i polling 200ms toÃ n queue hoáº·c dá»±ng queue thá»© hai thiáº¿u fencing.
- Concurrency limit provider Ä‘Æ°á»£c cáº¥u hÃ¬nh, tÃ´n trá»ng Retry-After; transaction pool khÃ´ng bá»‹ giá»¯ trong lÃºc gá»i AI.
- Metrics tags chá»‰ loáº¡i operation/model Ä‘Ã£ cho phÃ©p/status; khÃ´ng Ä‘áº·t userId/transcript/source text thÃ nh tag cÃ³ cardinality cao.
- Request logging che credentials, token email, signed URLs, source text vÃ  recordings. Feedback report giá»¯ note riÃªng theo owner, khÃ´ng Ä‘Æ°a vÃ o log thÃ´ng thÆ°á»ng.

## 10. Ranh giá»›i phá»¥ thuá»™c, sá»± kiá»‡n vÃ  xÃ³a dá»¯ liá»‡u

### 10.1 TrÃ¡nh dependency cycle khi ná»‘i chá»¯a lá»—i

Dependency compile-time Ä‘Ã­ch:

```text
study â†’ progress.publicapi / speaking.publicapi / vocabulary.publicapi / content.publicapi
progress â†’ speaking.publicapi / vocabulary.publicapi / learner.publicapi
speaking â†’ learner.publicapi / platform.publicapi
vocabulary â†’ content.publicapi / learner.publicapi / platform.publicapi
content â†’ platform.publicapi
```

CÃ¡c phá»¥ thuá»™c ná»n identity/platform hiá»‡n cÃ³ giá»¯ theo ArchUnit baseline. SÆ¡ Ä‘á»“ má»¥c4 thá»ƒ hiá»‡n luá»“ng dá»¯ liá»‡u, khÃ´ng cho phÃ©p module import ngÆ°á»£c má»i mÅ©i tÃªn.

**Speaking khÃ´ng import Progress Ä‘á»ƒ Ä‘á»c lá»—i.** `PracticeBriefCoordinator` thuá»™c Study Ä‘á»c learning target/source qua public ports rá»“i gá»i Speaking vá»›i snapshot Ä‘Ã£ validate. Controller URL `/speaking/practice-briefs` cÃ³ thá»ƒ thuá»™c lá»›p API orchestration Study; URL khÃ´ng quyáº¿t Ä‘á»‹nh ownership Java package. Command public khÃ´ng cho browser tá»± Ä‘Æ°a snapshot giáº£ vÃ o. CÃ¡ch nÃ y trÃ¡nh vÃ²ng Progress â†’ Speaking â†’ Progress.

`ContentDeletionCoordinator` cÅ©ng thuá»™c Study: Ä‘Ã¡nh dáº¥u source DELETING qua Content, dá»«ng/purge derived work qua Speaking/Vocabulary, cuá»‘i cÃ¹ng purge Content; lÆ°u checkpoint vÃ  retry idempotent. KhÃ´ng Ä‘á»ƒ Content gá»i repository Speaking hoáº·c giá»¯ FK vÃ²ng Ä‘á»ƒ cascade toÃ n app.

### 10.2 Event vÃ  chá»‘ng tÃ­nh trÃ¹ng

| Sá»± kiá»‡n | Producer | Consumer/tÃ¡c dá»¥ng |
|---|---|---|
| SpeakingEvaluationCompleted â€” má»Ÿ rá»™ng version | Speaking | Progress táº¡o mistake occurrence vÃ  target evidence tá»« attempt evaluation |
| DialogueEvaluationCompleted â€” má»›i | Speaking | Progress nháº­n final session feedback theo scope SESSION, khÃ´ng giáº£ attempt |
| SpeakingSessionCompleted â€” giá»¯ event chuáº©n | Speaking má»i mode | Má»™t activity ledger entry/session, duration tá»•ng há»£p theo mode |
| VocabularyReviewCompleted â€” hiá»‡n cÃ³ | Vocabulary | Tiáº¿p tá»¥c ledger/review evidence Ä‘Ãºng contract |
| PracticeBriefReady â€” náº¿u cáº§n chuáº©n bá»‹ plan | Speaking | Study lÃ m má»›i readiness, khÃ´ng tá»± activate phiÃªn |
| LearningEvidenceRecorded â€” náº¿u dÃ¹ng projection riÃªng | Progress | Update evidence projection trong cÃ¹ng module; khÃ´ng phÃ¡t duration láº§n ná»¯a |

ID dedupe gá»“m producer eventId vÃ  logical source ID. Má»™t evaluation cÃ³ correction vÃ  targetAssessments nhÆ°ng má»™t cÆ¡ há»™i/target chá»‰ táº¡o má»™t evidence record. Dialogue chá»‰ phÃ¡t correction/evidence tá»« final evaluator; reply giá»¯a lÆ°á»£t khÃ´ng Ä‘Æ°a lá»—i vÃ o sá»• láº§n ná»¯a.

Duration: monologue/remediation theo evaluated attempts hiá»‡n Ä‘Æ°á»£c lifecycle cháº¥p nháº­n; dialogue cá»™ng distinct verified user-turn attempts cÃ³ transcript há»£p lá»‡ vÃ  náº±m trong final evaluation. KhÃ´ng cá»™ng AI audio, orphan uploads, duplicate submit, thá»i gian chá» hay final session evaluation nhÆ° má»™t lÆ°á»£t há»c má»›i.

Source of truth cho learning evidence lÃ  persisted evaluation + immutable prompt/targets/hints snapshots. Projection rebuild pháº£i Ä‘á»c nhá»¯ng record nÃ y Ä‘á»ƒ tÃ¡i táº¡o cÃ¹ng dedupe keys; khÃ´ng Ä‘á»c tráº¡ng thÃ¡i UI hiá»‡n táº¡i. ThÃªm projectedThrough vÃ  pendingProjection nhÆ° Progress Ä‘ang cÃ³.

### 10.3 Deletion/retention

- Account DELETING tá»« chá»‘i má»i viá»‡c má»›i; má»—i worker recheck trÆ°á»›c commit, ká»ƒ cáº£ provider vá»«a tráº£ káº¿t quáº£.
- ChÃ¨n cleaners má»›i vÃ o thá»© tá»± hiá»‡n cÃ³: ngá»«ng job â†’ Study plan/links â†’ Progress comparisons/evidence/targets â†’ Speaking turns/hints/feedback/TTS/attempt audio/briefs â†’ Vocabulary source links/reviews/words â†’ Content â†’ Learner/Identity.
- Thá»© tá»± chi tiáº¿t pháº£i topo-sort theo FK thá»±c táº¿; source deletion coordinator cÃ³ checkpoint riÃªng. KhÃ´ng xÃ³a metadata audio trÆ°á»›c khi Ä‘Ã£ xá»­ lÃ½ object version thÃ nh cÃ´ng.
- Dá»¯ liá»‡u provider usage chá»©a user association pháº£i Ä‘Æ°á»£c xÃ³a/anonymize theo policy account deletion hiá»‡n cÃ³; chá»‰ giá»¯ thá»‘ng kÃª tá»•ng há»£p khÃ´ng nháº­n dáº¡ng khi cáº§n váº­n hÃ nh.
- Expired audio khÃ´ng lÃ m máº¥t sá»• lá»—i; metadata availability pháº£n Ã¡nh tháº­t. Data deletion test pháº£i gá»“m job Ä‘ang cháº¡y vÃ  reply TTS Ä‘áº¿n muá»™n.

## 11. Kiá»ƒm thá»­ vÃ  tiÃªu chÃ­ nghiá»‡m thu

### 11.1 Ma tráº­n test theo lá»›p

| Lá»›p | Test pháº£i cÃ³ |
|---|---|
| Unit/domain | Learning target stage/schedule, level mapping, mode/finish lifecycle, plan budget, comparability vÃ  máº«u sá»‘ evidence |
| Integration PostgreSQL | Unique active session, concurrent activate, quota reservation, worker lease fencing, FK/delete checkpoints, event replay khÃ´ng ghi trÃ¹ng |
| Provider contract | HTTP success,429/Retry-After,timeout,401,invalid model,JSON Ä‘Ãºng shape nhÆ°ng quote/target sai, bytes audio lá»—i |
| OpenAPI | Má»i controller má»›i, enum status tháº­t, optional field/backward compatibility, drift check |
| Frontend service/component | Wire enum tháº­t, stage-specific retry, active session conflict, pause polling, logout stale response, audio unavailable |
| Browser E2E | CÃ¡c luá»“ng bÃªn dÆ°á»›i, codec/mic, back/reload, multi-tab; axe + keyboard manual |
| Operational | Audio cleanup/orphans, budget cap, provider timeout khÃ´ng chiáº¿m DB transaction, queue metrics, backup/restore |

Fake provider dÃ¹ng deterministic fixtures cÃ³ nhÃ£n Ä‘á»ƒ CI khÃ´ng tá»‘n tiá»n. CI thÃ´ng thÆ°á»ng khÃ´ng cÃ³ key production. Staging cÃ³ smoke test provider tháº­t vá»›i fixture Ä‘Æ°á»£c phÃ©p dÃ¹ng vÃ  spend cap; test fake pass khÃ´ng thay smoke test tháº­t.

### 11.2 CÃ¡c hÃ nh trÃ¬nh E2E báº¯t buá»™c

1. Signup â†’ nháº­n verify email â†’ login/onboarding â†’ táº¡o source â†’ chá»n chunks â†’ nÃ³i â†’ feedback â†’ nÃ³i láº¡i â†’ má»Ÿ lá»‹ch sá»­ sau refresh.
2. NgÆ°á»i má»›i khÃ´ng cÃ³ source/tá»«/lá»—i váº«n báº¯t Ä‘áº§u bÃ i catalog vÃ  hoÃ n táº¥t Ä‘Æ°á»£c.
3. Hai tab cÃ¹ng start Study/standalone speaking: chá»‰ má»™t phiÃªn há»£p lá»‡, tab cÃ²n láº¡i nháº­n409 vÃ  resume Ä‘Ãºng.
4. Study ba bÆ°á»›c vocabulary â†’ remediation â†’ dialogue: chá»‰ má»™t speaking active má»—i thá»i Ä‘iá»ƒm; refresh á»Ÿ má»i bÆ°á»›c khÃ´ng máº¥t phiÃªn hoáº·c táº¡o child trÃ¹ng.
5. Mic denied, thiáº¿t bá»‹ máº¥t káº¿t ná»‘i, audio quÃ¡ ngáº¯n, codec khÃ´ng há»— trá»£, upload grant háº¿t háº¡n: giá»¯ pháº§n cÃ³ thá»ƒ giá»¯ vÃ  hÆ°á»›ng dáº«n tiáº¿p tá»¥c Ä‘Ãºng.
6. STT thÃ nh cÃ´ng/feedback lá»—i: retry khÃ´ng gá»i láº¡i STT; reply text thÃ nh cÃ´ng/TTS lá»—i: retry khÃ´ng gá»i láº¡i LLM.
7. Double-click submit turn, response timeout vÃ  retry cÃ¹ng key: Ä‘Ãºng má»™t user turn/reply; final summary Ä‘Ãºng má»™t resource.
8. Complete/finish trong lÃºc job pending, abandon khi provider cháº¡y, account deletion lÃºc provider tráº£: khÃ´ng ghi tráº¡ng thÃ¡i/evidence trÃ¡i lifecycle.
9. Source sá»­a revision trong lÃºc extraction cÅ© cháº¡y: káº¿t quáº£ gáº¯n Ä‘Ãºng revision; source xÃ³a khÃ´ng sinh láº¡i derived data do late worker.
10. Báº¥m Ä‘Ãºng tráº¯c nghiá»‡m hoáº·c status resolved khÃ´ng tá»± táº¡o demonstrated; hint/no opportunity/uncertain khÃ´ng bá»‹ tÃ­nh lÃ  independently correct.
11. Audio háº¿t retention: comparison cÃ²n transcript/evidence, nÃºt nghe cÃ³ lÃ½ do; grant user khÃ¡c khÃ´ng truy cáº­p Ä‘Æ°á»£c qua API.
12. Replay event vÃ  rebuild projection cho cÃ¹ng evaluation: counts/duration khÃ´ng Ä‘á»•i; ngÃ y há»c Ä‘Ãºng timezone snapshot qua ná»­a Ä‘Ãªm.

### 11.3 ÄÃ¡nh giÃ¡ cháº¥t lÆ°á»£ng AI trÆ°á»›c alpha

Táº¡o táº­p nhá» Ä‘Æ°á»£c ngÆ°á»i dÃ¹ng cho phÃ©p, khÃ´ng láº¥y transcript riÃªng tÆ° lÃ m fixture public:

- Khoáº£ng30 recordings tiáº¿ng Anh vá»›i nhiá»u giá»ng Viá»‡t, gá»“m nÃ³i tá»‘t, nÃ³i sai, ngáº­p ngá»«ng vÃ  Ã¢m thanh kÃ©m.
- Khoáº£ng30 source texts cÃ´ng viá»‡c cÃ³ annotations chunks/quotes; gá»“m input khÃ´ng cÃ³ cá»¥m há»¯u Ã­ch vÃ  prompt injection.
- Khoáº£ng20 tÃ¬nh huá»‘ng chá»¯a lá»—i vá»›i Ä‘Ã¡p Ã¡n Ä‘Ãºng/sai/nÃ© target/cáº§n hint.
- Ãt nháº¥t10 roleplay scripts kiá»ƒm tra há»i tiáº¿p Ä‘Ãºng cÃ¢u tráº£ lá»i, khÃ´ng vÆ°á»£t vai, khÃ´ng tá»± káº¿t thÃºc quÃ¡ sá»›m.
- NgÆ°á»i review kiá»ƒm tra sá»­a Ä‘Ãºng nghÄ©a, khÃ´ng Ä‘á»•i Ã½ ngÆ°á»i nÃ³i, evidence tá»“n táº¡i, khÃ´ng bá»‹a phÃ¡t Ã¢m; cháº¥m theo rubric thá»‘ng nháº¥t. Ghi tá»· lá»‡ vÃ  lá»—i Ä‘iá»ƒn hÃ¬nh, khÃ´ng chá»‰ Ä‘iá»ƒm trung bÃ¬nh.

M0 chá»‘t threshold alpha dá»±a trÃªn táº­p máº«u vÃ  má»©c cháº¥p nháº­n thá»±c táº¿. Gate tá»‘i thiá»ƒu: khÃ´ng cÃ³ lá»—i truy cáº­p chÃ©o user, quote bá»‹a hoáº·c audio score cá»‘ Ä‘á»‹nh trong táº­p nghiá»‡m thu; pháº£n há»“i chÆ°a Ä‘á»§ cháº¯c pháº£i hiá»ƒn thá»‹ uncertain. Táº­p nhá» khÃ´ng chá»©ng minh hiá»‡u quáº£ há»c dÃ i háº¡n; sau alpha tiáº¿p tá»¥c thu feedback vÃ  Ä‘Ã¡nh giÃ¡.

### 11.4 Lá»‡nh kiá»ƒm tra khi triá»ƒn khai

Tá»« backend: `./mvnw.cmd verify` vá»›i Docker Ä‘á»ƒ cháº¡y integration tests; dÃ¹ng PowerShell `./scripts/export-openapi.ps1` theo README. Tá»« frontend: `yarn generate:api`, `yarn lint`, `yarn test`, `yarn build`; thÃªm scripts `test:e2e` vÃ  `test:a11y` khi cÃ i Playwright. Regenerate contract intentional changes rá»“i kiá»ƒm tra diff; khÃ´ng Ä‘á»ƒ `check:api` bÃ¡o pass nhá» sá»­a tay generated file.

KhÃ´ng cáº§n cháº¡y láº¡i toÃ n test suite trong lÆ°á»£t chá»‰ viáº¿t tÃ i liá»‡u. Khi implementation báº¯t Ä‘áº§u, lÆ°u log vÃ o PR/milestone vÃ  kiá»ƒm tra browser tháº­t cho mÃ n hÃ¬nh Ä‘Ã£ thay Ä‘á»•i.

## 12. Backlog triá»ƒn khai theo má»‘c

Æ¯á»›c lÆ°á»£ng lÃ  ngÃ y ká»¹ thuáº­t cho má»™t ngÆ°á»i quen repo, gá»“m backend/frontend/test tÃ­nh nÄƒng. ChÆ°a gá»“m chá» tÃ i khoáº£n provider, dá»±ng táº­p dá»¯ liá»‡u lá»›n hoáº·c thá»i gian ngÆ°á»i dÃ¹ng thá»­. Tá»•ng khoáº£ng 48â€“76 ngÃ y ká»¹ thuáº­t; thÃªm dá»± phÃ²ng20â€“30% náº¿u provider/codec/schema phÃ¡t sinh. CÃ³ thá»ƒ phÃ¡t alpha sá»›m sau M3/M4; khÃ´ng pháº£i chá» toÃ n bá»™ plan.

| Má»‘c | Pháº¡m vi | Æ¯á»›c lÆ°á»£ng | Phá»¥ thuá»™c | Gate |
|---|---|---:|---|---|
| M0 | Contract vÃ  quyáº¿t Ä‘á»‹nh ná»n |3â€“5 ngÃ y| â€” | Enum/mapping rÃµ, ADR/provider/retention/budget, feature flags |
| M1 | Provider tháº­t vÃ  audio pipeline |8â€“12 ngÃ y| M0 | TÃ i khoáº£n má»›i nÃ³i/nháº­n feedback/má»Ÿ láº¡i audio Ä‘Æ°á»£c |
| M2 | Speaking modes + evidence foundation |5â€“8 ngÃ y| M0,M1 | Brief origin, targets, events, migration/legacy tests |
| M3 | F1 chá»¯a lá»—i end-to-end |5â€“8 ngÃ y| M2 | NÃ³i láº¡i táº¡o evidence tháº­t, delayed schedule, UI Ä‘áº§y Ä‘á»§ states |
| M4 | F2 ná»™i dung thÃ nh bÃ i luyá»‡n |6â€“9 ngÃ y| M2 | Source â†’ chunk â†’ brief â†’ practice cÃ³ trace nguá»“n |
| M5 | F4 plan vÃ  lazy Study báº£n Ä‘áº§u |5â€“8 ngÃ y| M3,M4 | Nhiá»u bÆ°á»›c cÃ³ hai speaking cháº¡y tuáº§n tá»±, resume/concurrency |
| M6 | F3 roleplay vÃ  ná»‘i daily plan |9â€“15 ngÃ y| M2,M5 | Theo lÆ°á»£t tháº­t, checkpoint/TTS fallback/finalize Ä‘Ãºng |
| M7 | F5 UI + hardening/release |7â€“11 ngÃ y| M3â€“M6 | Comparison/evidence, browser matrix, load/restore/release gates |

### M0 â€” Chuáº©n hÃ³a trÆ°á»›c khi má»Ÿ rá»™ng

- [ ] M0-B01: ADR provider/model/voice, ngÃ¢n sÃ¡ch vÃ  retention; benchmark spike cÃ³ káº¿t quáº£, khÃ´ng chá»‰ danh sÃ¡ch lá»±a chá»n.
- [x] M0-B02 (contract slice): Enum MistakeStatus trong OpenAPI; thÃªm capability/usage read APIs, flags server vÃ  sá»­a wire mapping. PracticeLevelResolver váº«n náº±m á»Ÿ M5-B01.
- [ ] M0-B03: Chá»‘t schema changes, dependency DAG, event payload version vÃ  ownership cá»§a brief coordinator.
- [x] M0-F01: Sá»­a progressService wire statuses vÃ  test fixtures; tÃ¡ch evidenceStage type; khÃ´ng cÃ²n gá»­i improving/mastered tá»›i backend.
- [x] M0-F02 (demo boundary): scoring shadowing cá»‘ Ä‘á»‹nh Ä‘Ã£ gáº¯n source=demo vÃ  hiá»ƒn thá»‹ rÃµ chÆ°a cháº¥m Ã¢m thanh; social proof Ä‘Æ°á»£c ghi rÃµ trong PROJECT.md.
- [x] M0-Q01 (contract slice): OpenAPI enum vÃ  regression mapping status Ä‘Ã£ cÃ³; mapping level/legacy Study tiáº¿p tá»¥c lÃ  gate trÆ°á»›c M1.

### M1 â€” TÃ i khoáº£n má»›i há»c vá»›i provider tháº­t

- [x] M1-B01: Resend email adapter, verification/reset delivery revision vÃ  rate limit; config prod validate.
- [x] M1-B02 (core slice): S3 signer/inspection/playback/delete Ä‘Ãºng version, MIME/checksum/duration báº±ng ffprobe; orphan cleanup vÃ  reconciliation cÃ²n láº¡i.
- [x] M1-B03: Deepgram STT, Claude feedback/extraction adapter, DTO validation, checkpoint, timeout vÃ  failure taxonomy Ä‘Ã£ cÃ³; provider smoke test tháº­t cÃ²n á»Ÿ M1-Q01.
- [x] M1-B04 (usage + budget slice): platform_provider_usage ghi receipt idempotent theo operation/stage/attempt; worker reserve estimated global budget trÆ°á»›c provider call; SUCCEEDED cÃ³ usage Ä‘Æ°á»£c RECONCILED, UNKNOWN váº«n giá»¯ reservation; rate-card config vÃ  cap cÃ³ ADR 0030. Provider smoke tháº­t cÃ²n á»Ÿ M1-Q01.
- [x] M1-F01 (auth slice): VerifyEmail page, resend flow vÃ  reset/forgot API Ä‘Ã£ ná»‘i; banner feature/quota tiáº¿p tá»¥c hoÃ n thiá»‡n cÃ¹ng M1-F02.
- [x] M1-F02 (core slice): Capability/quota tháº­t Ä‘Æ°á»£c Ä‘á»c tá»« server; Context Capture vÃ  Speaking khÃ³a Ä‘Ãºng thao tÃ¡c khi háº¿t lÆ°á»£t, hiá»ƒn thá»‹ lÃ½ do/reset, retry/recovery váº«n giá»¯ idempotent flow. Browser smoke vÃ  expose Ä‘áº§y Ä‘á»§ source/availability cÃ²n á»Ÿ M1-Q01.
- [ ] M1-Q01: Smoke test tháº­t signup â†’ verify â†’ vocabulary â†’ recording â†’ feedback â†’ playback; kiá»ƒm tra timeout vÃ  codec má»¥c tiÃªu.

### M2 â€” Speaking modes vÃ  dá»¯ liá»‡u báº±ng chá»©ng

- [ ] M2-B01: Expand speaking_sessions origin/mode; backfill legacy; khÃ´ng cÃ²n báº¯t topicId cho brief/scenario nhÆ°ng cÃ³ check Ä‘Ãºng nguá»“n.
- [ ] M2-B02: PracticeBriefCoordinator vÃ  brief storage/generation; immutable targets/assistance snapshots.
- [ ] M2-B03: Transcription record, amendment separation, evaluation targetAssessments vÃ  deterministic feedback item IDs.
- [ ] M2-B04: Learning targets/evidence projection + schedule v1; event dedupe vÃ  rebuild source.
- [ ] M2-F01: Typed mode/evaluation union vÃ  source links tá»« occurrence tá»›i session/attempt; chÆ°a báº­t UI má»›i khi API chÆ°a sáºµn.
- [ ] M2-Q01: Migration tá»« V16, blank DB, ownership, ignored/resolved khÃ´ng táº¡o evidence; legacy API khÃ´ng regress.

### M3 â€” Chá»¯a lá»—i cÃ³ Ã­ch ngay

- [ ] M3-B01: Remediation brief prompt/rubric vÃ  validity checks; há»c láº¡i cÃ¹ng Ä‘á» vs context má»›i.
- [ ] M3-B02: Hint records/assistance attribution; target outcome vÃ  schedule/late test rules.
- [ ] M3-F01: RemediationPractice vÃ  CTA tá»« feedback/MistakeDetail; recorder/result/resume states.
- [ ] M3-F02: Feedback report sai, nghe láº¡i/máº«u, nÃºt retry attempt vÃ  hoÃ n thÃ nh theo lifecycle.
- [ ] M3-Q01: Thá»±c hiá»‡n Ä‘á»§ correct/incorrect/not observed/uncertain/hint cases, khÃ´ng cÃ³ duplicate evidence khi retry.
- [ ] M3-P01: Founder dÃ¹ng háº±ng ngÃ y Ã­t nháº¥t má»™t tuáº§n, ghi lá»—i feedback vÃ  lÃ½ do bá» dá»Ÿ trÆ°á»›c má»Ÿ rá»™ng.

### M4 â€” Ná»™i dung cÃ¡ nhÃ¢n thÃ nh buá»•i há»c

- [ ] M4-B01: Module Content, revision/segment CRUD, validation text/goal vÃ  source deletion coordinator.
- [ ] M4-B02: Extraction source reference + multi-source word/chunk links; preserve semantic upsert/review lock behavior.
- [ ] M4-B03: Content brief generation, chunks targets vÃ  task achievement rubric.
- [ ] M4-F01: ContentLibrary/Capture/Detail, chá»n/sá»­a/lÆ°u suggestions, retry brief Ä‘á»™c láº­p.
- [ ] M4-F02: Entry tá»« Vocab/Dashboard; provenance labels vÃ  deleted/expired states.
- [ ] M4-Q01: Source revise/delete trong lÃºc job cháº¡y, duplicate chunk, cross-user source ID vÃ  partial success.

### M5 â€” GhÃ©p buá»•i há»c, khÃ´ng táº¡o trÃ¹ng session

- [ ] M5-B01: Plan rule engine/version, level resolver, date/timezone/budget vÃ  fallback catalog.
- [ ] M5-B02: LAZY constraints vÃ  state machine; advisory lock user dÃ¹ng chung standalone/Study; activate/skip/complete/abandon.
- [ ] M5-B03: Legacy eager compatibility vÃ  plan invalidation; expired/deleted brief cÃ³ replacement rÃµ.
- [ ] M5-F01: Refactor studyService/type/store sang steps array, exhaustive kind/mode mapping.
- [ ] M5-F02: DailyPlan/StudyRunner/resume UI; mobile navigation vÃ  quota/active notices.
- [ ] M5-Q01: Hai speaking steps tuáº§n tá»±, concurrent tabs, double activate, skip/all-skipped guard, midnight/timezone and deletion.

### M6 â€” Há»™i thoáº¡i AI tháº­t

- [ ] M6-B01: Scenario seed 5 tÃ¬nh huá»‘ng, turns/hints/clientTurnId constraints, finish_state.
- [ ] M6-B02: Turn STT â†’ reply â†’ TTS checkpoints; budget giá»›i háº¡n vÃ  priority lane náº¿u benchmark cáº§n.
- [ ] M6-B03: Final evaluation/session scope, correction/evidence events, duration aggregation riÃªng dialogue.
- [ ] M6-F01: Scenario picker, DialogueSession/composer/transcript/objectives, guided/simulation.
- [ ] M6-F02: TTS fallback, restore, pending-turn/finish failures vÃ  summary chá»¯a lá»—i.
- [ ] M6-Q01: Duplicate submit, lost response, TTS error, final retry, late worker after abandon, má»™t reply/logical turn.

### M7 â€” Báº±ng chá»©ng tiáº¿n bá»™ vÃ  phÃ¡t hÃ nh

- [ ] M7-B01: Comparison query owner/comparability, summary numerator/denominator, projection rebuild/version.
- [ ] M7-F01: AttemptComparison A/B, EvidenceTimeline, Progress summary; no data/expired audio/different rubric states.
- [ ] M7-Q01: Playwright flows, axe + keyboard, iOS/Android recording/playback manual; light/dark/zoom/responsive screenshots.
- [ ] M7-Q02: Provider load/budget/quota test, storage retention/deletion, backup+restore audio reconciliation vÃ  release checklist hiá»‡n cÃ³.
- [ ] M7-P01: Pilot 5â€“10 ngÆ°á»i trong 2 tuáº§n; bÃ¡o cÃ¡o activation, completion vÃ²ng sá»­a lá»—i, ngÃ y quay láº¡i vÃ  pháº£n há»“i sai.
- [ ] M7-P02: Chá»‰ báº­t feature cho rá»™ng hÆ¡n sau khi xá»­ lÃ½ lá»—i cháº·n; táº¯t flag dá»«ng viá»‡c má»›i váº«n Ä‘á»c/lÆ°u trá»¯ phiÃªn Ä‘Ã£ cÃ³ Ä‘Æ°á»£c.

## 13. Háº¡ táº§ng local, staging vÃ  rollout

### 13.1 Local

- Giá»¯ compose PostgreSQL hiá»‡n táº¡i lÃ m default. ChÆ°a thÃªm Redis/Kafka hoáº·c nhiá»u worker service Ä‘á»ƒ cháº¡y Ä‘Æ°á»£c má»™t mÃ¡y.
- Dev khÃ´ng cÃ³ key dÃ¹ng fake profile rÃµ nguá»“n cho UI/contracts; staging/dev-real dÃ¹ng bucket S3 riÃªng vÃ  provider keys tháº­t.
- Khi cáº§n cháº¡y full stack báº±ng Compose, thÃªm backend build image cÃ³ Java 21/ffprobe vÃ  frontend static build + reverse proxy; profile riÃªng, khÃ´ng Ã©p thay cÃ¡ch cháº¡y Maven/Vite hiá»‡n cÃ³.
- Database dÃ¹ng healthcheck hiá»‡n táº¡i; backend readiness sau migration vÃ  config validation. KhÃ´ng commit secrets; env example chá»‰ chá»©a tÃªn biáº¿n/default khÃ´ng nháº¡y cáº£m.

### 13.2 Staging/production

- Æ¯u tiÃªn frontend vÃ  API cÃ¹ng origin qua reverse proxy, Ä‘á»ƒ cookie/CSRF flow nháº¥t quÃ¡n. Storage CORS chá»‰ origin Ä‘Æ°á»£c phÃ©p vÃ  headers/methods cáº§n cho grant.
- Backend image non-root, giá»›i háº¡n temp disk/CPU/timeouts cho audio inspection; worker cÃ³ thá»ƒ cháº¡y cÃ¹ng app vá»›i pool giá»›i háº¡n trÆ°á»›c.
- Bucket riÃªng theo mÃ´i trÆ°á»ng, versioning/private access; identity gá»­i email Ä‘Ãºng public URL; DB backup+object manifest cÃ³ restore drill.
- Feature flags theo capability backend; rollout theo account cohort. CÃ³ dá»¯ liá»‡u phiÃªn má»›i thÃ¬ khÃ´ng triá»ƒn khai frontend cÅ© khÃ´ng hiá»ƒu mode má»›i.
- Rollback báº±ng táº¯t entry/create feature, giá»¯ read/resume/finalize cho resource Ä‘ang cháº¡y. Schema expand giá»¯ compatibility; khÃ´ng rollback báº±ng drop báº£ng dá»¯ liá»‡u ngÆ°á»i há»c.
- Náº¿u pháº£i rollback backend vá» phiÃªn báº£n chá»‰ biáº¿t legacy, trÆ°á»›c tiÃªn drain/abandon flow má»›i cÃ³ kiá»ƒm soÃ¡t vÃ  xÃ¡c minh compatibility; khÃ´ng giáº£ Ä‘á»‹nh additive schema Ä‘á»§ cho old code Ä‘á»c enum má»›i.

### 13.3 Chá»‰ sá»‘ cáº§n nhÃ¬n sau phÃ¡t hÃ nh

| CÃ¢u há»i | Chá»‰ sá»‘ |
|---|---|
| NgÆ°á»i má»›i cÃ³ tháº¥y giÃ¡ trá»‹ khÃ´ng? | Tá»· lá»‡ hoÃ n thÃ nh nÃ³i â†’ feedback â†’ nÃ³i láº¡i trong phiÃªn Ä‘áº§u |
| NgÆ°á»i há»c cÃ³ sá»­a Ä‘Æ°á»£c lá»—i khÃ´ng? | Correct/assessable theo target á»Ÿ context má»›i vÃ  ngÃ y khÃ¡c, kÃ¨m counts |
| Ná»™i dung cÃ¡ nhÃ¢n cÃ³ há»¯u Ã­ch khÃ´ng? | Tá»· lá»‡ source â†’ lÆ°u chunks â†’ hoÃ n thÃ nh bÃ i nÃ³i; láº§n nháº­p nguá»“n thá»© hai |
| Roleplay cÃ³ dÃ¹ng Ä‘Æ°á»£c khÃ´ng? | Session completion, sá»‘ turn, latency vÃ  chá»— bá» dá»Ÿ |
| CÃ³ quay láº¡i khÃ´ng? | NgÃ y há»c vÃ  D7 return, khÃ´ng suy tá»« streak client |
| CÃ³ váº­n hÃ nh Ä‘Æ°á»£c khÃ´ng? | Cost/completed session, provider failures, feedback reports, orphan audio vÃ  budget |

CÃ¡c event analytics tá»‘i thiá»ƒu: content_source_created, chunks_saved, practice_started, recording_uploaded, feedback_viewed, retry_attempt_started, target_evidence_recorded, dialogue_completed, study_completed. Chá»‰ sá»± kiá»‡n hÃ nh vi UI má»›i do client gá»­i; success/duration/evidence canonical láº¥y tá»« backend. Analytics khÃ´ng chá»©a ná»™i dung tÃ i liá»‡u hoáº·c transcript.

## 14. ThÃ´ng tin cáº§n chuáº©n bá»‹ khi báº¯t Ä‘áº§u thá»±c hiá»‡n

Nhá»¯ng má»¥c nÃ y khÃ´ng cháº·n viáº¿t plan vÃ  khÃ´ng yÃªu cáº§u cÃ i plugin:

- TÃ i khoáº£n/key Claude, Deepgram, Resend; domain gá»­i email vÃ  public staging URL.
- AWS account/bucket versioned vÃ  credential scope phÃ¹ há»£p; region Ä‘Æ°á»£c chá»n sau Ä‘o latency.
- NgÃ¢n sÃ¡ch alpha/ngÃ y, retention audio vÃ  ngÆ°á»i nháº­n cáº£nh bÃ¡o váº­n hÃ nh.
- Bá»™ audio/source máº«u Ä‘Æ°á»£c phÃ©p dÃ¹ng; ngÆ°á»i review ná»™i dung tiáº¿ng Anh.
- NÄƒm scenario seed, rubric vÃ  copy tiáº¿ng Viá»‡t, danh sÃ¡ch devices/browsers nghiá»‡m thu.
- Náº¿u khÃ´ng dÃ¹ng nhÃ  cung cáº¥p Ä‘á» xuáº¥t, thay adapter sau khi chá»©ng minh Ä‘Ã¡p á»©ng cÃ¹ng contract; khÃ´ng viáº¿t láº¡i domain chá»‰ Ä‘á»ƒ Ä‘á»•i provider.

## 15. Definition of Done toÃ n bá»™ plan

- [ ] Cáº£5 tÃ­nh nÄƒng cÃ³ luá»“ng frontend/backend hoÃ n chá»‰nh vÃ  dÃ¹ng provider tháº­t á»Ÿ staging.
- [ ] F1/F2 há»c Ä‘Æ°á»£c Ä‘á»™c láº­p; F4 ná»‘i thÃ nh buá»•i nhiá»u bÆ°á»›c; F3 pháº£n á»©ng theo audio tháº­t; F5 dá»±a trÃªn evidence Ä‘Ã£ lÆ°u.
- [ ] KhÃ´ng cÃ²n Ä‘iá»ƒm cá»‘ Ä‘á»‹nh/feedback soáº¡n sáºµn Ä‘Æ°á»£c trÃ¬nh bÃ y nhÆ° cháº¥m tháº­t trong pháº¡m vi Ä‘Ã£ báº­t.
- [ ] Refresh, retry, concurrent tabs vÃ  event replay khÃ´ng táº¡o trÃ¹ng turn/session/chi phÃ­ quota ngÆ°á»i dÃ¹ng/evidence.
- [ ] Provider cost cÃ³ receipt vÃ  unknown-call accounting; khÃ´ng tuyÃªn bá»‘ Ä‘áº£m báº£o provider chá»‰ thu phÃ­ má»™t láº§n khi chÆ°a cÃ³ cÆ¡ cháº¿ Ä‘Ã³.
- [ ] Audio Ä‘Æ°á»£c kiá»ƒm Ä‘á»‹nh/versioned, playback Ä‘Ãºng owner; retention/account deletion/source deletion Ä‘Ã£ thá»­ vá»›i worker Ä‘ang cháº¡y.
- [ ] Contract enum vÃ  legacy flows Ä‘Ã£ test; OpenAPI frontend Ä‘Æ°á»£c generate, khÃ´ng cÃ³ mapper giáº£ Ä‘á»‹nh má»i step lÃ  vocab hoáº·c má»™t speakingSessionId.
- [ ] UI mobile/desktop/light/dark, bÃ n phÃ­m, mic-denied vÃ  audio-unavailable Ä‘Æ°á»£c inspect thá»±c táº¿.
- [ ] Build/unit/integration/E2E/provider smoke/restore checks cÃ³ log báº±ng chá»©ng theo release checklist.
- [ ] Docs PROJECT, backend README, env example, ADR vÃ  capability matrix pháº£n Ã¡nh tráº¡ng thÃ¡i cuá»‘i cÃ¹ng.

Æ¯u tiÃªn báº¯t tay: M0 vÃ  M1, rá»“i hoÃ n táº¥t M3 Ä‘á»ƒ cÃ³ má»™t vÃ²ng chá»¯a lá»—i tháº­t dÃ¹ng Ä‘Æ°á»£c háº±ng ngÃ y. KhÃ´ng cáº§n chá» roleplay, FSRS hoáº·c má»Ÿ rá»™ng video Ä‘á»ƒ kiá»ƒm chá»©ng giÃ¡ trá»‹ nÃ y.
