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
public class OfflineSyncRequest {
    private Long userId;
    private List<SyncItem> pendingRequests;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SyncItem {
        private String clientRequestId; // UUID
        private String type; // "LOGISTICS_REQUEST", "DIAGNOSIS_SAVE"
        private String payload; // JSON payload
        private Long createdAtTimestamp;
    }
}
