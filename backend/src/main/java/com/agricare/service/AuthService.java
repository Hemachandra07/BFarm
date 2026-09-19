package com.agricare.service;

import com.agricare.dto.AuthRequest;
import com.agricare.dto.AuthResponse;
import com.agricare.dto.RegisterRequest;
import com.agricare.entity.User;
import com.agricare.exception.BadRequestException;
import com.agricare.repository.UserRepository;
import com.agricare.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered. Please login instead.");
        }

        User.Role role = User.Role.FARMER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = User.Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (Exception e) {
                role = User.Role.FARMER;
            }
        }

        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .language(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "te")
                .state(request.getState() != null ? request.getState() : "Andhra Pradesh")
                .district(request.getDistrict() != null ? request.getDistrict() : "Guntur")
                .village(request.getVillage())
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getPhone(), user.getRole().name(), user.getId());

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BadRequestException("Invalid phone number or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid phone number or password.");
        }

        String token = tokenProvider.generateToken(user.getPhone(), user.getRole().name(), user.getId());

        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .preferredLanguage(user.getLanguage())
                .state(user.getState())
                .district(user.getDistrict())
                .village(user.getVillage())
                .build();
    }
}
