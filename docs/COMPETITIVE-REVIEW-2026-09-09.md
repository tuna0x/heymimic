# Đánh giá HeyMimic và các hướng học hỏi từ đối thủ

Ngày đánh giá: 09/09/2026. Phạm vi: đọc mã nguồn, tài liệu, kiểm tra frontend và nghiên cứu trang sản phẩm/tài liệu chính thức của đối thủ. Chưa trải nghiệm các gói trả phí, chưa kiểm thử backend với PostgreSQL/provider thật, chưa kiểm tra giao diện trong trình duyệt. Các nhận định về cơ hội và ưu tiên là đề xuất, không phải kết quả đo người dùng.

**Nhận định chính**

HeyMimic có nền domain/backend đáng giữ lại, nhưng phần trải nghiệm học thực tế chưa theo kịp độ rộng tính năng. Ưu tiên nên là hoàn thành vòng lặp: nội dung của người học → cụm từ cần dùng → nói → sửa lỗi → nói lại → ôn trong tình huống mới. Mở rộng đồng thời writing, video, hội thoại và cộng đồng sẽ kéo dài thời gian kiểm chứng giá trị cốt lõi.

Định vị đề xuất: “Luyện tiếng Anh cho tình huống công việc sắp xảy ra, từ nội dung và lỗi của chính bạn.” Ngách thử nghiệm hợp với nội dung hiện tại là người Việt làm công nghệ/sản phẩm, khoảng A2–B2, cần họp, giải thích vấn đề và phỏng vấn. Đây là giả thuyết cần kiểm chứng, không phải kết luận thị trường.

**Hiện trạng đã xác minh trong repo**

| Mảng | Bằng chứng | Đánh giá |
|---|---|---|
| Nền tảng backend | `backend/README.md`, các module identity, learner, vocabulary, speaking, study, progress và platform | Đã có auth, phân quyền sở hữu, xử lý bất đồng bộ, quota, idempotency, event ledger, lifecycle phiên học; vượt xa prototype chỉ có giao diện. |
| Vocab/Speaking/Progress | Các service trong `frontend/src/service/` dùng API và type sinh từ OpenAPI | Có tích hợp API ở các luồng lõi. Chưa đồng nghĩa toàn luồng học chạy được với dịch vụ thật. |
| AI và lưu audio | `DevelopmentSpeakingEvaluationAdapter`, `DevelopmentAudioObjectStorage`, `DeterministicVocabularyExtractionAdapter`, `InMemoryIdentityEmailSender` | Trong source đã kiểm tra chỉ thấy implementation phát triển/mô phỏng cho các adapter này. Storage phát triển trả URL fixture và từ chối xác minh bytes thật. Đây là phụ thuộc phải hoàn thành trước khi dùng luồng nói thực tế. |
| Hội thoại hai chiều | `frontend/src/pages/SpeakingDialogue.tsx:67` | Nút mic gọi `handleSimulateUserTurn`, đợi 1,8 giây rồi mở thêm lượt soạn sẵn. Chưa phải hội thoại phản ứng theo lời nói. |
| Video shadowing | `frontend/src/pages/VideoShadowingLab.tsx:137` | Có thao tác video và ghi âm, nhưng kết quả lưu cố định `score: 93` và câu “Khớp 93% ngữ điệu và nối âm tự nhiên”. Không phải đánh giá âm thanh. |
| Các nhánh mở rộng | `frontend/src/store/slices/createEcosystemSlice.ts` | Listening, dialogue, collocations, writing, peer và video dựa vào mocks/localStorage. Không nên tính chúng như sáu sản phẩm đã hoàn thiện. |
| Sổ tay lỗi | `MistakeDetail.tsx:114`, `progressService.ts` | Đã có lịch sử lỗi từ API và cập nhật trạng thái. Mini-practice tạo lựa chọn từ câu gốc/câu sửa; một đáp án được tạo bằng thay chuỗi `will`/`have`, có thể trùng câu hoặc không tạo lỗi hợp lệ. Chưa có bằng chứng học viên tự dùng đúng trong tình huống mới. |
| Gợi ý học | `backend/src/main/java/com/dev/heymimic/progress/application/ProgressQueryService.java` | Chọn theo quy tắc: từ đến hạn → lỗi đang active → chủ đề cùng level. Hợp lý cho nền ban đầu; chưa phải kế hoạch học thích nghi sâu. |
| Ôn tập | `backend/src/main/java/com/dev/heymimic/vocabulary/domain/SimpleReviewScheduler.java` | Nhớ thì tăng mastery 12 và nhân đôi lịch đến tối đa 30 ngày; quên giảm 8 và về 1 ngày. Đây là heuristic, không phải FSRS hay ước lượng xác suất nhớ. |
| Nội dung quảng bá | `StatsCounterSection.tsx:9`, `landingData.ts`, `ProofAndFaqSection.tsx` | Có số cố định 12.847 phiên, 3.200 học viên và testimonials hiển thị trên landing. Repo không cung cấp bằng chứng nguồn cho các số/lời chứng thực này; cần xác minh hoặc thay bằng demo được ghi rõ. |
| Tài liệu | `docs/PROJECT.md:27` so với backend và service hiện tại | Tài liệu vẫn nói giai đoạn chỉ làm mock/frontend, đã lệch hiện trạng. Cần một bảng trạng thái duy nhất: demo, API có sẵn, provider thật, đã nghiệm thu. |
| Triển khai | `compose.yml` | Compose hiện chỉ chạy PostgreSQL cho local. Chưa phải cấu hình triển khai toàn bộ app. |

