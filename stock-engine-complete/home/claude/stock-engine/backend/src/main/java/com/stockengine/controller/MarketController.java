package com.stockengine.controller;

import com.stockengine.dto.MarketTickDto;
import com.stockengine.repository.TradeRepository;
import com.stockengine.service.market.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@Tag(name = "Market Data")
public class MarketController {

    private final MarketDataService  marketDataService;
    private final TradeRepository    tradeRepo;

    @GetMapping("/ticks")
    @Operation(summary = "Get live market data for all symbols")
    public ResponseEntity<List<MarketTickDto>> getAllTicks() {
        return ResponseEntity.ok(marketDataService.getAllTicks());
    }

    @GetMapping("/ticks/{symbol}")
    @Operation(summary = "Get live market data for a specific symbol")
    public ResponseEntity<MarketTickDto> getTick(@PathVariable String symbol) {
        return marketDataService.getTick(symbol)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trades/{symbol}")
    @Operation(summary = "Get recent trades for a symbol (paginated)")
    public ResponseEntity<?> getTradesBySymbol(
            @PathVariable String symbol,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(tradeRepo.findBySymbolOrderByExecutedAtDesc(symbol, pageable));
    }

    @GetMapping("/trades/threads")
    @Operation(summary = "Get trade count by executing thread (demonstrates thread distribution)")
    public ResponseEntity<List<Object[]>> getTradesByThread() {
        return ResponseEntity.ok(tradeRepo.getTradesByThread());
    }

    @GetMapping("/stats")
    @Operation(summary = "Market-wide statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
            "totalTrades", tradeRepo.count(),
            "tradesLast5Min", tradeRepo.countSince(LocalDateTime.now().minusMinutes(5)),
            "tickCount", marketDataService.getTickCount(),
            "symbols", marketDataService.getAllTicks().size()
        ));
    }
}