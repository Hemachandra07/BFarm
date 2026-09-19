package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.ColdStorage;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.ColdStorageRepository;
import com.agricare.service.ColdStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@Tag(name = "Cold Storage", description = "Temperature-controlled warehousing and cold storage facility directory")
public class StorageController {

    private final ColdStorageService coldStorageService;
    private final ColdStorageRepository coldStorageRepository;

    @GetMapping
    @Operation(summary = "Get cold storages filtered by crop and district")
    public ResponseEntity<ApiResponse<List<ColdStorage>>> getColdStorages(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(ApiResponse.ok(coldStorageService.getColdStorages(crop, district)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get cold storage facility details by ID")
    public ResponseEntity<ApiResponse<ColdStorage>> getStorageById(@PathVariable Long id) {
        ColdStorage storage = coldStorageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cold storage facility not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(storage));
    }
}
