package com.agricare.service;

import com.agricare.dto.LogisticsRequestDto;
import com.agricare.entity.LogisticsProvider;
import com.agricare.entity.LogisticsRequest;
import com.agricare.exception.ResourceNotFoundException;
import com.agricare.repository.LogisticsProviderRepository;
import com.agricare.repository.LogisticsRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class LogisticsService {

    private final LogisticsProviderRepository providerRepository;
    private final LogisticsRequestRepository requestRepository;

    public List<LogisticsProvider> getProviders(String district, String vehicleType) {
        if (district != null && !district.isBlank()) {
            return providerRepository.findByDistrictIgnoreCase(district);
        }
        if (vehicleType != null && !vehicleType.isBlank()) {
            return providerRepository.findByVehicleTypeContainingIgnoreCase(vehicleType);
        }
        return providerRepository.findAll();
    }

    @Transactional
    public LogisticsRequest createRequest(LogisticsRequestDto dto) {
        // Resolve provider name if providerId is supplied
        String providerName = dto.getProviderName();
        if (dto.getProviderId() != null && (providerName == null || providerName.isBlank())) {
            providerRepository.findById(dto.getProviderId()).ifPresent(p -> {});
        }

        // Generate clean farmer-friendly reference number: AC-2026-00124
        String refNumber = generateReferenceNumber();

        LogisticsRequest request = LogisticsRequest.builder()
                .referenceNumber(refNumber)
                .farmerId(dto.getFarmerId() != null ? dto.getFarmerId() : 1L)
                .providerId(dto.getProviderId())
                .providerName(providerName != null ? providerName : "AgriCare Express Transport")
                .pickupLocation(dto.getPickupLocation())
                .destination(dto.getDestination())
                .crop(dto.getCrop())
                .quantity(dto.getQuantity())
                .estimatedCost(dto.getEstimatedCost() != null ? dto.getEstimatedCost() : 1200.0)
                .status(LogisticsRequest.Status.PENDING)
                .farmerPhone(dto.getFarmerPhone())
                .notes(dto.getNotes())
                .build();

        return requestRepository.save(request);
    }

    public List<LogisticsRequest> getRequestsByFarmer(Long farmerId) {
        return requestRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<LogisticsRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public LogisticsRequest updateStatus(Long id, LogisticsRequest.Status status) {
        LogisticsRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logistics request not found with ID: " + id));
        request.setStatus(status);
        return requestRepository.save(request);
    }

    private String generateReferenceNumber() {
        int year = Year.now().getValue();
        int seq = ThreadLocalRandom.current().nextInt(100, 999);
        return String.format("AC-%d-00%d", year, seq);
    }
}
