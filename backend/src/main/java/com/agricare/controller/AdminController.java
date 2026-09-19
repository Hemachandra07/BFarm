package com.agricare.controller;

import com.agricare.dto.AdminStatsDto;
import com.agricare.dto.ApiResponse;
import com.agricare.entity.LogisticsRequest;
import com.agricare.service.AdminService;
import com.agricare.service.DataInitializerService;
import com.agricare.service.LogisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Backoffice management, operational KPIs, and data administration")
public class AdminController {

    private final AdminService adminService;
    private final LogisticsService logisticsService;
    private final DataInitializerService dataInitializerService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard overview and operational statistics")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get all logistics transportation requests across all farmers")
    public ResponseEntity<ApiResponse<List<LogisticsRequest>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.ok(logisticsService.getAllRequests()));
    }

    @PatchMapping("/requests/{id}/status")
    @Operation(summary = "Update status of a logistics request (PENDING, CONFIRMED, IN_TRANSIT, COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<LogisticsRequest>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        LogisticsRequest.Status status = LogisticsRequest.Status.valueOf(statusStr.toUpperCase());
        LogisticsRequest updated = logisticsService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Status updated successfully to " + status.name(), updated));
    }

    @PostMapping("/reseed")
    @Operation(summary = "Reset or initialize seed demo data")
    public ResponseEntity<ApiResponse<String>> reseed() {
        dataInitializerService.run();
        return ResponseEntity.ok(ApiResponse.ok("Demo data checked/re-seeded successfully", "OK"));
    }
}
