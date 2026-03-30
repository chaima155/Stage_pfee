package com.project.backend.Repository;

import com.project.backend.model.SujetStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SujetStageRepository extends JpaRepository<SujetStage, Long> {
}
