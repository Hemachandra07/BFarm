package com.agricare.repository;

import com.agricare.entity.ProduceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduceListingRepository extends JpaRepository<ProduceListing, Long> {
    List<ProduceListing> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<ProduceListing> findByStatusOrderByCreatedAtDesc(ProduceListing.Status status);
    List<ProduceListing> findAllByOrderByCreatedAtDesc();
    List<ProduceListing> findByCropIgnoreCaseAndStatus(String crop, ProduceListing.Status status);
    List<ProduceListing> findByDistrictIgnoreCaseAndStatus(String district, ProduceListing.Status status);
}
