package com.stockengine.service.market;

import com.stockengine.dto.MarketTickDto;
import com.stockengine.entity.MarketData;
import com.stockengine.repository.MarketDataRepository;
import com.stockengine.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * CONCEPTS: ScheduledExecutorService, ConcurrentHashMap, volatile, AtomicLong
 *
 * Market Data Service simulates real-time price feeds using:
 *
 * ScheduledExecutorService:
 *   - scheduleAtFixedRate → fires every 500ms regardless of execution time
 *   - scheduleWithFixedDelay → waits 500ms AFTER completion (avoids overlap)
 *
 * ConcurrentHashMap:
 *   - symbol → MarketTickDto: in-memory real-time price store
 *   - Reads are lock-free, writes use segment-level locking
 *
 * volatile fields in MarketData (via DTO copy):
 *   - LTP written by feed thread, read by REST/WebSocket threads
 *   - No lock needed — single writer, many readers
 *
 * AtomicLong:
 *   - Tick counter: lock-free increment, readable from Actuator
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {

    private final MarketDataRepository   marketDataRepo;
    private final NotificationService    notificationService;

    @Qualifier("marketDataPool")
    private final ScheduledExecutorService marketDataPool;

    // ConcurrentHashMap: in-memory LTP cache (reads are lock-free)
    private final ConcurrentHashMap<String, MarketTickDto> liveTickMap = new ConcurrentHashMap<>();

    private final AtomicLong tickCount = new AtomicLong(0);
    private final Random rng = new Random();

    private static final String[] SYMBOLS = {
        "RELIANCE","TCS","INFY","HDFCBANK","WIPRO","ICICIBANK","BHARTIARTL","SBIN"
    };

    @PostConstruct
    public void init() {
        // Load all symbols from Oracle into in-memory cache
        marketDataRepo.findAll().forEach(md -> {
            MarketTickDto tick = buildTick(md);
            liveTickMap.put(md.getId().getSymbol(), tick);
        });
        log.info("[MarketData] Loaded {} symbols into live cache", liveTickMap.size());
        startFeed();
    }

    /**
     * Start market data feed.
     * scheduleAtFixedRate: fires every 500ms regardless of how long tick() takes.
     */
    private void startFeed() {
        // Price tick — every 500ms
        marketDataPool.scheduleAtFixedRate(
            this::tickAllPrices, 0, 500, TimeUnit.MILLISECONDS);

        // Persist snapshot to Oracle — every 10 seconds
        marketDataPool.scheduleWithFixedDelay(
            this::persistToOracle, 10, 10, TimeUnit.SECONDS);

        log.info("[MarketData] Feed started: 500ms ticks, 10s Oracle snapshots");
    }

    /**
     * Simulate realistic price movement for all symbols.
     * Uses Gaussian random walk — same model used by real market simulators.
     */
    private void tickAllPrices() {
        for (String symbol : SYMBOLS) {
            MarketTickDto current = liveTickMap.get(symbol);
            if (current == null) continue;

            // Gaussian random walk: ±0.3% per tick (realistic intraday movement)
            double changePercent = rng.nextGaussian() * 0.003;
            double newLtp = current.getLtp().doubleValue() * (1 + changePercent);
            newLtp = Math.max(newLtp, current.getCircuitLow().doubleValue() * 0.95);
            newLtp = Math.min(newLtp, current.getCircuitHigh().doubleValue() * 1.05);

            BigDecimal ltp    = BigDecimal.valueOf(newLtp).setScale(2, RoundingMode.HALF_UP);
            BigDecimal bid    = ltp.subtract(new BigDecimal("0.05"));
            BigDecimal ask    = ltp.add(new BigDecimal("0.05"));
            long       vol    = current.getVolume() + rng.nextInt(50000) + 10000;

            MarketTickDto updated = current.toBuilder()
                .ltp(ltp).bid(bid).ask(ask).volume(vol)
                .high(ltp.max(current.getHigh()))
                .low(ltp.min(current.getLow()))
                .changeAmt(ltp.subtract(current.getClose()))
                .changePct(ltp.subtract(current.getClose())
                    .divide(current.getClose(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)))
                .updatedAt(LocalDateTime.now())
                .build();

            // ConcurrentHashMap.put: atomic, only locks the relevant segment
            liveTickMap.put(symbol, updated);
        }

        tickCount.incrementAndGet();  // AtomicLong: lock-free

        // WebSocket broadcast every tick
        notificationService.broadcastMarketTick(new ArrayList<>(liveTickMap.values()));
    }

    private void persistToOracle() {
        liveTickMap.values().forEach(tick -> {
            marketDataRepo.findById(new MarketData.MarketDataId(tick.getSymbol(), "NSE"))
                .ifPresent(md -> {
                    md.setLtp(tick.getLtp());
                    md.setHighPrice(tick.getHigh());
                    md.setLowPrice(tick.getLow());
                    md.setVolume(tick.getVolume());
                    md.setBidPrice(tick.getBid());
                    md.setAskPrice(tick.getAsk());
                    md.setUpdatedAt(LocalDateTime.now());
                    marketDataRepo.save(md);
                });
        });
    }

    // Called by MatchingEngine when a trade executes — updates LTP immediately
    public void updateOnTrade(String symbol, BigDecimal tradePrice, long qty) {
        liveTickMap.computeIfPresent(symbol, (k, current) ->
            current.toBuilder()
                .ltp(tradePrice)
                .volume(current.getVolume() + qty)
                .high(tradePrice.max(current.getHigh()))
                .low(tradePrice.min(current.getLow()))
                .changeAmt(tradePrice.subtract(current.getClose()))
                .changePct(tradePrice.subtract(current.getClose())
                    .divide(current.getClose(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)))
                .updatedAt(LocalDateTime.now())
                .build()
        );
    }

    public List<MarketTickDto> getAllTicks()          { return new ArrayList<>(liveTickMap.values()); }
    public Optional<MarketTickDto> getTick(String s) { return Optional.ofNullable(liveTickMap.get(s.toUpperCase())); }
    public long getTickCount()                        { return tickCount.get(); }

    private MarketTickDto buildTick(MarketData md) {
        BigDecimal close = md.getClosePrice() != null ? md.getClosePrice() : md.getLtp();
        return MarketTickDto.builder()
            .symbol(md.getId().getSymbol())
            .exchange("NSE")
            .ltp(md.getLtp())
            .open(md.getOpenPrice())
            .high(md.getHighPrice())
            .low(md.getLowPrice())
            .close(close)
            .volume(md.getVolume() != null ? md.getVolume() : 0L)
            .bid(md.getBidPrice())
            .ask(md.getAskPrice())
            .circuitHigh(md.getCircuitHigh())
            .circuitLow(md.getCircuitLow())
            .week52High(md.getWeek52High())
            .week52Low(md.getWeek52Low())
            .peRatio(md.getPeRatio())
            .changeAmt(md.getLtp().subtract(close))
            .changePct(md.getLtp().subtract(close)
                .divide(close, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)))
            .updatedAt(LocalDateTime.now())
            .build();
    }
}