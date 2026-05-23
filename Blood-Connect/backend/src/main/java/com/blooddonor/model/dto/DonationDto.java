package com.blooddonor.model.dto;

import com.blooddonor.model.entity.Donation;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DonationDto {
    private Long id;
    private String patientName;
    private String bloodGroup;
    private String hospital;
    private String city;
    private LocalDateTime donatedAt;

    public static DonationDto from(Donation d) {
        DonationDto dto = new DonationDto();
        dto.setId(d.getId());
        dto.setPatientName(d.getPatientName());
        dto.setBloodGroup(d.getBloodGroup());
        dto.setHospital(d.getHospital());
        dto.setCity(d.getCity());
        dto.setDonatedAt(d.getDonatedAt());
        return dto;
    }
}
