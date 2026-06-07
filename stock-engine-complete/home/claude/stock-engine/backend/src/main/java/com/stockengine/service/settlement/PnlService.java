package com.stockengine.service.settlement;

import com.stockengine.dto.PortfolioDto;
import com.stockengine.entity.Position;
import com.stockengine.repository.MarketDataRepository;
import com.stockengine.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.*;

/**
 * CONCEPTS: ForkJoinPool, RecursiveTask, CompletableFuture.allOf
 *
 * P&L computation uses ForkJoinPool for parallel processing:
 *   - Split positions array in half recursively
 *   - Fork left half (runs on another thread), compute right inline
 *   - Join left result and combine
 *
 * This uses ALL available CPU cores for large portfolios.
 * ForkJoinPool.commonPool() is used by parallel streams; our custom pool
 * avoids contention with Spring's other async tasks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PnlService {

    private final PositionRepository   positionRepo;
    private final MarketDataRepository marketDataRepo;

    @Qualifier("pnlForkJoinPool")
    private final ForkJoinPool pnlPool;

    /**
     * Compute portfolio P&L using ForkJoinPool parallel sum.
     */
    public PortfolioDto computePortfolio(Long accountId) {
        List<Position> positions = positionRepo.findByAccountId(accountId);
        if (positions.isEmpty()) {
            return PortfolioDto.empty(accountId);
        }

        // Submit RecursiveTask to ForkJoinPool
        BigDecimal totalUnrealized = pnlPool.invoke(
            new UnrealizedPnlTask(positions, 0, positions.size(), marketDataRepo));

        BigDecimal totalRealized = positions.stream()
            .map(Position::getRealizedPnl)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal investedValue = positions.stream()
            .filter(p -> p.getNetQty() > 0)
            .map(p -> p.getAvgBuyPrice().multiply(BigDecimal.valueOf(p.getNetQty())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PortfolioDto.builder()
            .accountId(accountId)
            .positionCount(positions.size())
            .investedValue(investedValue)
            .currentValue(investedValue.add(totalUnrealized))
            .unrealizedPnl(totalUnrealized)
            .realizedPnl(totalRealized)
            .totalPnl(totalUnrealized.add(totalRealized))
            .returnPct(investedValue.compareTo(BigDecimal.ZERO) > 0
                ? totalUnrealized.divide(investedValue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO)
            .build();
    }

    /**
     * RecursiveTask: divide-and-conquer P&L computation.
     * Splits array in halves until size <= THRESHOLD, then computes directly.
     */
    private static class UnrealizedPnlTask extends RecursiveTask<BigDecimal> {
        private static final int THRESHOLD = 10;
        private final List<Position>       positions;
        private final int                   start, end;
        private final MarketDataRepository  mktRepo;

        UnrealizedPnlTask(List<Position> p, int s, int e, MarketDataRepository r) {
            positions = p; start = s; end = e; mktRepo = r;
        }

        @Override
        protected BigDecimal compute() {
            if (end - start <= THRESHOLD) {
                // Base case: compute directly
                BigDecimal sum = BigDecimal.ZERO;
                for (int i = start; i < end; i++) {
                    Position pos = positions.get(i);
                    if (pos.getNetQty() <= 0) continue;
                    mktRepo.findById(new com.stockengine.entity.MarketData.MarketDataId(pos.getSymbol(), pos.getExchange()))
                        .ifPresent(md -> {
                            BigDecimal ltp = md.getLtp();
                            BigDecimal unrealized = ltp.subtract(pos.getAvgBuyPrice())
                                .multiply(BigDecimal.valueOf(pos.getNetQty()));
                            pos.setUnrealizedPnl(unrealized);
                        });
                    sum = sum.add(pos.getUnrealizedPnl() != null ? pos.getUnrealizedPnl() : BigDecimal.ZERO);
                }
                return sum;
            }
            // Recursive case: split and fork
            int mid = (start + end) / 2;
            UnrealizedPnlTask left  = new UnrealizedPnlTask(positions, start, mid, mktRepo);
            UnrealizedPnlTask right = new UnrealizedPnlTask(positions, mid, end, mktRepo);
            left.fork();                    // runs on another ForkJoin thread
            return right.compute().add(left.join());  // right inline, join left
        }
    }
}