package com.agricare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketComparisonDto {
    private String crop;
    private Double quantityKg;
    private List<SellingOption> options;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellingOption {
        private String channelType; // "Mandi / APMC", "Direct Buyer", "FPO Procurement"
        private String entityName; // e.g. "Guntur APMC Market", "ABC Foods", "Guntur Vegetable FPO"
        private Double pricePerQuintal;
        private Double estimatedTotalRevenue;
        private String location;
        private String notes;
        private Boolean verified;
        private String contactPhone;
    }
}
