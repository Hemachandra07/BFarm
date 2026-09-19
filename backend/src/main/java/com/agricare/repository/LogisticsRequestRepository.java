package com.agricare.repository;

import com.agricare.entity.LogisticsRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LogisticsRequestRepository extends JpaRepository<LogisticsRequest, Long> {
    List<LogisticsRequest> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    Optional<LogisticsRequest> findByReferenceNumber(String referenceNumber);
    List<LogisticsRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(LogisticsRequest.Status status);
}
