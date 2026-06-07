package com.stockengine.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDto {
    private Long       orderId;
    private String     orderRef;
    private String     clientId;
    private String     symbol;
    private String     exchange;
    private String     orderType;
    private String     side;
    private Long       quantity;
    private Long       filledQty;
    private Long       remainingQty;
    private BigDecimal price;
    private BigDecimal avgFillPrice;
    private String     status;
    private String     validity;
    private String     product;
    private String     rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime matchedAt;
}