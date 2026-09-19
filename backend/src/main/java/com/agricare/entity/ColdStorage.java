package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cold_storages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColdStorage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;
    private String district;
    private String state;

    private Double capacity; // Total capacity in MT
    private Double availableCapacity; // Available capacity in MT

    @Column(length = 1000)
    private String supportedCrops; // "Tomato, Chilli, Potato, Vegetables"

    private Double pricePerDay; // in INR per MT per day or per bag
    private String priceUnit; // "per MT / month", "per bag / day"

    @Column(nullable = false)
    private String phone;

    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private Boolean verified;
    private Long ownerId;
}
