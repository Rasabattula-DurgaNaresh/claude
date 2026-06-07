package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.triage.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController @RequestMapping("/api/triage")
@RequiredArgsConstructor @Tag(name = "Triage & Admissions")
public class TriageController {

    private final TriageService        triageService;
    private final LabService           labService;
    private final AdmissionRepository  admissionRepo;
    private final VitalSignRepository  vitalRepo;

    @PostMapping("/admit")
    @Operation(summary = "Admit patient — added to PriorityBlockingQueue by triage level")
    public ResponseEntity<Map<String,String>> admitPatient(@RequestBody @Valid AdmitPatientRequest req) {
        triageService.admitPatient(req);  // @Async — returns immediately
        return ResponseEntity.accepted().body(Map.of(
            "status",  "QUEUED",
            "message", "Patient queued for triage (level " + req.getTriageLevel() + ")",
            "thread",  Thread.currentThread().getName()
        ));
    }

    @GetMapping("/queue/stats")
    @Operation(summary = "Get triage queue statistics (shows thread pool metrics)")
    public ResponseEntity<Map<String,Object>> getQueueStats() {
        return ResponseEntity.ok(triageService.getQueueStats());
    }

    @GetMapping("/admissions")
    @Operation(summary = "Get all active ER admissions")
    public ResponseEntity<List<Admission>> getActiveAdmissions() {
        return ResponseEntity.ok(admissionRepo.findActiveAdmissions());
    }

    @GetMapping("/admissions/{id}")
    public ResponseEntity<Admission> getAdmission(@PathVariable Long id) {
        return admissionRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admissions/{id}/vitals")
    @Operation(summary = "Get recent vital signs for an admission")
    public ResponseEntity<List<VitalSign>> getVitals(@PathVariable Long id) {
        return ResponseEntity.ok(vitalRepo.findTop5ByAdmissionIdOrderByRecordedAtDesc(id));
    }

    @PostMapping("/labs/order")
    @Operation(summary = "Order lab tests — runs concurrently via CompletableFuture")
    public ResponseEntity<Map<String,Object>> orderLabs(@RequestBody @Valid LabOrderRequest req) {
        admissionRepo.findById(req.getAdmissionId())
            .ifPresentOrElse(adm -> {
                labService.orderMultipleTests(
                    req.getAdmissionId(), adm.getPatientId(),
                    req.getTestTypes(), req.getPriority(),
                    req.getOrderedBy() != null ? req.getOrderedBy() : "ER-Physician");
            }, () -> { throw new IllegalArgumentException("Admission not found: " + req.getAdmissionId()); });

        return ResponseEntity.accepted().body(Map.of(
            "status",     "ORDERED",
            "testCount",  req.getTestTypes().size(),
            "priority",   req.getPriority(),
            "message",    "Lab tests ordered — processing concurrently on lab pool"
        ));
    }

    @GetMapping("/admissions/{id}/labs")
    public ResponseEntity<?> getLabs(@PathVariable Long id,
            com.hospital.repository.LabOrderRepository labRepo) {
        return ResponseEntity.ok(labRepo.findByAdmissionIdOrderByOrderedAtDesc(id));
    }

    @GetMapping("/status-summary")
    public ResponseEntity<List<Object[]>> getStatusSummary() {
        return ResponseEntity.ok(admissionRepo.getStatusCounts());
    }
}