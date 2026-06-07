package com.stockengine.repository;

import com.stockengine.entity.StockOrder;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<StockOrder, Long> {
    Optional<StockOrder> findByOrderRef(String ref);
    Page<StockOrder> findByClientIdOrderBySubmittedAtDesc(String clientId, Pageable pageable);
    List<StockOrder> findByClientIdAndStatusIn(String clientId, List<String> statuses);

    @Query("SELECT o FROM StockOrder o WHERE o.symbol = :sym AND o.status IN ('OPEN','PENDING') ORDER BY o.submittedAt")
    List<StockOrder> findOpenOrders(@Param("sym") String symbol);

    @Query("SELECT COUNT(o) FROM StockOrder o WHERE o.clientId = :cid AND o.status = 'FILLED'")
    long countFilledByClient(@Param("cid") String clientId);
}