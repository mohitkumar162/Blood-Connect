package com.blooddonor.service;

import com.blooddonor.model.dto.AuthDto;
import com.blooddonor.model.dto.UserDto;
import com.blooddonor.model.entity.User;
import com.blooddonor.repository.UserRepository;
import com.blooddonor.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String normalizedPhone = request.getPhone() != null ? request.getPhone().replaceAll("[^0-9+]", "") : null;
        if (normalizedPhone == null || normalizedPhone.trim().isEmpty()) {
            throw new RuntimeException("Phone number is mandatory");
        }
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new RuntimeException("Phone number already registered");
        }

        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = normalizedPhone + "@bloodconnect.com";
        } else {
            if (userRepository.existsByEmail(email)) {
                throw new RuntimeException("Email already registered");
            }
        }

        User user = User.builder()
            .name(request.getName())
            .email(email)
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(normalizedPhone)
            .bloodGroup(request.getBloodGroup())
            .role(request.getRole())
            .city(request.getCity())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .available(true)
            .verified(false)
            .active(true)
            .totalDonations(0)
            .build();

        user = userRepository.save(user);

        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return new AuthDto.AuthResponse(token, UserDto.from(user));
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String identifier = request.getEmail();
        String resolvedEmail = identifier;

        if (identifier != null) {
            String cleanPhone = identifier.replaceAll("[^0-9+]", "");
            if (!identifier.contains("@") && !cleanPhone.isEmpty()) {
                User userByPhone = userRepository.findByPhone(cleanPhone).orElse(null);
                if (userByPhone != null) {
                    resolvedEmail = userByPhone.getEmail();
                } else {
                    throw new RuntimeException("User not found");
                }
            } else {
                if (!userRepository.existsByEmail(identifier)) {
                    User userByPhone = userRepository.findByPhone(cleanPhone).orElse(null);
                    if (userByPhone != null) {
                        resolvedEmail = userByPhone.getEmail();
                    } else {
                        throw new RuntimeException("User not found");
                    }
                }
            }
        }

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(resolvedEmail, request.getPassword())
        );
        User user = userRepository.findByEmail(resolvedEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return new AuthDto.AuthResponse(token, UserDto.from(user));
    }

    public UserDto getMe(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.from(user);
    }
}
