package com.agricare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsRequestDto {
    private Long farmerId;
    private Long providerId;
    private String providerName;

    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotBlank(message = "Crop is required")
    private String crop;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Double quantity; // in kg

    private Double estimatedCost;
    private String farmerPhone;
    private String notes;
    private String clientRequestId; // For offline sync reconciliation
}
