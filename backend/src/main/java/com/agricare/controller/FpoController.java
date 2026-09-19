package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.FPO;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.FpoRepository;
import com.agricare.service.BuyerFpoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fpos")
@RequiredArgsConstructor
@Tag(name = "FPOs", description = "Farmer Producer Organizations and collective aggregation centers")
public class FpoController {

    private final BuyerFpoService buyerFpoService;
    private final FpoRepository fpoRepository;

    @GetMapping
    @Operation(summary = "Get FPOs filtered by crop and district")
    public ResponseEntity<ApiResponse<List<FPO>>> getFpos(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(ApiResponse.ok(buyerFpoService.getFpos(crop, district)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get FPO by ID")
    public ResponseEntity<ApiResponse<FPO>> getFpoById(@PathVariable Long id) {
        FPO fpo = fpoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FPO not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(fpo));
    }
}
