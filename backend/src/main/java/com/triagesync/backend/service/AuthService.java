package com.triagesync.backend.service;

import com.triagesync.backend.dto.auth.AuthResponse;
import com.triagesync.backend.dto.auth.LoginRequest;
import com.triagesync.backend.dto.auth.RegisterRequest;
import com.triagesync.backend.entity.User;
import com.triagesync.backend.enums.Role;
import com.triagesync.backend.repository.UserRepository;
import com.triagesync.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();
        
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email already exists");
        }

        var user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Rule: Always USER
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        var jwtToken = jwtService.generateToken(userDetails);
        
        return buildAuthResponse(jwtToken, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(Locale.ROOT).trim(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail().toLowerCase(Locale.ROOT).trim())
                .orElseThrow(() -> new IllegalStateException("User not found"));
                
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        var jwtToken = jwtService.generateToken(userDetails);
        
        return buildAuthResponse(jwtToken, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }
}