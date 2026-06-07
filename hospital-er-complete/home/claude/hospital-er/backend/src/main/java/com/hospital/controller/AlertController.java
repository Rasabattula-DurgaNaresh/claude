package com.hospital.controller;

import com.hospital.entity.Alert;
import com.hospital.repository.AlertRepository;
import com.hospital.service.notification.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController @RequestMapping("/api/alerts")
@RequiredArgsConstructor @Tag(name = "Alerts")
public class AlertController {

    private final AlertService   alertService;
    private final AlertRepository alertRepo;

    @GetMapping("/recent")
    @Operation(summary = "Get 20 most recent alerts")
    public ResponseEntity<List<Alert>> getRecent() {
        return ResponseEntity.ok(alertRepo.findTop20ByOrderByCreatedAtDesc());
    }

    @GetMapping("/unacknowledged")
    @Operation(summary = "Get all unacknowledged alerts (paginated)")
    public ResponseEntity<Page<Alert>> getUnacknowledged(
            @RequestParam(defaultValue="0")  int page,
            @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(alertRepo.findByIsAcknowledgedOrderByCreatedAtDesc(
            0, PageRequest.of(page, size)));
    }

    @PostMapping("/{alertId}/acknowledge")
    @Operation(summary = "Acknowledge an alert")
    public ResponseEntity<Map<String,String>> acknowledge(
            @PathVariable Long alertId, @RequestParam String by) {
        alertService.acknowledge(alertId, by);
        return ResponseEntity.ok(Map.of("status", "ACKNOWLEDGED", "by", by));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String,Object>> getStats() {
        return ResponseEntity.ok(alertService.getAlertStats());
    }
}