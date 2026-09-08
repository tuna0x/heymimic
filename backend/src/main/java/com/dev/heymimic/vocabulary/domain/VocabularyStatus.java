package com.dev.heymimic.vocabulary.domain;

import java.util.Locale;

public enum VocabularyStatus {
  NEW,
  REVIEWING,
  MASTERED;

  public String apiValue() {
    return name().toLowerCase(Locale.ROOT);
  }
}
