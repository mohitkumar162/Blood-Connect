package com.blooddonor.controller;

import com.blooddonor.service.DonorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearby(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "10") double radius,
        @RequestParam(required = false, defaultValue = "") String bloodGroup
    ) {
        return ResponseEntity.ok(donorService.getNearbyDonors(lat, lng, radius, bloodGroup));
    }

    @GetMapping
    public ResponseEntity<?> getAll(
        @RequestParam(required = false, defaultValue = "") String bloodGroup,
        @RequestParam(required = false, defaultValue = "") String city
    ) {
        return ResponseEntity.ok(donorService.getAllDonors(bloodGroup, city));
    }

    @PutMapping("/availability")
    public ResponseEntity<?> toggleAvailability(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(donorService.toggleAvailability(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(donorService.updateProfile(userDetails.getUsername(), updates));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(donorService.getDonationHistory(userDetails.getUsername()));
    }

    @PutMapping("/fcm-token")
    public ResponseEntity<?> updateFcmToken(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody Map<String, String> body
    ) {
        donorService.updateFcmToken(userDetails.getUsername(), body.get("token"));
        return ResponseEntity.ok(Map.of("message", "FCM token updated"));
    }
}
