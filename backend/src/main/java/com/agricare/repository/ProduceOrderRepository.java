package com.agricare.repository;

import com.agricare.entity.ProduceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProduceOrderRepository extends JpaRepository<ProduceOrder, Long> {
    List<ProduceOrder> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<ProduceOrder> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<ProduceOrder> findByListingIdOrderByCreatedAtDesc(Long listingId);
    List<ProduceOrder> findAllByOrderByCreatedAtDesc();
    Optional<ProduceOrder> findByOrderNumber(String orderNumber);
}
