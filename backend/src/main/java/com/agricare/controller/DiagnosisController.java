package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.dto.DiagnosisResponse;
import com.agricare.service.DiagnosisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosis")
@RequiredArgsConstructor
@Tag(name = "Crop Diagnosis", description = "AI Image analysis and plant pathology diagnosis APIs")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyze leaf image and return crop disease diagnosis with treatment recommendations")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> analyze(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "cropHint", required = false) String cropHint,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "lang", defaultValue = "te") String lang) {

        DiagnosisResponse response = diagnosisService.analyzeCropImage(image, cropHint, userId, lang);
        return ResponseEntity.ok(ApiResponse.ok("Analysis completed successfully", response));
    }

    @GetMapping("/history/{userId}")
    @Operation(summary = "Get diagnosis history for a farmer")
    public ResponseEntity<ApiResponse<List<DiagnosisResponse>>> getHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "te") String lang) {
        return ResponseEntity.ok(ApiResponse.ok(diagnosisService.getHistory(userId, lang)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get latest diagnosis history")
    public ResponseEntity<ApiResponse<List<DiagnosisResponse>>> getRecentHistory(
            @RequestParam(defaultValue = "te") String lang) {
        return ResponseEntity.ok(ApiResponse.ok(diagnosisService.getHistory(null, lang)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get diagnosis result by ID")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> getById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "te") String lang) {
        return ResponseEntity.ok(ApiResponse.ok(diagnosisService.getById(id, lang)));
    }
}
