package com.stockengine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "MARKET_DATA")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarketData {
    @EmbeddedId private MarketDataId id;
    @Column(name="LTP")         private BigDecimal ltp;
    @Column(name="OPEN_PRICE")  private BigDecimal openPrice;
    @Column(name="HIGH_PRICE")  private BigDecimal highPrice;
    @Column(name="LOW_PRICE")   private BigDecimal lowPrice;
    @Column(name="CLOSE_PRICE") private BigDecimal closePrice;
    @Column(name="VOLUME")      private Long volume;
    @Column(name="BID_PRICE")   private BigDecimal bidPrice;
    @Column(name="ASK_PRICE")   private BigDecimal askPrice;
    @Column(name="BID_QTY")     private Long bidQty;
    @Column(name="ASK_QTY")     private Long askQty;
    @Column(name="CIRCUIT_HIGH")private BigDecimal circuitHigh;
    @Column(name="CIRCUIT_LOW") private BigDecimal circuitLow;
    @Column(name="WEEK_52_HIGH")private BigDecimal week52High;
    @Column(name="WEEK_52_LOW") private BigDecimal week52Low;
    @Column(name="PE_RATIO")    private BigDecimal peRatio;
    @Column(name="UPDATED_AT")  private LocalDateTime updatedAt;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class MarketDataId implements java.io.Serializable {
        @Column(name="SYMBOL")   private String symbol;
        @Column(name="EXCHANGE") private String exchange;
    }
}