package com.dev.heymimic.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {
  private static final String BEARER_AUTH = "bearerAuth";

  @Bean
  OpenAPI heymimicOpenApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("HeyMimic API")
                .version("v1")
                .description("HTTP contract for the HeyMimic modular monolith."))
        .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
        .components(
            new Components()
                .addSecuritySchemes(
                    BEARER_AUTH,
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
  }
}
