alter table platform_provider_budget_reservations
    add column input_token_micros_per_million bigint,
    add column output_token_micros_per_million bigint,
    add column audio_micros_per_minute bigint,
    add column character_micros_per_thousand bigint;

alter table platform_provider_budget_reservations
    add constraint ck_provider_budget_rate_snapshot_non_negative
    check (
      (input_token_micros_per_million is null or input_token_micros_per_million >= 0)
      and (output_token_micros_per_million is null or output_token_micros_per_million >= 0)
      and (audio_micros_per_minute is null or audio_micros_per_minute >= 0)
      and (character_micros_per_thousand is null or character_micros_per_thousand >= 0)
    );