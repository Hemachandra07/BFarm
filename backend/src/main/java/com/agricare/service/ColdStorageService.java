package com.agricare.service;

import com.agricare.entity.ColdStorage;
import com.agricare.repository.ColdStorageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColdStorageService {

    private final ColdStorageRepository coldStorageRepository;

    public List<ColdStorage> getColdStorages(String crop, String district) {
        if (crop != null && !crop.isBlank()) {
            return coldStorageRepository.findByCrop(crop);
        }
        if (district != null && !district.isBlank()) {
            return coldStorageRepository.findByDistrictIgnoreCase(district);
        }
        return coldStorageRepository.findAll();
    }
}
