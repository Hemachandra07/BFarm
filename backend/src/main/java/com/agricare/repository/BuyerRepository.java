package com.agricare.repository;

import com.agricare.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    @Query("SELECT b FROM Buyer b WHERE LOWER(b.crops) LIKE LOWER(CONCAT('%', :crop, '%'))")
    List<Buyer> findByCrop(@Param("crop") String crop);

    List<Buyer> findByDistrictIgnoreCase(String district);
}
