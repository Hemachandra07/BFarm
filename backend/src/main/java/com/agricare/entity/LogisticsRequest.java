package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logistics_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", unique = true, nullable = false)
    private String referenceNumber; // e.g. "AC-2026-00124"

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(name = "provider_id")
    private Long providerId;

    private String providerName;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private String crop;

    @Column(nullable = false)
    private Double quantity; // in kg e.g. 500

    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // PENDING, CONFIRMED, IN_TRANSIT, COMPLETED, CANCELLED

    private String farmerPhone;
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = Status.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        PENDING,
        CONFIRMED,
        IN_TRANSIT,
        COMPLETED,
        CANCELLED
    }
}
