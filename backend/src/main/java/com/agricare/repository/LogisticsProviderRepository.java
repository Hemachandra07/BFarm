package com.agricare.repository;

import com.agricare.entity.LogisticsProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogisticsProviderRepository extends JpaRepository<LogisticsProvider, Long> {
    List<LogisticsProvider> findByDistrictIgnoreCase(String district);
    List<LogisticsProvider> findByVehicleTypeContainingIgnoreCase(String vehicleType);
    java.util.Optional<LogisticsProvider> findByOwnerId(Long ownerId);
    java.util.Optional<LogisticsProvider> findByPhone(String phone);
}
