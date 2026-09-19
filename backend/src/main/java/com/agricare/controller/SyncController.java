package com.agricare.controller;

import com.agricare.dto.ApiResponse;
import com.agricare.dto.OfflineSyncRequest;
import com.agricare.dto.OfflineSyncResponse;
import com.agricare.service.OfflineSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@Tag(name = "Offline Sync", description = "Batch synchronization endpoint for requests created while offline")
public class SyncController {

    private final OfflineSyncService offlineSyncService;

    @PostMapping("/batch")
    @Operation(summary = "Synchronize batch of offline requests when internet connection is restored")
    public ResponseEntity<ApiResponse<OfflineSyncResponse>> syncBatch(@RequestBody OfflineSyncRequest request) {
        OfflineSyncResponse response = offlineSyncService.processBatch(request);
        return ResponseEntity.ok(ApiResponse.ok("Synchronization processed", response));
    }
}
