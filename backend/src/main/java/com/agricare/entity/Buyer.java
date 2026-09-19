package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buyers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Buyer {

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

    @Column(length = 1000)
    private String crops; // Comma-separated or JSON list of crops

    private Double offeredPrice; // Offered price in INR per quintal
    private String buyerType; // "Food Processor", "Wholesaler", "Exporter", "Retail Aggregator"
    private Boolean verified;
}
