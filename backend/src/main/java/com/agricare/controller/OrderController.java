package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.ProduceOrder;
import com.agricare.service.ProduceMarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Produce Orders & Negotiations", description = "Order creation, offer negotiation, acceptance, and delivery status APIs")
public class OrderController {

    private final ProduceMarketplaceService produceService;

    @PostMapping("/offer")
    @Operation(summary = "Submit a purchase offer for farmer produce (Buyer/FPO)")
    public ResponseEntity<ApiResponse<ProduceOrder>> submitOffer(@RequestBody ProduceOrder order) {
        ProduceOrder created = produceService.submitPurchaseOffer(order);
        return ResponseEntity.ok(ApiResponse.ok("Offer submitted successfully", created));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept a purchase offer (Farmer)")
    public ResponseEntity<ApiResponse<ProduceOrder>> acceptOffer(@PathVariable Long id) {
        ProduceOrder accepted = produceService.acceptOffer(id);
        return ResponseEntity.ok(ApiResponse.ok("Offer accepted successfully", accepted));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a purchase offer (Farmer)")
    public ResponseEntity<ApiResponse<ProduceOrder>> rejectOffer(@PathVariable Long id) {
        ProduceOrder rejected = produceService.rejectOffer(id);
        return ResponseEntity.ok(ApiResponse.ok("Offer rejected", rejected));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status (LOGISTICS_BOOKED, IN_TRANSIT, DELIVERED)")
    public ResponseEntity<ApiResponse<ProduceOrder>> updateStatus(
            @PathVariable Long id,
            @RequestParam ProduceOrder.Status status,
            @RequestParam(required = false) String logisticsRef) {
        ProduceOrder updated = produceService.updateOrderStatus(id, status, logisticsRef);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", updated));
    }

    @GetMapping("/farmer/{farmerId}")
    @Operation(summary = "Get all orders/offers for a farmer")
    public ResponseEntity<ApiResponse<List<ProduceOrder>>> getFarmerOrders(@PathVariable Long farmerId) {
        return ResponseEntity.ok(ApiResponse.ok(produceService.getFarmerOrders(farmerId)));
    }

    @GetMapping("/buyer/{buyerId}")
    @Operation(summary = "Get all orders/offers made by a buyer/FPO")
    public ResponseEntity<ApiResponse<List<ProduceOrder>>> getBuyerOrders(@PathVariable Long buyerId) {
        return ResponseEntity.ok(ApiResponse.ok(produceService.getBuyerOrders(buyerId)));
    }

    @GetMapping
    @Operation(summary = "Get all orders in system")
    public ResponseEntity<ApiResponse<List<ProduceOrder>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(produceService.getAllOrders()));
    }
}
