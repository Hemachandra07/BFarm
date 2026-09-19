package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.Buyer;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.BuyerRepository;
import com.agricare.service.BuyerFpoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buyers")
@RequiredArgsConstructor
@Tag(name = "Buyers", description = "Verified commercial food buyers and institutional aggregators directory")
public class BuyerController {

    private final BuyerFpoService buyerFpoService;
    private final BuyerRepository buyerRepository;

    @GetMapping
    @Operation(summary = "Get buyers filtered by crop and district")
    public ResponseEntity<ApiResponse<List<Buyer>>> getBuyers(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(ApiResponse.ok(buyerFpoService.getBuyers(crop, district)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get buyer by ID")
    public ResponseEntity<ApiResponse<Buyer>> getBuyerById(@PathVariable Long id) {
        Buyer buyer = buyerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(buyer));
    }
}
