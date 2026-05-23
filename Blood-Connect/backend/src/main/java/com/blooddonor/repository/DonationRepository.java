package com.blooddonor.repository;

import com.blooddonor.model.entity.Donation;
import com.blooddonor.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorOrderByDonatedAtDesc(User donor);
    long countByDonor(User donor);
}
