package com.stockengine.repository;

import com.stockengine.entity.TradingAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<TradingAccount, Long> {
    Optional<TradingAccount> findByClientId(String clientId);
    boolean existsByClientId(String clientId);
}