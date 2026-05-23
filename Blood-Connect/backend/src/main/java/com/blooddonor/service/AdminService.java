package com.blooddonor.service;

import com.blooddonor.model.dto.BloodRequestDto;
import com.blooddonor.model.dto.UserDto;
import com.blooddonor.model.entity.RequestStatus;
import com.blooddonor.model.entity.Role;
import com.blooddonor.repository.BloodRequestRepository;
import com.blooddonor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BloodRequestRepository requestRepository;

    public Map<String, Object> getDashboard() {
        return Map.of(
            "totalUsers", userRepository.count(),
            "activeDonors", userRepository.countByRoleAndAvailableTrue(Role.DONOR),
            "totalRequests", requestRepository.count(),
            "fulfilled", requestRepository.countByStatus(RequestStatus.FULFILLED),
            "pending", requestRepository.countByStatus(RequestStatus.PENDING)
        );
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserDto::from).collect(Collectors.toList());
    }

    @Transactional
    public UserDto verifyDonor(Long id) {
        var user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto deactivateUser(Long id) {
        var user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        return UserDto.from(userRepository.save(user));
    }

    public List<BloodRequestDto.Response> getAllRequests(String statusStr, String bloodGroup) {
        RequestStatus status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try { status = RequestStatus.valueOf(statusStr); } catch (Exception ignored) {}
        }
        return requestRepository.findWithFilters(
                status,
                (bloodGroup == null || bloodGroup.isBlank()) ? null : bloodGroup
            )
            .stream().map(BloodRequestDto.Response::from).collect(Collectors.toList());
    }
}
