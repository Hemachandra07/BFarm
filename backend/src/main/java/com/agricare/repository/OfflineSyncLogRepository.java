package com.agricare.repository;

import com.agricare.entity.OfflineSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfflineSyncLogRepository extends JpaRepository<OfflineSyncLog, Long> {
    Optional<OfflineSyncLog> findByClientRequestId(String clientRequestId);
    boolean existsByClientRequestId(String clientRequestId);
}
