package com.agricare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {
    private long totalFarmers;
    private long totalDiagnoses;
    private String topCrop;
    private String topDisease;
    private long totalMarketSearches;
    private long totalStorageRequests;
    private long totalLogisticsRequests;
    private Map<String, Long> requestsByStatus;
    private List<Map<String, Object>> recentDiagnoses;
    private List<Map<String, Object>> recentLogisticsRequests;
}
