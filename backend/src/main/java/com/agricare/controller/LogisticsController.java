package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.dto.LogisticsRequestDto;
import com.agricare.entity.LogisticsProvider;
import com.agricare.entity.LogisticsRequest;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.LogisticsProviderRepository;
import com.agricare.service.LogisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics")
@RequiredArgsConstructor
@Tag(name = "Logistics & Transport", description = "Farm-to-market and cold storage transportation booking APIs")
public class LogisticsController {

    private final LogisticsService logisticsService;
    private final LogisticsProviderRepository providerRepository;

    @GetMapping
    @Operation(summary = "Get logistics and transport providers")
    public ResponseEntity<ApiResponse<List<LogisticsProvider>>> getProviders(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String vehicleType) {
        return ResponseEntity.ok(ApiResponse.ok(logisticsService.getProviders(district, vehicleType)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get logistics provider by ID")
    public ResponseEntity<ApiResponse<LogisticsProvider>> getProviderById(@PathVariable Long id) {
        LogisticsProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logistics provider not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(provider));
    }

    @PostMapping("/request")
    @Operation(summary = "Create a transportation booking request (generates AC-2026-XXXXX reference)")
    public ResponseEntity<ApiResponse<LogisticsRequest>> createRequest(@Valid @RequestBody LogisticsRequestDto dto) {
        LogisticsRequest request = logisticsService.createRequest(dto);
        return ResponseEntity.ok(ApiResponse.ok("Transport request submitted successfully", request));
    }

    @GetMapping("/requests/{farmerId}")
    @Operation(summary = "Get all transport requests submitted by a farmer")
    public ResponseEntity<ApiResponse<List<LogisticsRequest>>> getRequestsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(ApiResponse.ok(logisticsService.getRequestsByFarmer(farmerId)));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get all logistics requests (for Logistics Provider & Admin)")
    public ResponseEntity<ApiResponse<List<LogisticsRequest>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.ok(logisticsService.getAllRequests()));
    }

    @PutMapping("/requests/{id}/status")
    @Operation(summary = "Logistics provider updates shipment status (CONFIRMED, IN_TRANSIT, COMPLETED)")
    public ResponseEntity<ApiResponse<LogisticsRequest>> updateStatus(
            @PathVariable Long id,
            @RequestParam LogisticsRequest.Status status) {
        LogisticsRequest updated = logisticsService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Transport status updated", updated));
    }

    @PutMapping("/providers/{id}/fleet")
    @Operation(summary = "Logistics provider updates vehicle fleet and rate")
    public ResponseEntity<ApiResponse<LogisticsProvider>> updateFleet(
            @PathVariable Long id,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) Double capacity,
            @RequestParam(required = false) Double ratePerKm) {
        LogisticsProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logistics provider not found with ID: " + id));
        if (vehicleType != null && !vehicleType.isBlank()) provider.setVehicleType(vehicleType);
        if (capacity != null) provider.setCapacity(capacity);
        if (ratePerKm != null) provider.setRatePerKm(ratePerKm);
        return ResponseEntity.ok(ApiResponse.ok("Fleet details updated", providerRepository.save(provider)));
    }
}
