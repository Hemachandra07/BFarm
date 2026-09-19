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
public class OfflineSyncResponse {
    private boolean success;
    private int itemsSynced;
    private List<SyncResultItem> results;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SyncResultItem {
        private String clientRequestId;
        private String serverReferenceNumber;
        private String status; // "SYNCED", "SKIPPED_DUPLICATE", "FAILED"
        private String message;
    }
}
