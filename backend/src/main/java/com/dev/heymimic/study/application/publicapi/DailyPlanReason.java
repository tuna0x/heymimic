package com.dev.heymimic.study.application.publicapi;

import java.util.List;
import java.util.Map;

public record DailyPlanReason(String code, Map<String, Object> params, List<String> evidenceRefs) {}
