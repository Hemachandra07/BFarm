package com.agricare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fpos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FPO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;
    private String district;
    private String state;

    @Column(nullable = false)
    private String phone;

    @Column(length = 1000)
    private String crops;

    private Integer memberCount;
    private Double distanceKm;
    private Boolean verified;
}
