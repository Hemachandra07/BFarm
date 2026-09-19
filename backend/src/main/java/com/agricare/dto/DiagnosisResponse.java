package com.agricare.dto;

import com.agricare.entity.Treatment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisResponse {
    private Long id;
    private Long userId;
    private String crop;
    private String disease;
    private Double confidence;
    private String severity;
    private String findings;
    private String imageUrl;
    private boolean isUncertain;
    private String uncertaintyWarning;
    private Treatment treatment;
    private List<String> treatmentSteps;
    private String preventionTips;
    private String chemicalWarning;
    private LocalDateTime createdAt;
}
