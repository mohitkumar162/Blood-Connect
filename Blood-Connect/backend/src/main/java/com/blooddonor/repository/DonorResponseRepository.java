package com.blooddonor.repository;

import com.blooddonor.model.entity.BloodRequest;
import com.blooddonor.model.entity.DonorResponse;
import com.blooddonor.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonorResponseRepository extends JpaRepository<DonorResponse, Long> {
    List<DonorResponse> findByBloodRequest(BloodRequest request);
    Optional<DonorResponse> findByBloodRequestAndDonor(BloodRequest request, User donor);
    boolean existsByBloodRequestAndDonor(BloodRequest request, User donor);
}
