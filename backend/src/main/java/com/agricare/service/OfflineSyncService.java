package com.agricare.service;

import com.agricare.dto.LogisticsRequestDto;
import com.agricare.dto.OfflineSyncRequest;
import com.agricare.dto.OfflineSyncResponse;
import com.agricare.entity.LogisticsRequest;
import com.agricare.entity.OfflineSyncLog;
import com.agricare.repository.OfflineSyncLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfflineSyncService {

    private final OfflineSyncLogRepository syncLogRepository;
    private final LogisticsService logisticsService;
    private final ObjectMapper objectMapper;

    @Transactional
    public OfflineSyncResponse processBatch(OfflineSyncRequest request) {
        if (request == null || request.getPendingRequests() == null || request.getPendingRequests().isEmpty()) {
            return OfflineSyncResponse.builder()
                    .success(true)
                    .itemsSynced(0)
                    .results(new ArrayList<>())
                    .build();
        }

        List<OfflineSyncResponse.SyncResultItem> results = new ArrayList<>();
        int successCount = 0;

        for (OfflineSyncRequest.SyncItem item : request.getPendingRequests()) {
            // Check for idempotency to prevent duplicate operations
            if (item.getClientRequestId() != null && syncLogRepository.existsByClientRequestId(item.getClientRequestId())) {
                results.add(OfflineSyncResponse.SyncResultItem.builder()
                        .clientRequestId(item.getClientRequestId())
                        .status("SKIPPED_DUPLICATE")
                        .message("Request already synchronized previously")
                        .build());
                continue;
            }

            try {
                String serverRef = null;

                if ("LOGISTICS_REQUEST".equalsIgnoreCase(item.getType())) {
                    LogisticsRequestDto dto = objectMapper.readValue(item.getPayload(), LogisticsRequestDto.class);
                    if (dto.getFarmerId() == null && request.getUserId() != null) {
                        dto.setFarmerId(request.getUserId());
                    }
                    LogisticsRequest created = logisticsService.createRequest(dto);
                    serverRef = created.getReferenceNumber();
                }

                // Log sync status
                OfflineSyncLog logEntry = OfflineSyncLog.builder()
                        .userId(request.getUserId())
                        .clientRequestId(item.getClientRequestId() != null ? item.getClientRequestId() : java.util.UUID.randomUUID().toString())
                        .requestType(item.getType())
                        .payload(item.getPayload())
                        .syncStatus("SUCCESS")
                        .build();
                syncLogRepository.save(logEntry);

                results.add(OfflineSyncResponse.SyncResultItem.builder()
                        .clientRequestId(item.getClientRequestId())
                        .serverReferenceNumber(serverRef)
                        .status("SYNCED")
                        .message("Successfully synchronized with central server")
                        .build());
                successCount++;

            } catch (Exception ex) {
                log.error("Failed to sync offline item {}: {}", item.getClientRequestId(), ex.getMessage());
                results.add(OfflineSyncResponse.SyncResultItem.builder()
                        .clientRequestId(item.getClientRequestId())
                        .status("FAILED")
                        .message(ex.getMessage())
                        .build());
            }
        }

        return OfflineSyncResponse.builder()
                .success(true)
                .itemsSynced(successCount)
                .results(results)
                .build();
    }
}
