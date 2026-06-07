package com.stockengine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "STOCK_ORDERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockOrder {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_ord")
    @SequenceGenerator(name="seq_ord", sequenceName="SEQ_ORDERS", allocationSize=100)
    @Column(name="ORDER_ID")           private Long orderId;
    @Column(name="ORDER_REF")          private String orderRef;
    @Column(name="ACCOUNT_ID")         private Long accountId;
    @Column(name="CLIENT_ID")          private String clientId;
    @Column(name="SYMBOL")             private String symbol;
    @Column(name="EXCHANGE")           private String exchange;
    @Column(name="ORDER_TYPE")         private String orderType;
    @Column(name="SIDE")               private String side;
    @Column(name="QUANTITY")           private Long quantity;
    @Column(name="FILLED_QTY")         private Long filledQty;
    @Column(name="REMAINING_QTY")      private Long remainingQty;
    @Column(name="PRICE")              private BigDecimal price;
    @Column(name="TRIGGER_PRICE")      private BigDecimal triggerPrice;
    @Column(name="AVG_FILL_PRICE")     private BigDecimal avgFillPrice;
    @Column(name="STATUS")             private String status;
    @Column(name="VALIDITY")           private String validity;
    @Column(name="PRODUCT")            private String product;
    @Column(name="REJECTION_REASON")   private String rejectionReason;
    @Column(name="SUBMITTED_AT")       private LocalDateTime submittedAt;
    @Column(name="MATCHED_AT")         private LocalDateTime matchedAt;
    @Column(name="CANCELLED_AT")       private LocalDateTime cancelledAt;
    @Column(name="CREATED_BY")         private String createdBy;
}