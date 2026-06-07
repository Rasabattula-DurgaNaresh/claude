package com.stockengine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "POSITIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Position {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_pos")
    @SequenceGenerator(name="seq_pos", sequenceName="SEQ_POSITIONS", allocationSize=50)
    @Column(name="POSITION_ID")        private Long positionId;
    @Column(name="ACCOUNT_ID")         private Long accountId;
    @Column(name="SYMBOL")             private String symbol;
    @Column(name="EXCHANGE")           private String exchange;
    @Column(name="PRODUCT")            private String product;
    @Column(name="NET_QTY")            private Long netQty;
    @Column(name="BUY_QTY")            private Long buyQty;
    @Column(name="SELL_QTY")           private Long sellQty;
    @Column(name="AVG_BUY_PRICE")      private BigDecimal avgBuyPrice;
    @Column(name="AVG_SELL_PRICE")     private BigDecimal avgSellPrice;
    @Column(name="REALIZED_PNL")       private BigDecimal realizedPnl;
    @Column(name="UNREALIZED_PNL")     private BigDecimal unrealizedPnl;
    @Column(name="DAY_CHANGE_PCT")     private BigDecimal dayChangePct;
    @Column(name="LAST_UPDATED")       private LocalDateTime lastUpdated;
}