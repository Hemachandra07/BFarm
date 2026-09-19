package com.agricare.repository;

import com.agricare.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    List<MarketPrice> findByCropIgnoreCase(String crop);
    List<MarketPrice> findByCropIgnoreCaseAndDistrictIgnoreCase(String crop, String district);
    List<MarketPrice> findByDistrictIgnoreCase(String district);
    List<MarketPrice> findAllByOrderByCropAsc();
}
