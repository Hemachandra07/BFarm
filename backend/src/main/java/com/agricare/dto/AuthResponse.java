package com.agricare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long id;
    private String name;
    private String phone;
    private String role;
    private String preferredLanguage;
    private String state;
    private String district;
    private String village;
}
