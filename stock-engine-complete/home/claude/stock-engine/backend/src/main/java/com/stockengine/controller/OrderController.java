package com.stockengine.controller;

import com.stockengine.dto.*;
import com.stockengine.service.OrderService;
import com.stockengine.service.matching.MatchingEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management")
public class OrderController {

    private final OrderService    orderService;
    private final MatchingEngine  matchingEngine;

    @PostMapping
    @Operation(summary = "Place a new order (synchronous — returns immediately with order status)")
    public ResponseEntity<OrderDto> placeOrder(@RequestBody @Valid PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(req));
    }

    @DeleteMapping("/{orderId}")
    @Operation(summary = "Cancel an open order")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam String clientId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, clientId));
    }

    @GetMapping
    @Operation(summary = "Get order history for a client (paginated)")
    public ResponseEntity<Page<OrderDto>> getOrders(
            @RequestParam String clientId,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(orderService.getOrders(clientId, page, size));
    }

    @GetMapping("/open")
    @Operation(summary = "Get all open orders for a client")
    public ResponseEntity<List<OrderDto>> getOpenOrders(@RequestParam String clientId) {
        return ResponseEntity.ok(orderService.getOpenOrders(clientId));
    }

    @GetMapping("/engine/stats")
    @Operation(summary = "Get matching engine statistics (thread metrics)")
    public ResponseEntity<Map<String, Object>> engineStats() {
        return ResponseEntity.ok(matchingEngine.getEngineStats());
    }

    @GetMapping("/engine/book/{symbol}")
    @Operation(summary = "Get order book and market depth for a symbol")
    public ResponseEntity<Map<String, Object>> orderBook(@PathVariable String symbol) {
        return ResponseEntity.ok(matchingEngine.getBookStats(symbol));
    }
}