package com.agricare.repository;

import com.agricare.entity.StorageBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StorageBookingRepository extends JpaRepository<StorageBooking, Long> {
    List<StorageBooking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<StorageBooking> findByStorageIdOrderByCreatedAtDesc(Long storageId);
    List<StorageBooking> findAllByOrderByCreatedAtDesc();
    Optional<StorageBooking> findByBookingNumber(String bookingNumber);
}
