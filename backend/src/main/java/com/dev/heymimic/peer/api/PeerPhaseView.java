package com.dev.heymimic.peer.api;

import java.util.List;

public record PeerPhaseView(
    String phase,
    String title,
    int durationSeconds,
    String promptEn,
    String promptVi,
    List<String> hints) {}
