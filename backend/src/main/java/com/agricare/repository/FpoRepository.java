package com.agricare.repository;

import com.agricare.entity.FPO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FpoRepository extends JpaRepository<FPO, Long> {
    @Query("SELECT f FROM FPO f WHERE LOWER(f.crops) LIKE LOWER(CONCAT('%', :crop, '%'))")
    List<FPO> findByCrop(@Param("crop") String crop);

    List<FPO> findByDistrictIgnoreCase(String district);
}
