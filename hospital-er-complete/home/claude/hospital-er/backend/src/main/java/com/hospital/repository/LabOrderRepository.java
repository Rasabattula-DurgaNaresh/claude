package com.hospital.repository;

import com.hospital.entity.LabOrder;
import org.springframework.data.jpa.repository.*;
import java.util.List;

public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
    List<LabOrder> findByAdmissionIdOrderByOrderedAtDesc(Long admissionId);
    List<LabOrder> findByStatusAndPriority(String status, String priority);
    long countByResultFlag(String flag);
}