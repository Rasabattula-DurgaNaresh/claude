package com.stockengine.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PlaceOrderRequest {
    @NotBlank                      private String clientId;
    @NotBlank @Size(max=20)        private String symbol;
    @NotBlank                      private String exchange;
    @NotBlank                      private String orderType;   // MARKET, LIMIT, STOP_LOSS
    @NotBlank                      private String side;        // BUY, SELL
    @Positive                      private Long   quantity;
    @DecimalMin("0.01")            private BigDecimal price;   // null for MARKET
    @DecimalMin("0.01")            private BigDecimal triggerPrice;
    private String validity   = "DAY";
    private String product    = "CNC";
    private Long   disclosedQty;
}