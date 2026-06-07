package com.stockengine.repository;

import com.stockengine.entity.Trade;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    Page<Trade> findBySymbolOrderByExecutedAtDesc(String symbol, Pageable pageable);

    List<Trade> findByBuyAccountIdOrSellAccountIdOrderByExecutedAtDesc(
        Long buyAccId, Long sellAccId);

    @Query("SELECT SUM(t.tradeValue) FROM Trade t WHERE t.symbol = :sym AND t.executedAt >= :since")
    BigDecimal getTurnover(@Param("sym") String symbol, @Param("since") LocalDateTime since);

    @Query("SELECT t.threadName, COUNT(t) FROM Trade t GROUP BY t.threadName ORDER BY COUNT(t) DESC")
    List<Object[]> getTradesByThread();

    @Query("SELECT COUNT(t) FROM Trade t WHERE t.executedAt >= :since")
    long countSince(@Param("since") LocalDateTime since);
}