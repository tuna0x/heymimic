package com.dev.heymimic.architecture.fixture.api;

import com.dev.heymimic.architecture.fixture.domain.SampleDomain;

public final class SampleApi {
  private SampleApi() {}

  public static SampleDomain sample() {
    return new SampleDomain("sample");
  }
}
