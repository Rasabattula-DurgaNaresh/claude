package com.hospital.repository;

import com.hospital.entity.Doctor;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("SELECT d FROM Doctor d WHERE d.status = 'AVAILABLE' AND d.currentLoad < d.maxPatients ORDER BY d.currentLoad, d.yearsExperience DESC")
    List<Doctor> findAvailableDoctors();

    List<Doctor> findByStatus(String status);

    @Modifying @Transactional
    @Query("UPDATE Doctor d SET d.currentLoad = d.currentLoad + 1, d.status = CASE WHEN d.currentLoad + 1 >= d.maxPatients THEN 'BUSY' ELSE d.status END WHERE d.doctorId = :id")
    int incrementLoad(@Param("id") Long doctorId);

    @Modifying @Transactional
    @Query("UPDATE Doctor d SET d.currentLoad = GREATEST(0, d.currentLoad - 1), d.status = CASE WHEN d.currentLoad - 1 < d.maxPatients THEN 'AVAILABLE' ELSE d.status END WHERE d.doctorId = :id")
    int decrementLoad(@Param("id") Long doctorId);
}