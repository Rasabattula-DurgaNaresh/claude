package com.stockengine.repository;

import com.stockengine.entity.MarketData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketDataRepository extends JpaRepository<MarketData, MarketData.MarketDataId> {}