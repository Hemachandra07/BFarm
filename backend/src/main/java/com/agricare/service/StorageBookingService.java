package com.agricare.service;

import com.agricare.entity.ColdStorage;
import com.agricare.entity.StorageBooking;
import com.agricare.repository.ColdStorageRepository;
import com.agricare.repository.StorageBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageBookingService {

    private final StorageBookingRepository bookingRepository;
    private final ColdStorageRepository coldStorageRepository;

    @Transactional
    public StorageBooking createBooking(StorageBooking booking) {
        if (booking.getBookingNumber() == null || booking.getBookingNumber().isBlank()) {
            booking.setBookingNumber("SB-" + System.currentTimeMillis() % 1000000);
        }
        if (booking.getStatus() == null) {
            booking.setStatus(StorageBooking.Status.REQUESTED);
        }
        return bookingRepository.save(booking);
    }

    public List<StorageBooking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<StorageBooking> getStorageBookings(Long storageId) {
        return bookingRepository.findByStorageIdOrderByCreatedAtDesc(storageId);
    }

    public List<StorageBooking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public StorageBooking updateBookingStatus(Long bookingId, StorageBooking.Status status) {
        StorageBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Storage booking not found: " + bookingId));
        booking.setStatus(status);

        // If approved/stored, deduct available capacity
        if (status == StorageBooking.Status.APPROVED || status == StorageBooking.Status.STORED) {
            coldStorageRepository.findById(booking.getStorageId()).ifPresent(cs -> {
                double newAvail = Math.max(0, (cs.getAvailableCapacity() != null ? cs.getAvailableCapacity() : 0) - booking.getQuantityMt());
                cs.setAvailableCapacity(newAvail);
                coldStorageRepository.save(cs);
            });
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public ColdStorage updateStorageCapacity(Long storageId, Double availableCapacity) {
        ColdStorage cs = coldStorageRepository.findById(storageId)
                .orElseThrow(() -> new RuntimeException("Cold storage not found: " + storageId));
        cs.setAvailableCapacity(availableCapacity);
        return coldStorageRepository.save(cs);
    }
}
