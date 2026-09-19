package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.Disease;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.DiseaseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diseases")
@RequiredArgsConstructor
@Tag(name = "Diseases", description = "Plant pathology disease catalog APIs")
public class DiseaseController {

    private final DiseaseRepository diseaseRepository;

    @GetMapping
    @Operation(summary = "Get all diseases, optionally filtered by crop")
    public ResponseEntity<ApiResponse<List<Disease>>> getDiseases(@RequestParam(required = false) String crop) {
        List<Disease> list = (crop != null && !crop.isBlank())
                ? diseaseRepository.findByCropIgnoreCase(crop)
                : diseaseRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get disease by ID")
    public ResponseEntity<ApiResponse<Disease>> getDiseaseById(@PathVariable Long id) {
        Disease disease = diseaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(disease));
    }
}
