package com.blooddonor.controller;

import com.blooddonor.model.dto.BloodRequestDto;
import com.blooddonor.service.BloodRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestService requestService;

    @PostMapping
    public ResponseEntity<?> create(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody BloodRequestDto.CreateRequest dto
    ) {
        return ResponseEntity.ok(requestService.createRequest(userDetails.getUsername(), dto));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(requestService.getActiveRequests());
    }

    @GetMapping
    public ResponseEntity<?> getAll(
        @RequestParam(required = false, defaultValue = "") String status,
        @RequestParam(required = false, defaultValue = "") String bloodGroup
    ) {
        return ResponseEntity.ok(requestService.getAllRequests(status, bloodGroup));
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMine(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(requestService.getMyRequests(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respond(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody BloodRequestDto.RespondRequest dto
    ) {
        return ResponseEntity.ok(
            requestService.respondToRequest(id, userDetails.getUsername(), dto.getAction(), dto.getMessage())
        );
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<?> close(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(requestService.closeRequest(id, userDetails.getUsername()));
    }
}
