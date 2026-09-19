package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "produce_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber; // e.g. "ORD-2026-00101"

    @Column(name = "listing_id")
    private Long listingId;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    private String farmerName;
    private String farmerPhone;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(nullable = false)
    private String buyerName;

    private String buyerPhone;
    private String buyerType; // "Wholesaler", "Food Processor", "Retailer", "FPO"

    @Column(nullable = false)
    private String crop;

    @Column(nullable = false)
    private Double quantityKg;

    @Column(nullable = false)
    private Double offeredPricePerQuintal;

    private Double totalAmount; // (quantityKg / 100) * offeredPricePerQuintal

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // OFFERED, ACCEPTED, REJECTED, LOGISTICS_BOOKED, IN_TRANSIT, DELIVERED, CANCELLED

    private String pickupLocation;
    private String deliveryDestination;
    private Long logisticsRequestId;
    private String logisticsReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = Status.OFFERED;
        }
        if (this.totalAmount == null && this.quantityKg != null && this.offeredPricePerQuintal != null) {
            this.totalAmount = (this.quantityKg / 100.0) * this.offeredPricePerQuintal;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        OFFERED,
        ACCEPTED,
        REJECTED,
        LOGISTICS_BOOKED,
        IN_TRANSIT,
        DELIVERED,
        CANCELLED
    }
}
