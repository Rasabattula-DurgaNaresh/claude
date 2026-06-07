package com.stockengine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "TRADING_ACCOUNTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TradingAccount {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_acc")
    @SequenceGenerator(name="seq_acc", sequenceName="SEQ_ACCOUNTS", allocationSize=50)
    @Column(name="ACCOUNT_ID")                private Long   accountId;
    @Column(name="CLIENT_ID", unique=true)     private String clientId;
    @Column(name="CLIENT_NAME")               private String clientName;
    @Column(name="EMAIL",     unique=true)     private String email;
    @Column(name="CASH_BALANCE")              private BigDecimal cashBalance;
    @Column(name="BLOCKED_AMOUNT")            private BigDecimal blockedAmount;
    @Column(name="DAILY_MTM")                 private BigDecimal dailyMtm;
    @Column(name="STATUS")                    private String status;
    @Column(name="SEGMENT")                   private String segment;
    @Version @Column(name="VERSION_NUM")      private Long   version;
    @Column(name="CREATED_AT")               private LocalDateTime createdAt;
    @Column(name="UPDATED_AT")               private LocalDateTime updatedAt;
}