package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "storage_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", unique = true, nullable = false)
    private String bookingNumber; // e.g. "SB-2026-00041"

    @Column(name = "storage_id", nullable = false)
    private Long storageId;

    private String storageName;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String userName;
    private String userPhone;
    private String userRole; // "FARMER", "BUYER", "FPO"

    @Column(nullable = false)
    private String crop;

    @Column(nullable = false)
    private Double quantityMt; // Metric Tons

    private Integer durationDays;
    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // REQUESTED, APPROVED, STORED, RELEASED, REJECTED

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
            this.status = Status.REQUESTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        REQUESTED,
        APPROVED,
        STORED,
        RELEASED,
        REJECTED
    }
}
