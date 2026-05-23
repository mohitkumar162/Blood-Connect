package com.blooddonor.model.dto;

import com.blooddonor.model.entity.DonorResponse;
import com.blooddonor.model.entity.ResponseStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DonorResponseDto {
    private Long id;
    private Long donorId;
    private String donorName;
    private String donorBloodGroup;
    private String donorCity;
    private String donorPhone;
    private ResponseStatus status;
    private String message;
    private LocalDateTime respondedAt;

    public static DonorResponseDto from(DonorResponse resp) {
        DonorResponseDto dto = new DonorResponseDto();
        dto.setId(resp.getId());
        dto.setDonorId(resp.getDonor().getId());
        dto.setDonorName(resp.getDonor().getName());
        dto.setDonorBloodGroup(resp.getDonor().getBloodGroup());
        dto.setDonorCity(resp.getDonor().getCity());
        dto.setDonorPhone(resp.getDonor().getPhone());
        dto.setStatus(resp.getStatus());
        dto.setMessage(resp.getMessage());
        dto.setRespondedAt(resp.getRespondedAt());
        return dto;
    }
}
