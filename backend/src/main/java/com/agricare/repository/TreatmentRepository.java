package com.agricare.repository;

import com.agricare.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findByDiseaseId(Long diseaseId);
    Optional<Treatment> findByDiseaseIdAndLanguage(Long diseaseId, String language);
}
