package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.ProduceListing;
import com.agricare.service.ProduceMarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produce")
@RequiredArgsConstructor
@Tag(name = "Produce Marketplace", description = "Farmer crop listing and direct market trade APIs")
public class ProduceController {

    private final ProduceMarketplaceService produceService;

    @PostMapping("/listings")
    @Operation(summary = "Create a new produce listing (Farmer)")
    public ResponseEntity<ApiResponse<ProduceListing>> createListing(@RequestBody ProduceListing listing) {
        ProduceListing created = produceService.createListing(listing);
        return ResponseEntity.ok(ApiResponse.ok("Produce listed successfully", created));
    }

    @GetMapping("/listings")
    @Operation(summary = "Get available produce listings with optional filter (Buyer/FPO)")
    public ResponseEntity<ApiResponse<List<ProduceListing>>> getListings(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(ApiResponse.ok(produceService.filterListings(crop, district)));
    }

    @GetMapping("/listings/all")
    @Operation(summary = "Get all produce listings including sold")
    public ResponseEntity<ApiResponse<List<ProduceListing>>> getAllListings() {
        return ResponseEntity.ok(ApiResponse.ok(produceService.getAllListings()));
    }

    @GetMapping("/listings/{id}")
    @Operation(summary = "Get produce listing by ID")
    public ResponseEntity<ApiResponse<ProduceListing>> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(produceService.getListingById(id)));
    }

    @GetMapping("/listings/farmer/{farmerId}")
    @Operation(summary = "Get produce listings by Farmer ID")
    public ResponseEntity<ApiResponse<List<ProduceListing>>> getFarmerListings(@PathVariable Long farmerId) {
        return ResponseEntity.ok(ApiResponse.ok(produceService.getFarmerListings(farmerId)));
    }
}
