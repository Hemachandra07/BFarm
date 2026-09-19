package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.Crop;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.CropRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crops")
@RequiredArgsConstructor
@Tag(name = "Crops", description = "Crop catalog and reference APIs")
public class CropController {

    private final CropRepository cropRepository;

    @GetMapping
    @Operation(summary = "Get all supported agricultural crops")
    public ResponseEntity<ApiResponse<List<Crop>>> getAllCrops() {
        return ResponseEntity.ok(ApiResponse.ok(cropRepository.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get crop by ID")
    public ResponseEntity<ApiResponse<Crop>> getCropById(@PathVariable Long id) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(crop));
    }
}
