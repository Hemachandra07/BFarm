package com.agricare.repository;

import com.agricare.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {
    List<Diagnosis> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Diagnosis> findAllByOrderByCreatedAtDesc();

    @Query("SELECT d.crop, COUNT(d) as count FROM Diagnosis d GROUP BY d.crop ORDER BY count DESC")
    List<Object[]> findTopCrops();

    @Query("SELECT d.disease, COUNT(d) as count FROM Diagnosis d GROUP BY d.disease ORDER BY count DESC")
    List<Object[]> findTopDiseases();
}
