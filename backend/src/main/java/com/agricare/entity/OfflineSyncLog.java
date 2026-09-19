package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "offline_sync_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfflineSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "client_request_id", unique = true, nullable = false)
    private String clientRequestId; // Generated on mobile device: UUID

    @Column(name = "request_type", nullable = false)
    private String requestType; // "LOGISTICS_REQUEST", "DIAGNOSIS_CACHE", "PRICE_ALERT"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String payload;

    @Column(name = "sync_status", nullable = false)
    private String syncStatus; // "SUCCESS", "FAILED"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.syncedAt = LocalDateTime.now();
    }
}
