package com.dev.heymimic.speaking.application.publicapi;

import java.util.List;

public record SpeakingTopicContentView(
    String contextDescription,
    String starterSentence,
    List<String> outline,
    List<SpeakingKeyVocabularyView> keyVocabulary,
    String modelAnswer) {}
