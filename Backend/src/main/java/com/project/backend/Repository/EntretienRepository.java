package com.project.backend.Repository;

import com.project.backend.model.Entretien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntretienRepository extends JpaRepository<Entretien,Long> {
    List<Entretien> findByDisponibleTrue();
    List<Entretien> findByCandidatureIsNotNull();


}
