package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "logistics_providers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String location;
    private String district;
    private String state;

    @Column(nullable = false)
    private String vehicleType; // "Mini Truck (Tata Ace)", "Pickup Truck (Bolero)", "Canter (4 Ton)", "Heavy Truck"

    private Double capacity; // in Tons e.g. 1.0, 2.0, 4.0
    private Double estimatedCost; // Base fare in INR e.g. 1200.0
    private Double ratePerKm; // in INR e.g. 25.0
    private Boolean verified;
    private Long ownerId;
}
