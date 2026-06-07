package com.stockengine.service;

import com.stockengine.dto.*;
import com.stockengine.entity.*;
import com.stockengine.repository.*;
import com.stockengine.service.matching.MatchingEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * CONCEPTS: @Async, AtomicLong (order ID), risk validation
 *
 * @Async: placeOrder runs on orderIngestionPool (configured in ThreadPoolConfig)
 * AtomicLong: lock-free order reference generation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository   orderRepo;
    private final AccountRepository accountRepo;
    private final MatchingEngine    matchingEngine;

    // AtomicLong: lock-free order ID generator
    private static final AtomicLong ORDER_SEQ = new AtomicLong(System.currentTimeMillis() % 100_000);

    /**
     * @Async: runs on orderIngestionPool — doesn't block the REST thread
     */
    @Async("orderIngestionPool")
    @Transactional
    public void placeOrderAsync(PlaceOrderRequest req) {
        placeOrder(req);
    }

    @Transactional
    public OrderDto placeOrder(PlaceOrderRequest req) {
        // 1. Load account
        TradingAccount account = accountRepo.findByClientId(req.getClientId())
            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + req.getClientId()));

        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalStateException("Account suspended: " + req.getClientId());
        }

        // 2. Risk checks
        validateRisk(req, account);

        // 3. Generate order reference
        String ref = String.format("ORD%s%06d",
            java.time.format.DateTimeFormatter.ofPattern("yyMMdd").format(LocalDateTime.now()),
            ORDER_SEQ.getAndIncrement());

        // 4. Block funds for BUY orders
        if ("BUY".equals(req.getSide()) && req.getPrice() != null) {
            BigDecimal required = req.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
            if (account.getCashBalance().compareTo(required) < 0) {
                throw new IllegalStateException("Insufficient funds: required " + required +
                    ", available " + account.getCashBalance());
            }
            account.setBlockedAmount(account.getBlockedAmount().add(required));
            account.setUpdatedAt(LocalDateTime.now());
            accountRepo.save(account);
        }

        // 5. Persist order
        StockOrder order = StockOrder.builder()
            .orderRef(ref)
            .accountId(account.getAccountId())
            .clientId(req.getClientId())
            .symbol(req.getSymbol().toUpperCase())
            .exchange(req.getExchange() != null ? req.getExchange() : "NSE")
            .orderType(req.getOrderType())
            .side(req.getSide())
            .quantity(req.getQuantity())
            .filledQty(0L)
            .remainingQty(req.getQuantity())
            .price(req.getPrice())
            .triggerPrice(req.getTriggerPrice())
            .avgFillPrice(BigDecimal.ZERO)
            .status("PENDING")
            .validity(req.getValidity())
            .product(req.getProduct())
            .disclosedQty(req.getDisclosedQty() != null ? req.getDisclosedQty() : 0L)
            .submittedAt(LocalDateTime.now())
            .createdBy("REST-" + Thread.currentThread().getName())
            .build();

        order = orderRepo.save(order);

        // 6. Submit to matching engine (BlockingQueue.offer())
        boolean queued = matchingEngine.submitOrder(order);
        if (!queued) {
            order.setStatus("REJECTED");
            order.setRejectionReason("Engine queue full");
            orderRepo.save(order);
        }

        log.info("[Order] {} {} {} {} {} @ {} → {}",
            ref, req.getSide(), req.getQuantity(), req.getSymbol(),
            req.getOrderType(), req.getPrice(), order.getStatus());

        return toDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, String clientId) {
        StockOrder order = orderRepo.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!clientId.equals(order.getClientId())) {
            throw new SecurityException("Unauthorized cancel attempt");
        }
        if (!List.of("OPEN","PENDING","PARTIALLY_FILLED").contains(order.getStatus())) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus("CANCELLED");
        order.setCancelledAt(LocalDateTime.now());
        orderRepo.save(order);

        log.info("[Order] {} cancelled by {}", orderId, clientId);
        return toDto(order);
    }

    private void validateRisk(PlaceOrderRequest req, TradingAccount account) {
        if (req.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if ("LIMIT".equals(req.getOrderType()) && req.getPrice() == null) {
            throw new IllegalArgumentException("Price required for LIMIT order");
        }
        if (req.getPrice() != null) {
            BigDecimal orderValue = req.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
            if (orderValue.compareTo(new BigDecimal("10000000")) > 0) {
                throw new IllegalArgumentException("Order value exceeds max limit of ₹1 crore");
            }
        }
    }

    public Page<OrderDto> getOrders(String clientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepo.findByClientIdOrderBySubmittedAtDesc(clientId, pageable)
            .map(this::toDto);
    }

    public List<OrderDto> getOpenOrders(String clientId) {
        return orderRepo.findByClientIdAndStatusIn(clientId,
            List.of("OPEN","PENDING","PARTIALLY_FILLED"))
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    private OrderDto toDto(StockOrder o) {
        return OrderDto.builder()
            .orderId(o.getOrderId()).orderRef(o.getOrderRef())
            .clientId(o.getClientId()).symbol(o.getSymbol()).exchange(o.getExchange())
            .orderType(o.getOrderType()).side(o.getSide())
            .quantity(o.getQuantity()).filledQty(o.getFilledQty()).remainingQty(o.getRemainingQty())
            .price(o.getPrice()).avgFillPrice(o.getAvgFillPrice())
            .status(o.getStatus()).validity(o.getValidity()).product(o.getProduct())
            .rejectionReason(o.getRejectionReason())
            .submittedAt(o.getSubmittedAt()).matchedAt(o.getMatchedAt())
            .build();
    }
}