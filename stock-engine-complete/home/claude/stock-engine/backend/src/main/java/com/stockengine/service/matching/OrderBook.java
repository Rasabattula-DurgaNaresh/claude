package com.stockengine.service.matching;

import com.stockengine.entity.StockOrder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.StampedLock;

/**
 * CONCEPTS: ReentrantLock, StampedLock, volatile, AtomicLong
 *
 * OrderBook maintains sorted buy/sell queues for ONE symbol.
 * Each symbol gets its OWN OrderBook instance (sharded by symbol).
 *
 * ReentrantLock (fair=true):
 *   - Exclusive lock for adding/matching orders — only ONE thread in critical section
 *   - Fair mode: FIFO ordering prevents thread starvation (critical for fair order execution)
 *   - tryLock(timeout) option prevents deadlocks
 *
 * StampedLock for market depth reads:
 *   - Optimistic read (zero-overhead) for bid/ask queries (99% of reads)
 *   - Falls back to read lock only on write-collision (rare)
 *
 * AtomicLong for match counters:
 *   - Lock-free increment, safe across threads without synchronized block
 *
 * volatile lastTradePrice:
 *   - Written by matching thread, read by ALL market-data broadcast threads
 *   - volatile guarantees visibility without locking
 */
@Slf4j
public class OrderBook {

    private final String symbol;

    // TreeMap: auto-sorted. BUY = highest price first (reverse). SELL = lowest first (natural).
    private final TreeMap<BigDecimal, Deque<StockOrder>> buyBook  = new TreeMap<>(Comparator.reverseOrder());
    private final TreeMap<BigDecimal, Deque<StockOrder>> sellBook = new TreeMap<>();
    private final List<StockOrder>                        marketBuyQueue  = new LinkedList<>();
    private final List<StockOrder>                        marketSellQueue = new LinkedList<>();

    // ReentrantLock (fair): FIFO ordering — earlier orders matched first (stock exchange rule)
    private final ReentrantLock matchingLock = new ReentrantLock(true);

    // StampedLock: optimistic reads for depth queries (market depth API calls)
    private final StampedLock depthLock = new StampedLock();

    // volatile: written by matching thread, read by broadcast threads — no lock needed
    private volatile BigDecimal lastTradePrice = BigDecimal.ZERO;
    private volatile long       lastTradeQty   = 0;
    private volatile long       totalVolume     = 0;

    // AtomicLong: lock-free counter (many threads can read this simultaneously)
    @Getter private final AtomicLong matchedOrderCount = new AtomicLong(0);
    @Getter private final AtomicLong totalMatchedValue = new AtomicLong(0); // in paise

    public OrderBook(String symbol) { this.symbol = symbol; }

    /**
     * Add order to book and attempt matching.
     * Holds ReentrantLock for the entire matching critical section.
     */
    public Optional<MatchResult> addAndMatch(StockOrder order) {
        matchingLock.lock();  // ACQUIRE exclusive lock
        try {
            return switch (order.getOrderType()) {
                case "MARKET"   -> matchMarketOrder(order);
                case "LIMIT"    -> matchLimitOrder(order);
                case "STOP_LOSS"-> { addToBook(order); yield Optional.empty(); }
                default         -> { addToBook(order); yield Optional.empty(); }
            };
        } finally {
            matchingLock.unlock();  // ALWAYS release in finally
        }
    }

    private Optional<MatchResult> matchMarketOrder(StockOrder order) {
        TreeMap<BigDecimal, Deque<StockOrder>> oppositeBook =
            "BUY".equals(order.getSide()) ? sellBook : buyBook;

        if (oppositeBook.isEmpty()) {
            // No counterparty — queue the market order
            if ("BUY".equals(order.getSide())) marketBuyQueue.add(order);
            else marketSellQueue.add(order);
            return Optional.empty();
        }

        // Match at best available price
        Map.Entry<BigDecimal, Deque<StockOrder>> bestEntry = oppositeBook.firstEntry();
        StockOrder counterparty = bestEntry.getValue().peekFirst();
        return executeMatch(order, counterparty, bestEntry.getKey(), order.getQuantity());
    }

    private Optional<MatchResult> matchLimitOrder(StockOrder order) {
        TreeMap<BigDecimal, Deque<StockOrder>> oppositeBook =
            "BUY".equals(order.getSide()) ? sellBook : buyBook;

        if (oppositeBook.isEmpty()) {
            addToBook(order);
            return Optional.empty();
        }

        BigDecimal bestPrice = oppositeBook.firstKey();
        boolean canMatch = "BUY".equals(order.getSide())
            ? order.getPrice().compareTo(bestPrice) >= 0   // buy price >= ask
            : order.getPrice().compareTo(bestPrice) <= 0;  // sell price <= bid

        if (!canMatch) {
            addToBook(order);
            return Optional.empty();
        }

        Deque<StockOrder> counterparties = oppositeBook.get(bestPrice);
        StockOrder counterparty = counterparties.peekFirst();
        long matchQty = Math.min(order.getRemainingQty(), counterparty.getRemainingQty());

        Optional<MatchResult> result = executeMatch(order, counterparty, bestPrice, matchQty);

        // Clean up empty price levels
        if (counterparty.getRemainingQty() == 0) {
            counterparties.pollFirst();
            if (counterparties.isEmpty()) oppositeBook.remove(bestPrice);
        }

        return result;
    }

