package com.project.backend.Repository;

import com.project.backend.model.ResponsableStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResponsableStageRepository extends JpaRepository<ResponsableStage,Long> {
    ResponsableStage findByEmail(String email);
}
