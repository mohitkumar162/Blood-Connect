package com.blooddonor.repository;

import com.blooddonor.model.entity.Role;
import com.blooddonor.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // Geo-radius search using Haversine formula (works without PostGIS extension)
    @Query(value = """
        SELECT *, (
          6371 * acos(
            cos(radians(:lat)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(latitude))
          )
        ) AS distance_km
        FROM users
        WHERE role = 'DONOR'
          AND available = true
          AND active = true
          AND (:bloodGroup IS NULL OR :bloodGroup = '' OR blood_group = :bloodGroup)
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
        HAVING distance_km <= :radiusKm
        ORDER BY distance_km ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<User> findNearbyDonors(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm,
        @Param("bloodGroup") String bloodGroup,
        @Param("limit") int limit
    );

    List<User> findByRoleAndBloodGroupAndAvailableTrue(Role role, String bloodGroup);
    List<User> findByRole(Role role);

    // Use LOWER() for case-insensitive city search (works on all DBs, not just PostgreSQL)
    @Query("""
        SELECT u FROM User u
        WHERE u.role = :role
          AND (:bloodGroup IS NULL OR :bloodGroup = '' OR u.bloodGroup = :bloodGroup)
          AND (:city IS NULL OR :city = '' OR LOWER(u.city) LIKE LOWER(CONCAT('%', :city, '%')))
        """)
    List<User> findDonorsWithFilters(
        @Param("role") Role role,
        @Param("bloodGroup") String bloodGroup,
        @Param("city") String city
    );

    long countByRole(Role role);
    long countByRoleAndAvailableTrue(Role role);
}
