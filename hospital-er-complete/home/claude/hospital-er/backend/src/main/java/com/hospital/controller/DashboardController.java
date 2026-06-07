package com.hospital.controller;

import com.hospital.repository.*;
import com.hospital.service.bed.BedManagementService;
import com.hospital.service.notification.AlertService;
import com.hospital.service.scheduler.VitalMonitorService;
import com.hospital.service.triage.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController @RequestMapping("/api/dashboard")
@RequiredArgsConstructor @Tag(name = "ER Dashboard")
public class DashboardController {

    private final TriageService       triageService;
    private final BedManagementService bedService;
    private final AlertService        alertService;
    private final VitalMonitorService vitalMonitorService;
    private final LabService          labService;
    private final AdmissionRepository admissionRepo;
    private final DoctorRepository    doctorRepo;
    private final AlertRepository     alertRepo;

    @GetMapping("/summary")
    @Operation(summary = "Complete ER dashboard summary — aggregated from all thread pools")
    public ResponseEntity<Map<String,Object>> getSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        // Triage queue stats
        summary.put("triageQueue", triageService.getQueueStats());

        // Bed stats
        summary.put("beds", bedService.getBedStats());

        // Alert stats
        summary.put("alerts", alertService.getAlertStats());

        // Monitor stats
        summary.put("vitals", vitalMonitorService.getMonitorStats());

        // Lab stats
        summary.put("labs", labService.getLabStats());

        // Admission counts
        summary.put("activePatients", admissionRepo.countActive());
        summary.put("criticalUnacked", alertRepo.countBySeverityAndIsAcknowledged("CRITICAL", 0));
        summary.put("availableDoctors", doctorRepo.findAvailableDoctors().size());

        // Thread info
        summary.put("threadInfo", Map.of(
            "currentThread", Thread.currentThread().getName(),
            "availableProcessors", Runtime.getRuntime().availableProcessors(),
            "activeThreads", Thread.activeCount()
        ));

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get doctor availability (used by doctor assignment thread pool)")
    public ResponseEntity<List<com.hospital.entity.Doctor>> getDoctors() {
        return ResponseEntity.ok(doctorRepo.findAll());
    }
}