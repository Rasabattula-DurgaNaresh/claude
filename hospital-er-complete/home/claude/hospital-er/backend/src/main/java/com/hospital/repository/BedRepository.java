package com.hospital.repository;

import com.hospital.entity.Bed;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface BedRepository extends JpaRepository<Bed, Long> {

    @Query("SELECT b FROM Bed b WHERE b.status = 'AVAILABLE' AND b.ward = :ward ORDER BY b.bedNumber LIMIT 1")
    Optional<Bed> findFirstAvailableByWard(@Param("ward") String ward);

    List<Bed> findByWardOrderByBedNumber(String ward);
    List<Bed> findByStatus(String status);
    long countByStatusAndWard(String status, String ward);

    @Query("SELECT b.ward, b.status, COUNT(b) FROM Bed b GROUP BY b.ward, b.status ORDER BY b.ward")
    List<Object[]> getBedSummaryByWard();
}