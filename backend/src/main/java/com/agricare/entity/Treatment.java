package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "treatments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "disease_id", nullable = false)
    private Long diseaseId;

    @Column(nullable = false, length = 10)
    private String language; // "en", "te", "hi"

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String steps; // JSON or newline-separated list of actionable treatment steps

    @Column(columnDefinition = "TEXT")
    private String prevention; // Multilingual prevention advice

    @Column(columnDefinition = "TEXT")
    private String warning; // Multilingual regulatory/safety warning
}
