package com.hospital.repository;

import com.hospital.entity.Alert;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    Page<Alert> findByIsAcknowledgedOrderByCreatedAtDesc(Integer ack, Pageable pageable);
    List<Alert> findTop20ByOrderByCreatedAtDesc();
    long countBySeverityAndIsAcknowledged(String severity, Integer ack);
}