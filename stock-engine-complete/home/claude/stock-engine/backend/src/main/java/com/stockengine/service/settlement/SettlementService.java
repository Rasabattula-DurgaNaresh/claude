package com.stockengine.service.settlement;

import com.stockengine.entity.*;
import com.stockengine.repository.*;
import com.stockengine.service.matching.MatchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import org.springframework.beans.factory.annotation.Qualifier;

/**
 * CONCEPTS: CompletableFuture, CountDownLatch, @Transactional
 *
 * Settlement = atomically:
 *   1. Save trade record to Oracle
 *   2. Update buyer's position
 *   3. Update seller's position
 *   4. Debit/credit cash balances
 *
 * CountDownLatch(2): both position updates must complete before we finalize.
 * CompletableFuture: buyer and seller positions updated concurrently.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private final TradeRepository    tradeRepo;
    private final OrderRepository    orderRepo;
    private final PositionRepository positionRepo;
    private final AccountRepository  accountRepo;

    @Qualifier("settlementPool")
    private final ExecutorService settlementPool;

    /**
     * Settle a matched trade.
     * Uses CountDownLatch to ensure BOTH position updates complete atomically.
     */
    @Transactional
    public void settle(MatchResult match) {
        long startMs = System.currentTimeMillis();

        // ── Step 1: Calculate charges ────────────────────────────────────
        BigDecimal tradeValue = match.getExecutionPrice()
            .multiply(BigDecimal.valueOf(match.getMatchedQuantity()));

        BigDecimal brokerage = tradeValue
            .multiply(new BigDecimal("0.0003"))    // 0.03% brokerage
            .max(new BigDecimal("20.00"))           // minimum ₹20
            .setScale(4, RoundingMode.HALF_UP);

        BigDecimal stt = tradeValue
            .multiply(new BigDecimal("0.001"))      // 0.1% STT on sell side
            .setScale(4, RoundingMode.HALF_UP);

        BigDecimal gst = brokerage
            .multiply(new BigDecimal("0.18"))       // 18% GST on brokerage
            .setScale(4, RoundingMode.HALF_UP);

        // ── Step 2: Persist trade ─────────────────────────────────────────
        Trade trade = Trade.builder()
            .tradeRef("TRD" + System.currentTimeMillis() + (int)(Math.random() * 9999))
            .buyOrderId(match.getBuyOrder().getOrderId())
            .sellOrderId(match.getSellOrder().getOrderId())
            .buyAccountId(match.getBuyOrder().getAccountId())
            .sellAccountId(match.getSellOrder().getAccountId())
            .symbol(match.getSymbol())
            .exchange(match.getBuyOrder().getExchange())
            .quantity(match.getMatchedQuantity())
            .price(match.getExecutionPrice())
            .tradeValue(tradeValue)
            .brokerageBuy(brokerage)
            .brokerageSell(brokerage)
            .stt(stt)
            .gst(gst)
            .settlementDate(LocalDate.now().plusDays(2))  // T+2 settlement
            .settlementStatus("PENDING")
            .executedAt(match.getMatchedAt())
            .threadName(Thread.currentThread().getName())  // track which thread settled
            .build();

        trade = tradeRepo.save(trade);
        orderRepo.save(match.getBuyOrder());
        orderRepo.save(match.getSellOrder());

        // ── Step 3: Concurrent position updates (CountDownLatch) ──────────
        CountDownLatch positionLatch = new CountDownLatch(2);
        final long tradeId = trade.getTradeId();

        // Update buyer position async
        CompletableFuture.runAsync(() -> {
            try {
                updatePosition(match.getBuyOrder().getAccountId(), match.getSymbol(),
                    "NSE", match.getBuyOrder().getProduct(),
                    match.getMatchedQuantity(), 0L, match.getExecutionPrice(), BigDecimal.ZERO);
                debitCash(match.getBuyOrder().getAccountId(),
                    tradeValue.add(brokerage).add(gst));
            } finally {
                positionLatch.countDown();   // 2 → 1
            }
        }, settlementPool);

        // Update seller position async (concurrent with buyer update)
        CompletableFuture.runAsync(() -> {
            try {
                updatePosition(match.getSellOrder().getAccountId(), match.getSymbol(),
                    "NSE", match.getSellOrder().getProduct(),
                    0L, match.getMatchedQuantity(), BigDecimal.ZERO, match.getExecutionPrice());
                creditCash(match.getSellOrder().getAccountId(),
                    tradeValue.subtract(brokerage).subtract(stt).subtract(gst));
            } finally {
                positionLatch.countDown();   // 1 → 0
            }
        }, settlementPool);

        // ── Step 4: Wait for BOTH position updates ────────────────────────
        try {
            if (!positionLatch.await(5, java.util.concurrent.TimeUnit.SECONDS)) {
                log.error("[Settlement] TIMEOUT for trade {}", tradeId);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        long latency = System.currentTimeMillis() - startMs;
        log.info("[Settlement] Trade {} settled in {}ms by thread {}",
                tradeId, latency, Thread.currentThread().getName());
    }

    @Transactional
    public void updatePosition(Long accountId, String symbol, String exchange,
                               String product, long buyQty, long sellQty,
                               BigDecimal buyPrice, BigDecimal sellPrice) {
        Position pos = positionRepo
            .findByAccountIdAndSymbolAndProduct(accountId, symbol, product)
            .orElse(Position.builder()
                .accountId(accountId).symbol(symbol).exchange(exchange)
                .product(product != null ? product : "CNC")
                .netQty(0L).buyQty(0L).sellQty(0L)
                .avgBuyPrice(BigDecimal.ZERO).avgSellPrice(BigDecimal.ZERO)
                .realizedPnl(BigDecimal.ZERO).unrealizedPnl(BigDecimal.ZERO)
                .dayChangePct(BigDecimal.ZERO).build());

        if (buyQty > 0) {
            // Update average buy price using weighted average
            BigDecimal totalCost = pos.getAvgBuyPrice()
                .multiply(BigDecimal.valueOf(pos.getBuyQty()))
                .add(buyPrice.multiply(BigDecimal.valueOf(buyQty)));
            pos.setBuyQty(pos.getBuyQty() + buyQty);
            pos.setAvgBuyPrice(pos.getBuyQty() > 0
                ? totalCost.divide(BigDecimal.valueOf(pos.getBuyQty()), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        }
        if (sellQty > 0) {
            BigDecimal totalSellValue = pos.getAvgSellPrice()
                .multiply(BigDecimal.valueOf(pos.getSellQty()))
                .add(sellPrice.multiply(BigDecimal.valueOf(sellQty)));
            pos.setSellQty(pos.getSellQty() + sellQty);
            pos.setAvgSellPrice(pos.getSellQty() > 0
                ? totalSellValue.divide(BigDecimal.valueOf(pos.getSellQty()), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

            // Realize P&L on sell
            if (pos.getBuyQty() > 0) {
                BigDecimal realizedPnl = sellPrice.subtract(pos.getAvgBuyPrice())
                    .multiply(BigDecimal.valueOf(sellQty));
                pos.setRealizedPnl(pos.getRealizedPnl().add(realizedPnl));
            }
        }
        pos.setNetQty(pos.getBuyQty() - pos.getSellQty());
        pos.setLastUpdated(LocalDateTime.now());
        positionRepo.save(pos);
    }

    @Transactional
    public void debitCash(Long accountId, BigDecimal amount) {
        accountRepo.findById(accountId).ifPresent(acc -> {
            acc.setCashBalance(acc.getCashBalance().subtract(amount));
            acc.setUpdatedAt(LocalDateTime.now());
            accountRepo.save(acc);
        });
    }

    @Transactional
    public void creditCash(Long accountId, BigDecimal amount) {
        accountRepo.findById(accountId).ifPresent(acc -> {
            acc.setCashBalance(acc.getCashBalance().add(amount));
            acc.setUpdatedAt(LocalDateTime.now());
            accountRepo.save(acc);
        });
    }
}