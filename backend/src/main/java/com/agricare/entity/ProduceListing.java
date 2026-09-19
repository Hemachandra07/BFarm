package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "produce_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(nullable = false)
    private String farmerName;

    @Column(nullable = false)
    private String farmerPhone;

    @Column(nullable = false)
    private String crop; // e.g. "Tomato", "Chilli", "Rice"

    @Column(nullable = false)
    private Double quantityKg; // in kg e.g. 500

    @Column(nullable = false)
    private Double askingPricePerQuintal; // in INR e.g. 2700.0

    @Column(nullable = false)
    private String location; // Farmgate location e.g. "Tenali Farm"

    private String district; // Guntur, Krishna, Prakasam, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // AVAILABLE, NEGOTIATING, SOLD, CANCELLED

    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = Status.AVAILABLE;
        }
    }

    public enum Status {
        AVAILABLE,
        NEGOTIATING,
        SOLD,
        CANCELLED
    }
}
