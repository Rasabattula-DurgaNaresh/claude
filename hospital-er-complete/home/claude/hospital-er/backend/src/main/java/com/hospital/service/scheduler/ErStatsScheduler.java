package com.hospital.service.scheduler;

import com.hospital.repository.*;
import com.hospital.service.bed.BedManagementService;
import com.hospital.service.notification.AlertService;
import com.hospital.service.triage.TriageService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;

@Service @RequiredArgsConstructor
public class ErStatsScheduler {

    private final TriageService        triageService;
    private final BedManagementService bedService;
    private final AlertService         alertService;
    private final AdmissionRepository  admissionRepo;
    private final DoctorRepository     doctorRepo;
    private final AlertRepository      alertRepo;

    @Scheduled(fixedDelayString = "${er.timings.stats-broadcast-ms:2000}")
    public void broadcastStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("triageQueue",     triageService.getQueueStats());
        stats.put("bedStats",        bedService.getBedStats());
        stats.put("alertStats",      alertService.getAlertStats());
        stats.put("activePatients",  admissionRepo.countActive());
        stats.put("criticalUnacked", alertRepo.countBySeverityAndIsAcknowledged("CRITICAL", 0));
        stats.put("availableDoctors",doctorRepo.findAvailableDoctors().size());
        stats.put("activeThreads",   Thread.activeCount());
        stats.put("timestamp",       System.currentTimeMillis());
        alertService.broadcastStats(stats);
    }
}