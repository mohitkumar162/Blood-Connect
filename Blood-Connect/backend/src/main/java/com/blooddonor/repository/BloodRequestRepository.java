package com.blooddonor.repository;

import com.blooddonor.model.entity.BloodRequest;
import com.blooddonor.model.entity.RequestStatus;
import com.blooddonor.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    List<BloodRequest> findByRequesterOrderByCreatedAtDesc(User requester);

    @Query("""
        SELECT r FROM BloodRequest r
        WHERE (:status IS NULL OR r.status = :status)
          AND (:bloodGroup IS NULL OR r.bloodGroup = :bloodGroup)
        ORDER BY r.createdAt DESC
        """)
    List<BloodRequest> findWithFilters(
        @Param("status") RequestStatus status,
        @Param("bloodGroup") String bloodGroup
    );

    @Query("SELECT r FROM BloodRequest r WHERE r.requester = :user ORDER BY r.createdAt DESC")
    List<BloodRequest> findByUser(@Param("user") User user);

    long countByStatus(RequestStatus status);
}