Kết quả chạy mới trong lượt đánh giá: frontend 35/35 test qua, TypeScript và Vite production build qua; ESLint 0 lỗi, 119 cảnh báo, gồm import không dùng và kiểu `any`. Không suy rộng kết quả này thành chứng nhận backend hoặc production.

**Đối thủ có gì đáng học**

Các mô tả dưới đây dựa trên tài liệu chính thức đã truy cập. Chúng xác nhận tính năng được công bố, không chứng minh hiệu quả học tập hay mức hài lòng thực tế. “Tích hợp” ở đây chủ yếu là xây trải nghiệm tương tự trên HeyMimic; không giả định đối thủ cung cấp API để nhúng sản phẩm.

| Đối thủ | Tính năng được công bố | Áp dụng cho HeyMimic |
|---|---|---|
| Speak | Bài học Made For You theo mục tiêu/lỗi, Speak Tutor tạo bài học theo yêu cầu, Smart Review. [Nguồn](https://help.speak.com/en/articles/5358417-what-s-the-difference-between-premium-and-premium-plus) | Từ một lỗi vừa mắc, tạo bài luyện ngắn rồi yêu cầu dùng lại trong tình huống khác. Ưu tiên cao nhất sau khi có AI thật. |
| ELSA Speak | Phản hồi phát âm/độ trôi chảy, đánh giá ban đầu, chương trình học cá nhân hóa. [Nguồn](https://elsaspeak.com/en/) | Chỉ rõ từ/âm cần luyện, nghe mẫu, thu lại và so sánh. Đầu tư sau khi kiểm chứng chất lượng chấm từ audio. |
| Praktika | Kế hoạch theo mục tiêu, hỗ trợ bằng tiếng mẹ đẻ, gợi ý câu khi bí, sửa ngữ pháp/phát âm/cách dùng từ, trò chuyện tự do. [Nguồn](https://praktika.ai/) | Nút “Gợi ý cách nói”, giải thích tiếng Việt và cá nhân hóa ngữ cảnh. Avatar có thể để sau. |
| Duolingo | Video Call tạo hội thoại tự phát, thích nghi trình độ; thiết kế cuộc gọi có mục đích, cấu trúc và nhớ thông tin từ các lần trước. [Trải nghiệm](https://blog.duolingo.com/video-call/), [Thiết kế hội thoại](https://blog.duolingo.com/ai-and-video-call/) | Phiên 3–5 phút có mục tiêu, cho nói liền mạch rồi sửa sau; nhớ mục tiêu và buổi luyện trước. |
| Language Reactor | Lưu từ/cụm từ cùng ngữ cảnh; xuất Anki, trong đó có thẻ điền khuyết từ câu gốc. [Nguồn](https://www.languagereactor.com/help/export) | Lưu cả cụm, câu nguồn và vị trí trong nội dung; ôn bằng câu khuyết rồi đưa cụm đó vào bài nói. |
| LingQ | Nhập nội dung quan tâm, đọc/nghe và lưu từ trong lúc học; hỗ trợ nhập qua công cụ chia sẻ trên iOS. [Nguồn](https://www.lingq.com/en/ios-app-support/) | Một luồng đưa tài liệu vào và học ngay; khởi đầu bằng dán văn bản, mở rộng định dạng khi cần. |
| Anki | FSRS dùng lịch sử ôn và mức ghi nhớ mong muốn để lập lịch. [Nguồn](https://docs.ankiweb.net/deck-options.html#fsrs) | Nâng scheduler có version và giữ lịch sử rating; thêm bài gọi lại cụm từ chủ động. Không diễn giải “nhớ flashcard” thành “nói thành thạo”. |
| YouGlish | Tìm cách dùng/phát âm từ hoặc cụm trong clip thật, có lựa chọn biến thể tiếng Anh. [Nguồn](https://youglish.com/index.jsp) | Hướng mở rộng: nhiều ví dụ âm thanh cho cùng một cụm, thay vì chỉ một giọng TTS. MVP dùng nguồn mẫu được phép sử dụng. |

Nhận định trong PROJECT.md rằng các đối thủ không cá nhân hóa sâu theo lỗi cần cập nhật: Speak đã công bố chính khả năng này. Lợi thế có thể đến từ độ liền mạch của vòng học, chất lượng sửa lỗi cho nhóm người Việt cụ thể và bằng chứng tiến bộ. Chưa đủ bằng chứng để tuyên bố đây là tính năng độc quyền trên thị trường.

**Thứ tự triển khai đề xuất**

Ước lượng dưới đây là ngày kỹ thuật cho một người quen codebase, gồm triển khai và kiểm tra tính năng; không bao gồm thời gian chờ tài khoản dịch vụ, xây tập dữ liệu đánh giá lớn hoặc vận hành production. Các khoảng không phải cam kết lịch phát hành; phụ thuộc phải được nghiệm thu trước.

| Ưu tiên | Hạng mục | Phạm vi tối thiểu | Công sức ước lượng | Điều kiện nghiệm thu |
|---|---|---|---|---|
| P0 | Hoàn thành luồng lõi thật | Email xác minh, object storage, STT, phản hồi ngôn ngữ, extraction thật; giữ quota/retry hiện có | 8–15 ngày | Tài khoản mới thực hiện được dán nội dung → lưu từ → ghi âm → feedback → mở lại lịch sử; lỗi provider và retry không nhân bản kết quả. |
| P0 | Trung thực trạng thái sản phẩm | Điểm chưa đo không hiển thị như kết quả thật; xác minh social proof; cập nhật bảng trạng thái tính năng | 1–3 ngày | Người dùng phân biệt được demo và tính năng dùng được; số liệu quảng bá có nguồn. |
| P1 | “Sửa lỗi này trong 2 phút” | Chọn 1–2 lỗi, giải thích ngắn, câu mẫu, nói lại, bài chuyển ngữ cảnh, hẹn kiểm tra lại | 5–8 ngày sau P0 | Mỗi bài liên kết occurrence gốc; lưu attempt mới; chỉ ghi tiến bộ khi có bằng chứng trả lời. |
| P1 | Nội dung thành bài luyện | Dán email/đoạn bài viết → chọn 3–5 chunks → ôn → bài nói dùng chúng | 5–8 ngày sau P0 | Giữ nguồn/câu gốc; phân biệt ví dụ trích nguồn và ví dụ AI tạo; xem được cụm đã dùng đúng trong bài nói. |
| P1 | Roleplay công sở thật | 5–10 tình huống, 3–5 phút, audio theo lượt, gợi ý khi bí, nhận xét cuối phiên | 8–15 ngày sau P0 | Câu hỏi tiếp theo phụ thuộc câu trả lời; lưu lượt; khôi phục phiên; chấm hoàn thành mục tiêu ngoài ngữ pháp. |
| P2 | Ôn tập thích nghi | FSRS, log rating tương thích, scheduler version; giữ snapshot để undo | 4–7 ngày | Có kiểm tra chuyển lịch cũ, undo và khả năng tính lại; chỉ tối ưu cá nhân khi đủ lịch sử. |
| P2 | Shadowing có chấm thật | Nguồn âm thanh và transcript theo đoạn, thu lại, đánh giá, nghe A/B | 10–20 ngày | Chấm dựa trên audio; có đánh giá mẫu bởi người; tín hiệu kém thì yêu cầu thu lại hoặc không chấm. |
| P2 | Bằng chứng tiến bộ theo tuần | Bài kiểm tra tương đương, tỷ lệ tái mắc lỗi, dùng cụm trong ngữ cảnh mới | 3–6 ngày cho bản đầu sau P1 | So sánh có mẫu số/số lượt; không dùng tổng phút hoặc điểm AI đơn lẻ để tuyên bố lên CEFR. |

**Thiết kế ba hạng mục nên làm trước**

1. Bài chữa lỗi: “I am agree” được lưu thành occurrence. Người học xem giải thích, tự trả lời một câu khác cần dùng “agree”, rồi gặp lại mục tiêu này trong roleplay ngày sau. Mini-practice hiện tại có thể giữ làm bước nhận diện; cần bổ sung bước tự nói và kiểm tra lại. Một lần bấm đúng không đủ chứng minh đã sửa thói quen.
2. Nội dung thành bài luyện: trước cuộc họp, người học dán đoạn mô tả bug. App chọn “reproduce the issue”, “narrow down the cause”, “roll back the release”; cho nghe/ôn rồi yêu cầu giải thích sự cố. Feedback đánh giá dùng cụm có đúng ý không, tránh chỉ kiểm tra chuỗi từ xuất hiện.
3. Roleplay: AI đóng vai PM hỏi tiến độ. Người học cần nêu blocker, đề xuất deadline và xác nhận bước tiếp theo. Có chế độ “luyện có hướng dẫn” với gợi ý, và “mô phỏng thực tế” nhận xét cuối phiên. Chưa cần làm ngắt lời thời gian thực hay avatar để kiểm chứng trải nghiệm này.

Ba hạng mục trên nên nối vào Study hiện có để người học nhận một bài hôm nay với lý do cụ thể, chẳng hạn “Ôn 3 cụm từ cho cuộc họp và luyện lại lỗi quá khứ đơn”, thay vì tự chọn giữa nhiều khu vực độc lập.

**Tận dụng kiến trúc hiện tại**

- Giữ modular monolith, PostgreSQL queue/outbox, quota và contract OpenAPI. Chưa có bằng chứng tải thực tế đòi tách microservices hay thêm hệ điều phối nhiều agent.
- Dùng các port hiện có cho STT, feedback, extraction và storage. `SpeakingFeedbackRequest` hiện chỉ có transcript, prompt snapshot và duration; muốn nhận xét âm/nhịp cụ thể cần mở đường nhận audio hoặc kết quả phân tích âm thanh có bằng chứng.
- Có thể thử dịch vụ đánh giá phát âm riêng; Speechace công bố API chấm phát âm/độ trôi chảy. Cần kiểm tra tài liệu, giá và đánh giá mẫu tiếng Anh của người Việt trước khi chọn. Đây là ví dụ dịch vụ có thể tích hợp, khác với việc giả định có thể gọi API của ELSA. [Nguồn](https://www.speechace.com/announcing-the-speechace-api-v9-0/)
- Thêm liên kết dữ liệu giữa content source/segment → vocabulary/chunk → speaking attempt → feedback occurrence → remediation attempt. Lưu phiên bản rubric/model và quan hệ nguồn để truy vết feedback.
- Study hiện hỗ trợ vocabulary và speaking; khi thêm remediation/dialogue phải mở rộng contract và lifecycle có chủ đích. Progress cần consumer cho sự kiện hoàn thành mới và tiếp tục chống ghi trùng.
- Với roleplay, tách thời gian tạo câu trả lời khỏi việc phân tích toàn phiên: phản hồi theo lượt cần nhanh; chấm chi tiết có thể dùng queue sau khi kết thúc.

**Các việc nên hoãn**

- Peer matching/video call cộng đồng: thêm nhu cầu đủ người cùng lúc và vận hành kết nối; chưa giúp founder tự học tốt hơn ngay.
- Avatar 3D, nhiều nhân vật, phần thưởng phức tạp: chưa giải quyết điểm nghẽn phản hồi thật và luyện lại.
- Writing editor tổng quát: chỉ làm phần liên quan nội dung chuẩn bị nói hoặc bài công sở đã chọn trước.
- Thư viện video lớn/extension nhiều nền tảng: bắt đầu với dán văn bản và tập clip nhỏ có quyền sử dụng; chỉ đầu tư importer khi người dùng thực sự đưa nội dung vào thường xuyên.

**Cách kiểm chứng giá trị**

Sau P0, founder học thật hằng ngày rồi mời 5–10 người cùng nhu cầu dùng thử trong hai tuần. Cỡ mẫu này để tìm vấn đề và tín hiệu nhu cầu, chưa đủ kết luận hiệu quả thống kê.

- Activation: tỷ lệ người mới hoàn thành lần nói → đọc feedback → nói lại trong phiên đầu.
- Giá trị học: số lần hoàn thành vòng sửa lỗi; tỷ lệ tái mắc trên số cơ hội dùng cấu trúc; tỷ lệ dùng đúng cụm ở đề mới sau 7 ngày.
- Thói quen: số ngày học và tỷ lệ quay lại ngày 7, kèm lý do bỏ dở.
- Chất lượng vận hành: thời gian phản hồi p50/p95, tỷ lệ đánh giá thất bại, chi phí mỗi phiên hoàn thành, phản hồi bị người học báo sai.
- Kiểm chứng ngách: hỏi người học bài tập có giúp họ xử lý một cuộc họp/phỏng vấn cụ thể hay không; quan sát họ có tự mang nội dung lần hai vào app không.

Trình tự ra quyết định: làm một vòng học thật đáng dùng mỗi ngày → bổ sung chữa lỗi và tái sử dụng chunks → roleplay → dựa trên sử dụng thực tế để quyết định FSRS, shadowing và mở rộng tiếp.
