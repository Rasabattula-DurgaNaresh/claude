package com.stockengine.controller;

import com.stockengine.dto.PortfolioDto;
import com.stockengine.entity.*;
import com.stockengine.repository.*;
import com.stockengine.service.settlement.PnlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account & Portfolio")
public class AccountController {

    private final AccountRepository  accountRepo;
    private final PositionRepository positionRepo;
    private final PnlService         pnlService;
    private final TradeRepository    tradeRepo;

    @GetMapping
    @Operation(summary = "Get all trading accounts")
    public ResponseEntity<List<TradingAccount>> getAll() {
        return ResponseEntity.ok(accountRepo.findAll());
    }

    @GetMapping("/{clientId}")
    @Operation(summary = "Get account by client ID")
    public ResponseEntity<TradingAccount> getByClientId(@PathVariable String clientId) {
        return accountRepo.findByClientId(clientId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{clientId}/positions")
    @Operation(summary = "Get positions for an account")
    public ResponseEntity<List<Position>> getPositions(@PathVariable String clientId) {
        return accountRepo.findByClientId(clientId)
            .map(acc -> ResponseEntity.ok(positionRepo.findByAccountId(acc.getAccountId())))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{clientId}/portfolio")
    @Operation(summary = "Get portfolio P&L (computed via ForkJoinPool)")
    public ResponseEntity<PortfolioDto> getPortfolio(@PathVariable String clientId) {
        return accountRepo.findByClientId(clientId)
            .map(acc -> ResponseEntity.ok(pnlService.computePortfolio(acc.getAccountId())))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{clientId}/trades")
    @Operation(summary = "Get trade history for an account")
    public ResponseEntity<List<Trade>> getTrades(@PathVariable String clientId) {
        return accountRepo.findByClientId(clientId)
            .map(acc -> ResponseEntity.ok(
                tradeRepo.findByBuyAccountIdOrSellAccountIdOrderByExecutedAtDesc(
                    acc.getAccountId(), acc.getAccountId())))
            .orElse(ResponseEntity.notFound().build());
    }
}