package com.hospital.controller;

import com.hospital.entity.Bed;
import com.hospital.repository.BedRepository;
import com.hospital.service.bed.BedManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/beds")
@RequiredArgsConstructor @Tag(name = "Bed Management")
public class BedController {

    private final BedManagementService bedService;
    private final BedRepository        bedRepo;

    @GetMapping("/stats")
    @Operation(summary = "Get bed statistics (uses ReentrantReadWriteLock)")
    public ResponseEntity<Map<String,Object>> getBedStats() {
        return ResponseEntity.ok(bedService.getBedStats());
    }

    @GetMapping("/available")
    @Operation(summary = "Get available beds (concurrent reads via ReadLock)")
    public ResponseEntity<List<BedManagementService.BedState>> getAvailable(
            @RequestParam(required=false) String ward) {
        return ResponseEntity.ok(bedService.getAvailableBeds(ward));
    }

    @GetMapping
    public ResponseEntity<List<Bed>> getAllBeds() {
        return ResponseEntity.ok(bedRepo.findAll());
    }

    @GetMapping("/ward-summary")
    public ResponseEntity<List<Object[]>> getWardSummary() {
        return ResponseEntity.ok(bedRepo.getBedSummaryByWard());
    }

    @PostMapping("/{bedId}/release")
    @Operation(summary = "Release a bed (WriteLock exclusive access)")
    public ResponseEntity<Map<String,String>> releaseBed(@PathVariable Long bedId) {
        bedService.releaseBed(bedId);
        return ResponseEntity.ok(Map.of("status", "CLEANING", "bedId", bedId.toString()));
    }
}