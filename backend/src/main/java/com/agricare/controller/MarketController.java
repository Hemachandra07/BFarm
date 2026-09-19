package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.dto.MarketComparisonDto;
import com.agricare.entity.MarketPrice;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.MarketPriceRepository;
import com.agricare.service.MarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@Tag(name = "Market Prices", description = "Agricultural APMC mandi rates and market opportunity comparison APIs")
public class MarketController {

    private final MarketService marketService;
    private final MarketPriceRepository marketPriceRepository;

    @GetMapping("/prices")
    @Operation(summary = "Get mandi prices filtered by crop and location")
    public ResponseEntity<ApiResponse<List<MarketPrice>>> getPrices(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(ApiResponse.ok(marketService.getPrices(crop, location)));
    }

    @GetMapping("/prices/{id}")
    @Operation(summary = "Get specific market price by ID")
    public ResponseEntity<ApiResponse<MarketPrice>> getPriceById(@PathVariable Long id) {
        MarketPrice price = marketPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Market price record not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(price));
    }

    @GetMapping("/compare")
    @Operation(summary = "Compare selling options between local APMC mandi, direct food buyers, and FPOs")
    public ResponseEntity<ApiResponse<MarketComparisonDto>> compareOptions(
            @RequestParam(defaultValue = "Tomato") String crop,
            @RequestParam(defaultValue = "500") Double quantityKg) {
        return ResponseEntity.ok(ApiResponse.ok(marketService.compareOptions(crop, quantityKg)));
    }

    @PostMapping("/prices")
    @Operation(summary = "Add or update a market price record (Admin)")
    public ResponseEntity<ApiResponse<MarketPrice>> addMarketPrice(@RequestBody MarketPrice marketPrice) {
        if (marketPrice.getDate() == null) {
            marketPrice.setDate(java.time.LocalDate.now());
        }
        if (marketPrice.getUnit() == null || marketPrice.getUnit().isBlank()) {
            marketPrice.setUnit("quintal");
        }
        if (marketPrice.getState() == null || marketPrice.getState().isBlank()) {
            marketPrice.setState("Andhra Pradesh");
        }
        if (marketPrice.getTrend() == null || marketPrice.getTrend().isBlank()) {
            marketPrice.setTrend("UP");
        }
        if (marketPrice.getSource() == null || marketPrice.getSource().isBlank()) {
            marketPrice.setSource("Admin Official Update");
        }
        MarketPrice saved = marketPriceRepository.save(marketPrice);
        return ResponseEntity.ok(ApiResponse.ok("Market price added successfully", saved));
    }

    @DeleteMapping("/prices/{id}")
    @Operation(summary = "Delete a market price record (Admin)")
    public ResponseEntity<ApiResponse<String>> deleteMarketPrice(@PathVariable Long id) {
        marketPriceRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Market price deleted successfully", "DELETED"));
    }
}
