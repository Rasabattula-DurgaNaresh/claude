package com.stockengine.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class PortfolioDto {
    private Long       accountId;
    private int        positionCount;
    private BigDecimal investedValue;
    private BigDecimal currentValue;
    private BigDecimal unrealizedPnl;
    private BigDecimal realizedPnl;
    private BigDecimal totalPnl;
    private BigDecimal returnPct;

    public static PortfolioDto empty(Long accountId) {
        return PortfolioDto.builder()
            .accountId(accountId).positionCount(0)
            .investedValue(BigDecimal.ZERO).currentValue(BigDecimal.ZERO)
            .unrealizedPnl(BigDecimal.ZERO).realizedPnl(BigDecimal.ZERO)
            .totalPnl(BigDecimal.ZERO).returnPct(BigDecimal.ZERO)
            .build();
    }
}