package com.project.backend.Controller;

import com.project.backend.Repository.EntretienRepository;
import com.project.backend.model.Entretien;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("api/entretien")
public class EntretienController {
    private final EntretienRepository entretienRepository;

    public EntretienController(EntretienRepository entretienRepository) {
        this.entretienRepository = entretienRepository;
    }

    @PostMapping
    public ResponseEntity<Entretien> create(@RequestBody Entretien entretien) {
        // ✅ Plus de sujetStage
        Entretien saved = entretienRepository.save(entretien);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
    @GetMapping
    public List<Entretien> getAllEntretien() {
        return entretienRepository.findAll();
    }

    @GetMapping("/{id}")
    public Entretien getEntretienById(@PathVariable Long id) {
        return entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("entretien non trouvé"));
    }

    @PutMapping("/{id}/choisir")
    public ResponseEntity<?> choisirDate(@PathVariable Long id) {
        return entretienRepository.findById(id)
                .map(entretien -> {
                    entretien.setDisponible(false); // ✅ Non disponible
                    entretienRepository.save(entretien);
                    return ResponseEntity.ok(entretien);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Entretien>> getDisponibles() {
        return ResponseEntity.ok(
                entretienRepository.findByDisponibleTrue()
        );
    }
    @DeleteMapping("/{id}/choisir")
    public ResponseEntity<?> deleteDate(@PathVariable Long id) {
        try {
            entretienRepository.deleteById(id);
            return ResponseEntity.ok("Date supprimée avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

}
