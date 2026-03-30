package com.project.backend.Repository;

import com.project.backend.model.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findByCandidate_Id(Long candidateId);
    List<Candidature> findByCandidate_IdAndStatut(Long candidateId, String statut);
    List<Candidature> findByCandidate_IdAndSujetStage_Id(Long candidateId, Long sujetStageId);
    List<Candidature> findBySujetStage_Id(Long sujetId);
}
