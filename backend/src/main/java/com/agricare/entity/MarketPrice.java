package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "market_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String crop;

    @Column(nullable = false)
    private String market; // e.g. "Guntur APMC Mandi", "Vijayawada Rythu Bazar"

    private String district; // Guntur, Krishna, Prakasam, Kurnool, Hyderabad
    private String state; // Andhra Pradesh, Telangana

    @Column(nullable = false)
    private Double price; // in INR e.g. 2800.0

    @Column(nullable = false)
    private String unit; // "quintal", "kg"

    private LocalDate date;
    private String source; // "AGMARKNET (Live)", "AP Mandi Board (Demo)"
    private String trend; // "UP", "DOWN", "STABLE"
}
