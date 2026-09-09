package com.dev.heymimic.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

class ModularArchitectureTest {
  private static final String ROOT = "com.dev.heymimic";

  @Test
  void domainDoesNotDependOnFrameworkOrInfrastructure() {
    var classes = new ClassFileImporter().importPackages(ROOT);
    noClasses()
        .that()
        .resideInAPackage("..domain..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage(
            "org.springframework..", "jakarta.persistence..", "..infrastructure..", "..api..")
        .check(classes);
  }

  @Test
  void controllersDoNotAccessPersistence() {
    var classes = new ClassFileImporter().importPackages(ROOT);
    noClasses()
        .that()
        .resideInAPackage("..api..")
        .should()
        .dependOnClassesThat()
        .resideInAPackage("..infrastructure.persistence..")
        .check(classes);
  }

  @Test
  void studyUsesOnlyPublicContractsOfItsChildModules() {
    var classes = new ClassFileImporter().importPackages(ROOT);
    noClasses()
        .that()
        .resideInAPackage("..study..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage(
            "..vocabulary.api..",
            "..vocabulary.application.port..",
            "..vocabulary.domain..",
            "..vocabulary.infrastructure..",
            "..speaking.api..",
            "..speaking.application.port..",
            "..speaking.domain..",
            "..speaking.infrastructure..")
        .check(classes);
  }

  @Test
  void progressUsesOnlyPublicContractsOfLearningModules() {
    var classes = new ClassFileImporter().importPackages(ROOT);
    noClasses()
        .that()
        .resideInAPackage("..progress..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage(
            "..vocabulary.api..",
            "..vocabulary.application.port..",
            "..vocabulary.domain..",
            "..vocabulary.infrastructure..",
            "..speaking.api..",
            "..speaking.application.port..",
            "..speaking.domain..",
            "..speaking.infrastructure..")
        .check(classes);
  }
}
