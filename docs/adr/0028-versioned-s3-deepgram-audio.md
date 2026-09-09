# ADR 0028 — Versioned S3 audio và Deepgram transcription

- **Trạng thái:** Đã chấp nhận cho M1-B02/B03
- **Ngày:** 2026-09-09
- **Phạm vi:** audio provider core slice
- **Liên quan:** M1-F02 recorder/upload recovery, M1-Q01 staging smoke test

## Quyết định

- Staging/production dùng AWS SDK S3 với bucket private, versioning bắt buộc và presigned PUT/GET. Dev/test tiếp tục dùng development fake có source rõ ràng.
- S3 adapter không dùng ETag làm checksum. Khi seal, adapter HEAD đúng object key, lấy version hiện tại, đọc chính version đó, tính SHA-256 và chạy ffprobe bằng argv riêng với timeout.
- MIME được suy ra từ container ffprobe (WebM/Matroska, Ogg/Opus, WAV, MP4/MOV/M4A), sau đó application service so với MIME đã khai báo. Kích thước tối đa 20 MiB và version drift bị từ chối.
- Deepgram adapter chỉ đọc object đã seal qua AudioObjectStorage.read(objectKey, objectVersion), gửi bytes server-side đến prerecorded endpoint và parse transcript trước khi trả SpeakingTranscriptionPort.
- Timeout, 429, 5xx và lỗi kết nối được phân loại theo SpeakingProviderFailure; worker hiện có quyết định retry. Không gửi signed URL hoặc storage credential cho Deepgram.

## Cấu hình

Bật bằng profile staging/prod với AUDIO_STORAGE_PROVIDER=s3 và STT_PROVIDER=deepgram. S3 cần AUDIO_S3_BUCKET, AWS_REGION, IAM role/credential chain và ffprobe trong worker image. Deepgram cần DEEPGRAM_API_KEY và model đã pin. Có thể dùng AUDIO_S3_ENDPOINT/path-style cho local S3-compatible smoke test sau khi xác nhận version semantics.

## Giới hạn còn lại

Cleanup upload bỏ dở/orphan version và browser recorder recovery chưa nằm trong core slice. Chúng cần worker/reconciliation riêng, kiểm thử overwrite sau seal, object mất giữa HEAD/GET, checksum mismatch, codec browser và retention thật trên staging. Không coi test mock AWS hoặc test HTTP Deepgram là provider smoke test.
