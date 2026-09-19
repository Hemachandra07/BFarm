package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.entity.ColdStorage;
import com.agricare.entity.StorageBooking;
import com.agricare.service.StorageBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@Tag(name = "Cold Storage Bookings", description = "Cold storage booking, approval, and warehouse capacity management APIs")
public class StorageBookingController {

    private final StorageBookingService bookingService;

    @PostMapping("/bookings")
    @Operation(summary = "Submit a cold storage reservation booking")
    public ResponseEntity<ApiResponse<StorageBooking>> createBooking(@RequestBody StorageBooking booking) {
        StorageBooking created = bookingService.createBooking(booking);
        return ResponseEntity.ok(ApiResponse.ok("Cold storage booking submitted successfully", created));
    }

    @GetMapping("/bookings/user/{userId}")
    @Operation(summary = "Get bookings submitted by a farmer or buyer")
    public ResponseEntity<ApiResponse<List<StorageBooking>>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getUserBookings(userId)));
    }

    @GetMapping("/bookings/storage/{storageId}")
    @Operation(summary = "Get bookings received by a cold storage facility")
    public ResponseEntity<ApiResponse<List<StorageBooking>>> getStorageBookings(@PathVariable Long storageId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getStorageBookings(storageId)));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all storage bookings across platform")
    public ResponseEntity<ApiResponse<List<StorageBooking>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getAllBookings()));
    }

    @PutMapping("/bookings/{id}/status")
    @Operation(summary = "Accept, reject, or update cold storage booking status")
    public ResponseEntity<ApiResponse<StorageBooking>> updateStatus(
            @PathVariable Long id,
            @RequestParam StorageBooking.Status status) {
        StorageBooking updated = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Booking status updated", updated));
    }

    @PutMapping("/{id}/capacity")
    @Operation(summary = "Update available cold storage capacity in MT")
    public ResponseEntity<ApiResponse<ColdStorage>> updateCapacity(
            @PathVariable Long id,
            @RequestParam Double availableCapacity) {
        ColdStorage updated = bookingService.updateStorageCapacity(id, availableCapacity);
        return ResponseEntity.ok(ApiResponse.ok("Capacity updated", updated));
    }
}
