package com.billing.dto;

import lombok.*;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data @Builder
    public static class LoginResponse {
        private String token;
        private String tokenType;
        private Long userId;
        private String username;
        private String fullName;
        private String email;
        private String role;
        private Long companyId;
        private String companyName;
    }
}
