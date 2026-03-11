package com.project.backend.Controller;

import com.project.backend.Repository.SujetStageRepository;
import com.project.backend.model.SujetStage;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("api/sujets")
public class SujetStageController {
    private final SujetStageRepository sujetStageRepository;

    public SujetStageController(SujetStageRepository sujetStageRepository) {
        this.sujetStageRepository = sujetStageRepository;
    }

    @PostMapping
    public ResponseEntity<SujetStage> createSujet(@RequestBody SujetStage sujet) {
        SujetStage savedSujet = sujetStageRepository.save(sujet);
        return new ResponseEntity<>(savedSujet, HttpStatus.CREATED);
    }

    @GetMapping
    public List<SujetStage> getAllSujets() {
        return sujetStageRepository.findAll();
    }

    // Lire un sujet par id
    @GetMapping("/{id}")
    public SujetStage getSujetById(@PathVariable Long id) {
        return sujetStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));
    }

    // Mettre à jour un sujet
    @PutMapping("/{id}")
    public ResponseEntity<SujetStage> updateSujet(@PathVariable Long id, @RequestBody SujetStage sujetStage) {
        Optional<SujetStage> sujetsStage = sujetStageRepository.findById(id);

        if (sujetsStage.isPresent()) {
            SujetStage existingSujet = sujetsStage.get();
            existingSujet.setTitre(sujetStage.getTitre());
            existingSujet.setDescription(sujetStage.getDescription());
            existingSujet.setMotsCles(sujetStage.getMotsCles());
            existingSujet.setNbrStagiaires(sujetStage.getNbrStagiaires());
            existingSujet.setNiveau(sujetStage.getNiveau());
            existingSujet.setDuree(sujetStage.getDuree());
            existingSujet.setTechnologies(sujetStage.getTechnologies());
            existingSujet.setDateposte(sujetStage.getDateposte());

            SujetStage updatedSujet = sujetStageRepository.save(existingSujet);

            return new ResponseEntity<>(updatedSujet, HttpStatus.OK);

        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }}

    // Supprimer un sujet
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSujet(@PathVariable Long id) {
        try {
            sujetStageRepository.deleteById(id);
            return ResponseEntity.ok("Sujet supprimé avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur suppression: " + e.getMessage());
        }
    }

}
