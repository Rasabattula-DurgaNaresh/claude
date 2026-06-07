package com.stockengine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "TRADES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trade {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_trade")
    @SequenceGenerator(name="seq_trade", sequenceName="SEQ_TRADES", allocationSize=100)
    @Column(name="TRADE_ID")           private Long tradeId;
    @Column(name="TRADE_REF")          private String tradeRef;
    @Column(name="BUY_ORDER_ID")       private Long buyOrderId;
    @Column(name="SELL_ORDER_ID")      private Long sellOrderId;
    @Column(name="BUY_ACCOUNT_ID")     private Long buyAccountId;
    @Column(name="SELL_ACCOUNT_ID")    private Long sellAccountId;
    @Column(name="SYMBOL")             private String symbol;
    @Column(name="EXCHANGE")           private String exchange;
    @Column(name="QUANTITY")           private Long quantity;
    @Column(name="PRICE")              private BigDecimal price;
    @Column(name="TRADE_VALUE")        private BigDecimal tradeValue;
    @Column(name="BROKERAGE_BUY")      private BigDecimal brokerageBuy;
    @Column(name="BROKERAGE_SELL")     private BigDecimal brokerageSell;
    @Column(name="STT")                private BigDecimal stt;
    @Column(name="GST")                private BigDecimal gst;
    @Column(name="SETTLEMENT_STATUS")  private String settlementStatus;
    @Column(name="EXECUTED_AT")        private LocalDateTime executedAt;
    @Column(name="SETTLED_AT")         private LocalDateTime settledAt;
    @Column(name="THREAD_NAME")        private String threadName; // which thread matched this
}