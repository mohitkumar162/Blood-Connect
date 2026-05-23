package com.blooddonor.service;

import com.blooddonor.model.dto.DonationDto;
import com.blooddonor.model.dto.UserDto;
import com.blooddonor.model.entity.Role;
import com.blooddonor.model.entity.User;
import com.blooddonor.repository.DonationRepository;
import com.blooddonor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    public List<UserDto> getNearbyDonors(double lat, double lng, double radius, String bloodGroup) {
        List<User> donors = userRepository.findNearbyDonors(lat, lng, radius, bloodGroup, 50);
        return donors.stream().map(u -> {
            UserDto dto = UserDto.from(u);
            double dist = haversine(lat, lng, u.getLatitude(), u.getLongitude());
            dto.setDistanceKm(Math.round(dist * 10.0) / 10.0);
            return dto;
        }).collect(Collectors.toList());
    }

    public List<UserDto> getAllDonors(String bloodGroup, String city) {
        // Convert empty strings to null so repository query filters work correctly
        String bg = (bloodGroup == null || bloodGroup.isBlank()) ? null : bloodGroup;
        String ct = (city == null || city.isBlank()) ? null : city;
        return userRepository.findDonorsWithFilters(Role.DONOR, bg, ct)
            .stream().map(UserDto::from).collect(Collectors.toList());
    }

    @Transactional
    public UserDto toggleAvailability(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvailable(!user.getAvailable());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto updateProfile(String email, Map<String, Object> updates) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name")) user.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) {
            String rawPhone = (String) updates.get("phone");
            String normalizedPhone = rawPhone != null ? rawPhone.replaceAll("[^0-9+]", "") : null;
            if (normalizedPhone != null && !normalizedPhone.equals(user.getPhone())) {
                if (userRepository.existsByPhone(normalizedPhone)) {
                    throw new RuntimeException("Phone number already registered by another user");
                }
                user.setPhone(normalizedPhone);
            }
        }
        if (updates.containsKey("city")) user.setCity((String) updates.get("city"));
        if (updates.containsKey("bloodGroup")) user.setBloodGroup((String) updates.get("bloodGroup"));

        return UserDto.from(userRepository.save(user));
    }

    public List<DonationDto> getDonationHistory(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return donationRepository.findByDonorOrderByDonatedAtDesc(user)
            .stream().map(DonationDto::from).collect(Collectors.toList());
    }

    @Transactional
    public void updateFcmToken(String email, String token) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setFcmToken(token);
            userRepository.save(user);
        });
    }

    // Haversine formula for distance in km
    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
