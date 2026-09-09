# ADR 0029 â€” Provider usage receipts cho AI/STT

- **Tráº¡ng thÃ¡i:** ÄÃ£ cháº¥p nháº­n cho M1-B04 usage receipt slice
- **NgÃ y:** 2026-09-09
- **Pháº¡m vi:** ghi nháº­n call provider tá»« worker
- **LiÃªn quan:** M1-B04 global budget reserve/reconcile, M1-Q01 provider smoke

## Bá»‘i cáº£nh

Quota há»c cá»§a ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Æ°á»£c reserve/consume/release theo resource. Chi phÃ­ provider láº¡i cáº§n má»™t dáº¥u váº¿t Ä‘á»™c láº­p: má»™t láº§n gá»i cÃ³ thá»ƒ timeout sau khi provider Ä‘Ã£ xá»­ lÃ½, retry khÃ´ng Ä‘Æ°á»£c lÃ m máº¥t call trÆ°á»›c hoáº·c gá»™p hai execution attempt thÃ nh má»™t báº£n ghi.

## Quyáº¿t Ä‘á»‹nh

- LÆ°u má»—i provider call vÃ o báº£ng platform_provider_usage vá»›i operation/resource/user, stage, execution attempt, provider/model, request id, token/audio metrics, status vÃ  error code.
- KhÃ³a idempotency lÃ  (operation_id, stage, execution_attempt). Recorder dÃ¹ng ON CONFLICT DO UPDATE Ä‘á»ƒ worker retry ghi láº¡i cÃ¹ng attempt mÃ  khÃ´ng táº¡o báº£n sao.
- Worker Speaking ghi stage STT vÃ  FEEDBACK; worker Context Analysis ghi stage EXTRACTION.
- Káº¿t quáº£ thÃ nh cÃ´ng ghi SUCCEEDED cÃ¹ng metadata provider tráº£ vá». Timeout, máº¥t káº¿t ná»‘i hoáº·c lá»—i trÆ°á»›c khi biáº¿t káº¿t quáº£ ghi UNKNOWN; receipt khÃ´ng tá»± giáº£i phÃ³ng hay consume user quota.
- Anthropic parser giá»¯ request id, input tokens vÃ  output tokens. Deepgram parser giá»¯ request id vÃ  duration audio khi response cÃ³ metadata. Náº¿u provider khÃ´ng tráº£ metadata, cÃ¡c trÆ°á»ng usage Ä‘á»ƒ null thay vÃ¬ Æ°á»›c lÆ°á»£ng.
- Recorder failure khÃ´ng lÃ m máº¥t káº¿t quáº£ há»c hoáº·c biáº¿n call thÃ nh retry má»›i; lá»—i Ä‘Æ°á»£c log cÃ³ operation/stage Ä‘á»ƒ reconciliation sau.

## Giá»›i háº¡n vÃ  bÆ°á»›c tiáº¿p theo

Receipt hiá»‡n chÆ°a tÃ­nh tiá»n theo rate card vÃ  chÆ°a reserve global budget trÆ°á»›c khi báº¯t Ä‘áº§u job. M1-B04 tiáº¿p theo cáº§n thÃªm budget reservation/reconcile vá»›i policy, rate-card version vÃ  tráº¡ng thÃ¡i UNKNOWN; khÃ´ng dÃ¹ng sá»‘ tiá»n giáº£ Ä‘á»ƒ cháº·n luá»“ng hiá»‡n táº¡i. M1-Q01 váº«n pháº£i smoke test vá»›i provider tháº­t vÃ  kiá»ƒm tra request-id/usage payload thá»±c táº¿.
## Cáº­p nháº­t sau khi cháº¥p nháº­n ADR 0030

Global budget reservation/reconcile Ä‘Ã£ Ä‘Æ°á»£c triá»ƒn khai trong `platform_provider_budget_reservations`; ADR 0029 váº«n giá»¯ pháº¡m vi receipt, cÃ²n rate-card/cap vÃ  policy giá»¯ reservation khi UNKNOWN Ä‘Æ°á»£c mÃ´ táº£ á»Ÿ ADR 0030.
