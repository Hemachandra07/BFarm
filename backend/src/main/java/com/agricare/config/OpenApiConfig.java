package com.agricare.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bfarmOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BFarm — Smart Crop Care & Direct Market Access API")
                        .description("REST API ecosystem empowering small and marginal farmers: Crop Diagnosis, Treatments, Mandi Rates, Direct Buyers, FPOs, Cold Storages, and Transport Logistics.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("BFarm Agriculture Technology")
                                .url("https://github.com/bfarm")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components().addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
