package com.stockengine.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder(toBuilder=true) @JsonInclude(JsonInclude.Include.NON_NULL)
public class MarketTickDto {
    private String     symbol;
    private String     exchange;
    private BigDecimal ltp;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal close;
    private Long       volume;
    private BigDecimal bid;
    private BigDecimal ask;
    private BigDecimal changeAmt;
    private BigDecimal changePct;
    private BigDecimal circuitHigh;
    private BigDecimal circuitLow;
    private BigDecimal week52High;
    private BigDecimal week52Low;
    private BigDecimal peRatio;
    private LocalDateTime updatedAt;
}