    private Optional<MatchResult> executeMatch(StockOrder aggressor, StockOrder passive,
                                                BigDecimal price, long qty) {
        passive.setFilledQty(passive.getFilledQty() + qty);
        passive.setRemainingQty(passive.getRemainingQty() - qty);
        aggressor.setFilledQty(aggressor.getFilledQty() + qty);
        aggressor.setRemainingQty(aggressor.getRemainingQty() - qty);

        String aggressorStatus = aggressor.getRemainingQty() == 0 ? "FILLED" : "PARTIALLY_FILLED";
        String passiveStatus   = passive.getRemainingQty()   == 0 ? "FILLED" : "PARTIALLY_FILLED";
        aggressor.setStatus(aggressorStatus);
        passive.setStatus(passiveStatus);

        // volatile writes — immediately visible to market-data threads
        lastTradePrice = price;
        lastTradeQty   = qty;
        totalVolume   += qty;

        // AtomicLong: lock-free updates
        matchedOrderCount.incrementAndGet();
        totalMatchedValue.addAndGet(price.movePointRight(2).longValue() * qty);

        log.info("[{}] TRADE: {} {} {} @ {} | Thread: {}",
            symbol,
            "BUY".equals(aggressor.getSide()) ? aggressor.getClientId() : passive.getClientId(),
            qty, symbol, price, Thread.currentThread().getName());

        StockOrder buyOrder  = "BUY".equals(aggressor.getSide()) ? aggressor : passive;
        StockOrder sellOrder = "SELL".equals(aggressor.getSide()) ? aggressor : passive;

        return Optional.of(new MatchResult(buyOrder, sellOrder, price, qty, symbol));
    }

    private void addToBook(StockOrder order) {
        TreeMap<BigDecimal, Deque<StockOrder>> book = "BUY".equals(order.getSide()) ? buyBook : sellBook;
        book.computeIfAbsent(order.getPrice(), k -> new ArrayDeque<>()).addLast(order);
        order.setStatus("OPEN");
    }

    /**
     * StampedLock optimistic read for best bid.
     * 99% of reads succeed without ever acquiring a lock.
     */
    public BigDecimal getBestBid() {
        long stamp = depthLock.tryOptimisticRead();
        BigDecimal bid = buyBook.isEmpty() ? BigDecimal.ZERO : buyBook.firstKey();
        if (!depthLock.validate(stamp)) {
            stamp = depthLock.readLock();
            try { bid = buyBook.isEmpty() ? BigDecimal.ZERO : buyBook.firstKey(); }
            finally { depthLock.unlockRead(stamp); }
        }
        return bid;
    }

    public BigDecimal getBestAsk() {
        long stamp = depthLock.tryOptimisticRead();
        BigDecimal ask = sellBook.isEmpty() ? BigDecimal.ZERO : sellBook.firstKey();
        if (!depthLock.validate(stamp)) {
            stamp = depthLock.readLock();
            try { ask = sellBook.isEmpty() ? BigDecimal.ZERO : sellBook.firstKey(); }
            finally { depthLock.unlockRead(stamp); }
        }
        return ask;
    }

    public int getBuyDepth()       { return buyBook.size(); }
    public int getSellDepth()      { return sellBook.size(); }
    public BigDecimal getLastTradePrice() { return lastTradePrice; }  // volatile read
    public long getLastTradeQty()         { return lastTradeQty; }
    public long getTotalVolume()          { return totalVolume; }
    public String getSymbol()             { return symbol; }

    /**
     * Get top N levels of market depth.
     * Uses tryLock to prevent blocking market data threads.
     */
    public Map<String, List<BigDecimal[]>> getMarketDepth(int levels) {
        boolean locked = matchingLock.tryLock();
        try {
            List<BigDecimal[]> bids = new ArrayList<>();
            List<BigDecimal[]> asks = new ArrayList<>();
            int count = 0;
            for (Map.Entry<BigDecimal, Deque<StockOrder>> e : buyBook.entrySet()) {
                if (count++ >= levels) break;
                long totalQty = e.getValue().stream().mapToLong(StockOrder::getRemainingQty).sum();
                bids.add(new BigDecimal[]{e.getKey(), BigDecimal.valueOf(totalQty)});
            }
            count = 0;
            for (Map.Entry<BigDecimal, Deque<StockOrder>> e : sellBook.entrySet()) {
                if (count++ >= levels) break;
                long totalQty = e.getValue().stream().mapToLong(StockOrder::getRemainingQty).sum();
                asks.add(new BigDecimal[]{e.getKey(), BigDecimal.valueOf(totalQty)});
            }
            return Map.of("bids", bids, "asks", asks);
        } finally {
            if (locked) matchingLock.unlock();
        }
    }
}