package com.stockengine.service;

import com.stockengine.service.matching.MatchingEngine;
import com.stockengine.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * CONCEPT: @Scheduled (ScheduledExecutorService under the hood)
 * Broadcasts engine stats to WebSocket clients every 2 seconds.
 */
@Service
@RequiredArgsConstructor
public class EngineStatsScheduler {

    private final MatchingEngine    matchingEngine;
    private final NotificationService notificationService;

    @Scheduled(fixedDelay = 2000)
    public void broadcastStats() {
        var stats = matchingEngine.getEngineStats();
        notificationService.broadcastEngineStats(stats);
    }
}