package com.triagesync.backend.controller;

import com.triagesync.backend.dto.auth.AuthResponse;
import com.triagesync.backend.dto.auth.LoginRequest;
import com.triagesync.backend.dto.auth.RegisterRequest;
import com.triagesync.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Rule 7: 201 Created
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // Rule 7: 200 OK
        return ResponseEntity.ok(authService.login(request));
    }
}