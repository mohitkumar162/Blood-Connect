package com.blooddonor.model.dto;

import com.blooddonor.model.entity.Role;
import com.blooddonor.model.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String bloodGroup;
    private Role role;
    private String city;
    private Double latitude;
    private Double longitude;
    private Boolean available;
    private Boolean verified;
    private Integer totalDonations;
    private LocalDateTime lastDonationDate;
    private LocalDateTime createdAt;
    private Double distanceKm;

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setBloodGroup(user.getBloodGroup());
        dto.setRole(user.getRole());
        dto.setCity(user.getCity());
        dto.setLatitude(user.getLatitude());
        dto.setLongitude(user.getLongitude());
        dto.setAvailable(user.getAvailable());
        dto.setVerified(user.getVerified());
        dto.setTotalDonations(user.getTotalDonations());
        dto.setLastDonationDate(user.getLastDonationDate());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
