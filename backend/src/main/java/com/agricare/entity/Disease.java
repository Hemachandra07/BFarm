package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "diseases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String crop;

    @Column(length = 2000)
    private String symptoms;

    private String severity; // Low, Medium, High

    @Column(length = 2000)
    private String prevention;

    @Column(length = 2000)
    private String treatmentSummary;

    private String imageUrl;
}
