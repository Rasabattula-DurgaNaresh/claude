package com.hospital.repository;

import com.hospital.entity.Admission;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    Optional<Admission> findByAdmissionRef(String ref);

    @Query("SELECT a FROM Admission a WHERE a.status NOT IN ('DISCHARGED','ADMITTED','TRANSFERRED') ORDER BY a.triageLevel, a.arrivalTime")
    List<Admission> findActiveAdmissions();

    @Query("SELECT a FROM Admission a WHERE a.status = 'IN_TREATMENT' AND a.treatmentStartedAt <= CURRENT_TIMESTAMP - 4 HOURS")
    List<Admission> findDischargeEligible();

    Page<Admission> findByPatientIdOrderByArrivalTimeDesc(Long patientId, Pageable pageable);

    @Query("SELECT a FROM Admission a WHERE a.triageLevel = :level AND a.status NOT IN ('DISCHARGED','ADMITTED','TRANSFERRED')")
    List<Admission> findActiveByTriageLevel(@Param("level") int level);

    @Query("SELECT a FROM Admission a WHERE a.assignedDoctorId = :doctorId AND a.status NOT IN ('DISCHARGED','ADMITTED','TRANSFERRED')")
    List<Admission> findActiveByDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) FROM Admission a WHERE a.status NOT IN ('DISCHARGED','ADMITTED','TRANSFERRED')")
    long countActive();

    @Query("SELECT a.status, COUNT(a) FROM Admission a GROUP BY a.status")
    List<Object[]> getStatusCounts();
}