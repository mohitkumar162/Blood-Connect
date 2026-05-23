package com.blooddonor.model.dto;

import com.blooddonor.model.entity.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class BloodRequestDto {

    @Data
    public static class CreateRequest {
        @NotBlank String patientName;
        @NotBlank String bloodGroup;
        @NotNull Integer units;
        @NotBlank String hospital;
        @NotBlank String city;
        Double latitude;
        Double longitude;
        Urgency urgency;
        LocalDateTime requiredBy;
        String notes;
    }

    @Data
    public static class RespondRequest {
        @NotBlank String action; // ACCEPT or DECLINE
        String message;
    }

    @Data
    public static class Response {
        private Long id;
        private Long requesterId;
        private String requesterPhone;
        private String patientName;
        private String bloodGroup;
        private Integer units;
        private String hospital;
        private String city;
        private Double latitude;
        private Double longitude;
        private Urgency urgency;
        private RequestStatus status;
        private LocalDateTime requiredBy;
        private String notes;
        private List<DonorResponseDto> responses;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(BloodRequest req) {
            Response dto = new Response();
            dto.setId(req.getId());
            dto.setRequesterId(req.getRequester().getId());
            dto.setRequesterPhone(req.getRequester().getPhone());
            dto.setPatientName(req.getPatientName());
            dto.setBloodGroup(req.getBloodGroup());
            dto.setUnits(req.getUnits());
            dto.setHospital(req.getHospital());
            dto.setCity(req.getCity());
            dto.setLatitude(req.getLatitude());
            dto.setLongitude(req.getLongitude());
            dto.setUrgency(req.getUrgency());
            dto.setStatus(req.getStatus());
            dto.setRequiredBy(req.getRequiredBy());
            dto.setNotes(req.getNotes());
            dto.setCreatedAt(req.getCreatedAt());
            dto.setUpdatedAt(req.getUpdatedAt());
            if (req.getResponses() != null) {
                dto.setResponses(req.getResponses().stream()
                    .map(DonorResponseDto::from).collect(Collectors.toList()));
            }
            return dto;
        }
    }
}
