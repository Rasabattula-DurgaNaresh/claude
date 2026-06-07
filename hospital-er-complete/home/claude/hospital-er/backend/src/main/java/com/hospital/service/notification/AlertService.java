package com.hospital.service.notification;

import com.hospital.entity.Alert;
import com.hospital.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * CONCEPTS: CopyOnWriteArrayList, WebSocket broadcast, AtomicLong
 *
 * CopyOnWriteArrayList<AlertListener>:
 *   - Many threads trigger alerts (vitals monitor, lab service, triage)
 *   - Few threads add/remove listeners (admin ops)
 *   - COW: writes create a new array copy → reads are ALWAYS lock-free
 *   - Perfect ratio: high-frequency reads, low-frequency writes
 *
 * WebSocket broadcast via SimpMessagingTemplate:
 *   - /topic/alerts    → all connected clients
 *   - /topic/er-stats  → dashboard statistics
 *   - /topic/vitals    → live vital signs
 */
@Service @RequiredArgsConstructor @Slf4j
public class AlertService {

    private final AlertRepository      alertRepo;
    private final SimpMessagingTemplate messaging;

    @Qualifier("alertPool")
    private final ExecutorService alertPool;

    // CopyOnWriteArrayList: high read (every alert), low write (admin only)
    private final CopyOnWriteArrayList<String> activeConnections = new CopyOnWriteArrayList<>();

    private final AtomicLong totalAlerts    = new AtomicLong(0);
    private final AtomicLong criticalAlerts = new AtomicLong(0);

    /**
     * Trigger alert — saves to Oracle and broadcasts via WebSocket.
     * Async broadcast on alertPool — doesn't block calling thread (vital monitor, lab, etc.)
     */
    public void triggerAlert(Long admissionId, Long patientId,
                             String type, String severity, String message, String triggeredBy) {
        Alert alert = alertRepo.save(Alert.builder()
            .admissionId(admissionId).patientId(patientId)
            .alertType(type).severity(severity).message(message)
            .isAcknowledged(0).autoResolved(0)
            .triggeredBy(triggeredBy).createdAt(LocalDateTime.now())
            .build());

        totalAlerts.incrementAndGet();
        if ("CRITICAL".equals(severity)) criticalAlerts.incrementAndGet();

        // Async broadcast — alert pool thread handles WebSocket push
        alertPool.submit(() -> broadcastAlert(alert));

        log.info("[Alert] {} [{}]: {}", severity, type, message.substring(0, Math.min(80, message.length())));
    }

    private void broadcastAlert(Alert alert) {
        try {
            Map<String, Object> payload = Map.of(
                "alertId",    alert.getAlertId(),
                "admissionId",alert.getAdmissionId() != null ? alert.getAdmissionId() : 0,
                "patientId",  alert.getPatientId() != null ? alert.getPatientId() : 0,
                "alertType",  alert.getAlertType(),
                "severity",   alert.getSeverity(),
                "message",    alert.getMessage(),
                "triggeredBy",alert.getTriggeredBy() != null ? alert.getTriggeredBy() : "System",
                "createdAt",  alert.getCreatedAt().toString()
            );
            messaging.convertAndSend("/topic/alerts", payload);
        } catch (Exception e) {
            log.warn("[Alert] WebSocket broadcast failed: {}", e.getMessage());
        }
    }

    public void broadcastVitals(Object vitals) {
        try {
            messaging.convertAndSend("/topic/vitals", vitals);
        } catch (Exception e) {
            log.warn("[Alert] Vitals broadcast failed: {}", e.getMessage());
        }
    }

    public void broadcastStats(Object stats) {
        try {
            messaging.convertAndSend("/topic/er-stats", stats);
        } catch (Exception e) {}
    }

    public void acknowledge(Long alertId, String by) {
        alertRepo.findById(alertId).ifPresent(a -> {
            a.setIsAcknowledged(1);
            a.setAcknowledgedBy(by);
            a.setAcknowledgedAt(LocalDateTime.now());
            alertRepo.save(a);
        });
    }

    public void addConnection(String sessionId)    { activeConnections.add(sessionId); }
    public void removeConnection(String sessionId) { activeConnections.remove(sessionId); }
    public int  getConnectionCount()               { return activeConnections.size(); }

    public Map<String, Object> getAlertStats() {
        return Map.of(
            "totalAlerts",    totalAlerts.get(),
            "criticalAlerts", criticalAlerts.get(),
            "connections",    activeConnections.size()
        );
    }

    @Scheduled(fixedDelayString = "${er.timings.stats-broadcast-ms:2000}")
    public void broadcastDashboardStats() {
        // Handled by ErStatsScheduler
    }
}