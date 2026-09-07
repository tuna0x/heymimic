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
}
