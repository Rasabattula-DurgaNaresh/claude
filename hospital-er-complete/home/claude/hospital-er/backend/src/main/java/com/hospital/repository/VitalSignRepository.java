package com.hospital.repository;

import com.hospital.entity.VitalSign;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.List;

public interface VitalSignRepository extends JpaRepository<VitalSign, Long> {
    Page<VitalSign> findByAdmissionIdOrderByRecordedAtDesc(Long admissionId, Pageable pageable);
    List<VitalSign> findTop5ByAdmissionIdOrderByRecordedAtDesc(Long admissionId);
    long countByAdmissionIdAndIsCritical(Long admissionId, Integer isCritical);
}