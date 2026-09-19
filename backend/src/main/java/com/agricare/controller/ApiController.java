package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "API Root", description = "Root API health and status check")
public class ApiController {

    @GetMapping({"", "/"})
    @Operation(summary = "Root API status endpoint")
    public ResponseEntity<ApiResponse<Map<String, String>>> getApiStatus() {
        Map<String, String> statusInfo = Map.of(
            "status", "ONLINE",
            "service", "BFarm Backend API Service",
            "version", "1.0.0",
            "documentation", "/swagger-ui.html"
        );
        return ResponseEntity.ok(ApiResponse.ok("BFarm API is online and operational", statusInfo));
    }
}
