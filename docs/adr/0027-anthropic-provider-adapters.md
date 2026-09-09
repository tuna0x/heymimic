# ADR 0027 — Claude provider adapters cho extraction và speaking feedback

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-09-09
- **Phạm vi:** M1-B03 client slice
- **Liên quan:** M1-B02 (S3/STT audio), M1-Q01 (provider smoke test)

## Bối cảnh

Luồng context analysis và speaking evaluation đã có queue, checkpoint, quota và port ứng dụng nhưng dev/test chỉ dùng deterministic adapter. Cần nối provider ngôn ngữ thật mà không đưa API key lên frontend, không để model tự quyết định trạng thái nghiệp vụ và không biến lỗi provider thành retry vô hạn.

## Quyết định

Dùng Claude Messages API qua một client hạ tầng dùng chung:

- AnthropicMessageClient gọi POST /v1/messages bằng Spring RestClient.
- Header x-api-key và anthropic-version chỉ được gắn ở backend.
- Cấu hình nằm dưới heymimic.ai; chỉ profile staging/prod và AI_PROVIDER=anthropic mới tạo bean thật.
- ClaudeVocabularyExtractionAdapter và ClaudeSpeakingFeedbackAdapter gửi system prompt riêng, yêu cầu JSON không có markdown, sau đó parse và giới hạn kích thước trước khi trả về application port.
- Service hiện có vẫn là authority cuối cùng cho quota, source, score, category, độ dài và việc ghi persistence.
- fake adapter giữ nguyên cho dev/test và luôn trả source=fake; adapter Claude trả source=provider.

Output speaking giữ các category đã tồn tại (GRAMMAR, VOCABULARY, EXPRESSION) và metadata provider/model/promptVersion/rubricVersion. Output vocabulary giữ word, meaning cùng các field tùy chọn của ExtractedVocabularySuggestion.

## Phân loại lỗi

Client dùng các failure ổn định:

- timeout/5xx hoặc lỗi kết nối: retryable;
- HTTP 429: retryable, mã rate limit riêng;
- 401/403: terminal authentication failure;
- 4xx còn lại, response không có text block hoặc JSON không hợp lệ: terminal rejected/invalid response.

Speaking chuyển failure sang SpeakingProviderException để SpeakingEvaluationJobHandler tạo mã theo stage. Vocabulary ném RetryableJobException hoặc NonRetryableJobException để worker dùng backoff hiện có. Không ghi transcript, prompt, response model hay API key vào log từ adapter.

## Kiểm thử và giới hạn

Test dùng HttpServer cục bộ để kiểm tra payload, model, max_tokens, header auth, mapping output và 429/5xx. Chưa chạy smoke test với tài khoản Claude thật vì môi trường chưa có ANTHROPIC_API_KEY; M1-Q01 vẫn phải kiểm chứng chi phí, timeout, model đã pin và nội dung prompt trên staging.

STT và audio storage chưa nằm trong quyết định này. SpeakingTranscriptionPort hiện vẫn cần mở rộng read/versioned audio contract trước khi thêm Deepgram.
