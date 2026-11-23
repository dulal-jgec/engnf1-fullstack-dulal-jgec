package com.triagesync.backend.dto.auth;

import com.triagesync.backend.enums.Role;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String token;
    private UserResponse user;
    
    @Data
    @Builder
    public static class UserResponse {
        private UUID id;
        private String name;
        private String email;
        private Role role;
    }
}