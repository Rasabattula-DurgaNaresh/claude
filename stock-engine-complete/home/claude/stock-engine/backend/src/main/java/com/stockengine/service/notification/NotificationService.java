package com.stockengine.service.notification;

import com.stockengine.dto.MarketTickDto;
import com.stockengine.service.matching.MatchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * CONCEPTS: CopyOnWriteArrayList, WebSocket (STOMP), @Async broadcast
 *
 * CopyOnWriteArrayList for subscriber registry:
 *   - Subscribers are added/removed rarely (low write frequency)
 *   - Subscriber list is iterated on EVERY tick (very high read frequency)
 *   - COW creates a new array copy on write → iteration is ALWAYS lock-free
 *   - Perfect for event-listener / observer patterns
 *
 * WebSocket broadcast via SimpMessagingTemplate:
 *   - /topic/market-data  → real-time price ticks (all clients)
 *   - /topic/trades       → trade executions
 *   - /topic/engine-stats → engine metrics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // CopyOnWriteArrayList: lock-free iteration on every price tick
    private final CopyOnWriteArrayList<String> activeSubscribers = new CopyOnWriteArrayList<>();

    public void broadcastMarketTick(List<MarketTickDto> ticks) {
        try {
            messagingTemplate.convertAndSend("/topic/market-data", ticks);
        } catch (Exception e) {
            log.warn("[Notify] Market tick broadcast failed: {}", e.getMessage());
        }
    }

    public void broadcastTrade(MatchResult match) {
        try {
            Map<String, Object> payload = Map.of(
                "type",     "TRADE_EXECUTED",
                "symbol",   match.getSymbol(),
                "price",    match.getExecutionPrice(),
                "quantity", match.getMatchedQuantity(),
                "buyOrderId",  match.getBuyOrder().getOrderId(),
                "sellOrderId", match.getSellOrder().getOrderId(),
                "executedAt",  match.getMatchedAt().toString(),
                "thread",      Thread.currentThread().getName()
            );
            messagingTemplate.convertAndSend("/topic/trades", payload);
        } catch (Exception e) {
            log.warn("[Notify] Trade broadcast failed: {}", e.getMessage());
        }
    }

    public void broadcastEngineStats(Map<String, Object> stats) {
        try {
            messagingTemplate.convertAndSend("/topic/engine-stats", stats);
        } catch (Exception e) {
            log.warn("[Notify] Stats broadcast failed: {}", e.getMessage());
        }
    }

    public void addSubscriber(String sessionId)    { activeSubscribers.add(sessionId); }
    public void removeSubscriber(String sessionId) { activeSubscribers.remove(sessionId); }
    public int  getSubscriberCount()               { return activeSubscribers.size(); }
}