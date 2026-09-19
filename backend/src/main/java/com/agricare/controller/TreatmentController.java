package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.Treatment;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.TreatmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
@Tag(name = "Treatments", description = "Multilingual agricultural treatment and remedies APIs")
public class TreatmentController {

    private final TreatmentRepository treatmentRepository;

    @GetMapping("/{diseaseId}")
    @Operation(summary = "Get treatment advice for disease, supporting Telugu ('te'), Hindi ('hi'), and English ('en')")
    public ResponseEntity<ApiResponse<Treatment>> getTreatment(
            @PathVariable Long diseaseId,
            @RequestParam(defaultValue = "te") String lang) {

        Treatment treatment = treatmentRepository.findByDiseaseIdAndLanguage(diseaseId, lang)
                .orElseGet(() -> treatmentRepository.findByDiseaseIdAndLanguage(diseaseId, "en")
                        .orElseThrow(() -> new ResourceNotFoundException("No treatment found for disease ID: " + diseaseId)));

        return ResponseEntity.ok(ApiResponse.ok(treatment));
    }

    @GetMapping("/all/{diseaseId}")
    @Operation(summary = "Get all language variants for disease treatment")
    public ResponseEntity<ApiResponse<List<Treatment>>> getAllVariants(@PathVariable Long diseaseId) {
        return ResponseEntity.ok(ApiResponse.ok(treatmentRepository.findByDiseaseId(diseaseId)));
    }
}
