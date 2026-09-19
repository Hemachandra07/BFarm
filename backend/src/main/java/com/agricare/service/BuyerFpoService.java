package com.agricare.service;

import com.agricare.entity.Buyer;
import com.agricare.entity.FPO;
import com.agricare.repository.BuyerRepository;
import com.agricare.repository.FpoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuyerFpoService {

    private final BuyerRepository buyerRepository;
    private final FpoRepository fpoRepository;

    public List<Buyer> getBuyers(String crop, String district) {
        if (crop != null && !crop.isBlank()) {
            return buyerRepository.findByCrop(crop);
        }
        if (district != null && !district.isBlank()) {
            return buyerRepository.findByDistrictIgnoreCase(district);
        }
        return buyerRepository.findAll();
    }

    public List<FPO> getFpos(String crop, String district) {
        if (crop != null && !crop.isBlank()) {
            return fpoRepository.findByCrop(crop);
        }
        if (district != null && !district.isBlank()) {
            return fpoRepository.findByDistrictIgnoreCase(district);
        }
        return fpoRepository.findAll();
    }
}
