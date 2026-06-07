package com.stockengine.service.matching;

import com.stockengine.entity.StockOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @AllArgsConstructor
public class MatchResult {
    private StockOrder buyOrder;
    private StockOrder sellOrder;
    private BigDecimal executionPrice;
    private long       matchedQuantity;
    private String     symbol;
    private final LocalDateTime matchedAt = LocalDateTime.now();
}