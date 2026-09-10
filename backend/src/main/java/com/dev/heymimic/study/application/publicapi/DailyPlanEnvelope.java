package com.dev.heymimic.study.application.publicapi;

public record DailyPlanEnvelope(DailyPlanView plan, String refreshStatus, int retryAfterSeconds) {}
