package com.agricare.repository;

import com.agricare.entity.ColdStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColdStorageRepository extends JpaRepository<ColdStorage, Long> {
    @Query("SELECT c FROM ColdStorage c WHERE LOWER(c.supportedCrops) LIKE LOWER(CONCAT('%', :crop, '%'))")
    List<ColdStorage> findByCrop(@Param("crop") String crop);

    List<ColdStorage> findByDistrictIgnoreCase(String district);

    java.util.Optional<ColdStorage> findByOwnerId(Long ownerId);

    java.util.Optional<ColdStorage> findByPhone(String phone);
}
