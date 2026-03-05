package com.project.backend.Repository;

import com.project.backend.model.Entretien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntretienRepository extends JpaRepository<Entretien,Long> {
    void deleteBySujetStageId(Long sujetStageId);
}
