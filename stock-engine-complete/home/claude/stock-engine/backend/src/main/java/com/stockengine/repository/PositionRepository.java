package com.stockengine.repository;

import com.stockengine.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position>    findByAccountId(Long accountId);
    Optional<Position> findByAccountIdAndSymbolAndProduct(Long accountId, String symbol, String product);
}