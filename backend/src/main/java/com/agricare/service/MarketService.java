package com.agricare.service;

import com.agricare.dto.MarketComparisonDto;
import com.agricare.entity.Buyer;
import com.agricare.entity.FPO;
import com.agricare.entity.MarketPrice;
import com.agricare.repository.BuyerRepository;
import com.agricare.repository.FpoRepository;
import com.agricare.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MarketPriceRepository marketPriceRepository;
    private final BuyerRepository buyerRepository;
    private final FpoRepository fpoRepository;

    public List<MarketPrice> getPrices(String crop, String location) {
        if (crop != null && !crop.isBlank()) {
            if (location != null && !location.isBlank()) {
                List<MarketPrice> list = marketPriceRepository.findByCropIgnoreCaseAndDistrictIgnoreCase(crop, location);
                if (!list.isEmpty()) return list;
            }
            return marketPriceRepository.findByCropIgnoreCase(crop);
        }
        if (location != null && !location.isBlank()) {
            return marketPriceRepository.findByDistrictIgnoreCase(location);
        }
        return marketPriceRepository.findAllByOrderByCropAsc();
    }

    public MarketComparisonDto compareOptions(String crop, Double quantityKg) {
        String queryCrop = (crop != null && !crop.isBlank()) ? crop : "Tomato";
        double qty = (quantityKg != null && quantityKg > 0) ? quantityKg : 500.0;
        double quintals = qty / 100.0;

        List<MarketComparisonDto.SellingOption> options = new ArrayList<>();

        // Option 1: Local Mandi
        List<MarketPrice> mandiPrices = marketPriceRepository.findByCropIgnoreCase(queryCrop);
        if (!mandiPrices.isEmpty()) {
            MarketPrice bestMandi = mandiPrices.get(0);
            options.add(MarketComparisonDto.SellingOption.builder()
                    .channelType("Local Mandi / APMC")
                    .entityName(bestMandi.getMarket())
                    .pricePerQuintal(bestMandi.getPrice())
                    .estimatedTotalRevenue(Math.round(bestMandi.getPrice() * quintals * 100.0) / 100.0)
                    .location(bestMandi.getDistrict() + ", " + bestMandi.getState())
                    .notes("Open auction; commission and loading charges may apply.")
                    .verified(true)
                    .build());
        } else {
            options.add(MarketComparisonDto.SellingOption.builder()
                    .channelType("Local Mandi / APMC")
                    .entityName("Guntur APMC Mandi")
                    .pricePerQuintal(2600.0)
                    .estimatedTotalRevenue(Math.round(2600.0 * quintals * 100.0) / 100.0)
                    .location("Guntur, Andhra Pradesh")
                    .notes("Estimated baseline mandi auction rate.")
                    .verified(true)
                    .build());
        }

        // Option 2: Direct Buyer
        List<Buyer> buyers = buyerRepository.findByCrop(queryCrop);
        if (!buyers.isEmpty()) {
            Buyer buyer = buyers.get(0);
            double price = buyer.getOfferedPrice() != null ? buyer.getOfferedPrice() : 2750.0;
            options.add(MarketComparisonDto.SellingOption.builder()
                    .channelType("Direct Food Buyer")
                    .entityName(buyer.getName())
                    .pricePerQuintal(price)
                    .estimatedTotalRevenue(Math.round(price * quintals * 100.0) / 100.0)
                    .location(buyer.getLocation())
                    .notes("Direct farmgate procurement, immediate digital payment.")
                    .verified(buyer.getVerified())
                    .contactPhone(buyer.getPhone())
                    .build());
        } else {
            options.add(MarketComparisonDto.SellingOption.builder()
                    .channelType("Direct Food Buyer")
                    .entityName("ABC Foods Agri Logistics")
                    .pricePerQuintal(2750.0)
                    .estimatedTotalRevenue(Math.round(2750.0 * quintals * 100.0) / 100.0)
                    .location("Guntur Hub")
                    .notes("Procures for pulp & sauce manufacturing.")
                    .verified(true)
                    .contactPhone("+91 98480 12345")
                    .build());
        }

        // Option 3: FPO Procurement
        List<FPO> fpos = fpoRepository.findByCrop(queryCrop);
        if (!fpos.isEmpty()) {
            FPO fpo = fpos.get(0);
            double fpoPrice = 2700.0;
            options.add(MarketComparisonDto.SellingOption.builder()
                    .channelType("FPO Collective Aggregation")
                    .entityName(fpo.getName())
                    .pricePerQuintal(fpoPrice)
                    .estimatedTotalRevenue(Math.round(fpoPrice * quintals * 100.0) / 100.0)
                    .location(fpo.getLocation() + " (" + fpo.getDistanceKm() + " km)")
                    .notes("Member bonus bonus share + collective bargaining power.")
                    .verified(fpo.getVerified())
                    .contactPhone(fpo.getPhone())
                    .build());
        } else {
            options.add(MarketComparisonDto.SellingOption.builder()
                    .channelType("FPO Collective Aggregation")
                    .entityName("Guntur Vegetable Farmer Producer Co.")
                    .pricePerQuintal(2700.0)
                    .estimatedTotalRevenue(Math.round(2700.0 * quintals * 100.0) / 100.0)
                    .location("Guntur Rural (18 km)")
                    .notes("Bulk transport collective + fair weighting.")
                    .verified(true)
                    .contactPhone("+91 86322 55443")
                    .build());
        }

        return MarketComparisonDto.builder()
                .crop(queryCrop)
                .quantityKg(qty)
                .options(options)
                .build();
    }
}
