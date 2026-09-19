package com.agricare.service;

import com.agricare.entity.ProduceListing;
import com.agricare.entity.ProduceOrder;
import com.agricare.repository.ProduceListingRepository;
import com.agricare.repository.ProduceOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProduceMarketplaceService {

    private final ProduceListingRepository listingRepository;
    private final ProduceOrderRepository orderRepository;

    public ProduceListing createListing(ProduceListing listing) {
        if (listing.getStatus() == null) {
            listing.setStatus(ProduceListing.Status.AVAILABLE);
        }
        return listingRepository.save(listing);
    }

    public List<ProduceListing> getAvailableListings() {
        return listingRepository.findByStatusOrderByCreatedAtDesc(ProduceListing.Status.AVAILABLE);
    }

    public List<ProduceListing> getAllListings() {
        return listingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ProduceListing> getFarmerListings(Long farmerId) {
        return listingRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public ProduceListing getListingById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produce listing not found: " + id));
    }

    public List<ProduceListing> filterListings(String crop, String district) {
        if (crop != null && !crop.isBlank()) {
            return listingRepository.findByCropIgnoreCaseAndStatus(crop, ProduceListing.Status.AVAILABLE);
        }
        if (district != null && !district.isBlank()) {
            return listingRepository.findByDistrictIgnoreCaseAndStatus(district, ProduceListing.Status.AVAILABLE);
        }
        return getAvailableListings();
    }

    @Transactional
    public ProduceOrder submitPurchaseOffer(ProduceOrder order) {
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber("ORD-" + System.currentTimeMillis() % 1000000);
        }
        if (order.getStatus() == null) {
            order.setStatus(ProduceOrder.Status.OFFERED);
        }
        if (order.getQuantityKg() != null && order.getOfferedPricePerQuintal() != null) {
            order.setTotalAmount((order.getQuantityKg() / 100.0) * order.getOfferedPricePerQuintal());
        }

        if (order.getListingId() != null) {
            listingRepository.findById(order.getListingId()).ifPresent(listing -> {
                listing.setStatus(ProduceListing.Status.NEGOTIATING);
                listingRepository.save(listing);
            });
        }

        return orderRepository.save(order);
    }

    @Transactional
    public ProduceOrder acceptOffer(Long orderId) {
        ProduceOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(ProduceOrder.Status.ACCEPTED);

        if (order.getListingId() != null) {
            listingRepository.findById(order.getListingId()).ifPresent(listing -> {
                listing.setStatus(ProduceListing.Status.SOLD);
                listingRepository.save(listing);
            });
        }

        return orderRepository.save(order);
    }

    @Transactional
    public ProduceOrder rejectOffer(Long orderId) {
        ProduceOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(ProduceOrder.Status.REJECTED);

        if (order.getListingId() != null) {
            listingRepository.findById(order.getListingId()).ifPresent(listing -> {
                listing.setStatus(ProduceListing.Status.AVAILABLE);
                listingRepository.save(listing);
            });
        }

        return orderRepository.save(order);
    }

    @Transactional
    public ProduceOrder updateOrderStatus(Long orderId, ProduceOrder.Status newStatus, String logisticsRef) {
        ProduceOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(newStatus);
        if (logisticsRef != null && !logisticsRef.isBlank()) {
            order.setLogisticsReference(logisticsRef);
        }
        return orderRepository.save(order);
    }

    public List<ProduceOrder> getFarmerOrders(Long farmerId) {
        return orderRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<ProduceOrder> getBuyerOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<ProduceOrder> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}
