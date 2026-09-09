package com.dev.heymimic.platform.application.publicapi;

import java.util.Map;

public interface QuotaLimits {
  Map<String, Integer> dailyLimits();
}
