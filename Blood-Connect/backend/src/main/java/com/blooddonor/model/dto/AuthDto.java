package com.blooddonor.model.dto;

import com.blooddonor.model.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank String name;
        String email;
        @NotBlank @Size(min = 8) String password;
        @NotBlank String phone;
        @NotBlank String bloodGroup;
        @NotNull Role role;
        String city;
        Double latitude;
        Double longitude;
    }

    @Data
    public static class LoginRequest {
        @NotBlank String email;
        @NotBlank String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserDto user;

        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }
    }
}
