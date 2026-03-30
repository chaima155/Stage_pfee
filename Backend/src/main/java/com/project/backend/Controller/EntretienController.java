package com.project.backend.Controller;

import com.project.backend.Repository.CandidatureRepository;
import com.project.backend.Repository.EntretienRepository;
import com.project.backend.model.Candidature;
import com.project.backend.model.Entretien;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("api/entretien")
public class EntretienController {

    private final EntretienRepository entretienRepository;
    private final CandidatureRepository candidatureRepository; // ✅ ajouter

    public EntretienController(
            EntretienRepository entretienRepository,
            CandidatureRepository candidatureRepository // ✅ ajouter
    ) {
        this.entretienRepository = entretienRepository;
        this.candidatureRepository = candidatureRepository;
    }

    // ✅ Créer un entretien
    @PostMapping
    public ResponseEntity<Entretien> create(@RequestBody Entretien entretien) {
        entretien.setDisponible(true);
        return new ResponseEntity<>(entretienRepository.save(entretien), HttpStatus.CREATED);
    }

    // ✅ Liste tous — avec candidat inclus
    @GetMapping
    public List<Entretien> getAllEntretien() {
        return entretienRepository.findAll();
    }

    // ✅ Par ID
    @GetMapping("/{id}")
    public Entretien getEntretienById(@PathVariable Long id) {
        return entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));
    }

    // ✅ Disponibles uniquement
    @GetMapping("/disponibles")
    public ResponseEntity<List<Entretien>> getDisponibles() {
        return ResponseEntity.ok(entretienRepository.findByDisponibleTrue());
    }

    // ✅ Candidat choisit une date — lier candidature
    @PutMapping("/{id}/choisir")
    public ResponseEntity<?> choisirDate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            Entretien entretien = entretienRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

            // Vérifier disponibilité
            if (!entretien.getDisponible()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Ce créneau n'est plus disponible.");
            }

            // ✅ Lier la candidature si envoyée
            if (body != null && body.containsKey("candidatureId")) {
                Long candidatureId = Long.valueOf(body.get("candidatureId").toString());
                Candidature candidature = candidatureRepository.findById(candidatureId)
                        .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));
                entretien.setCandidature(candidature);
            }

            // ✅ Marquer non disponible
            entretien.setDisponible(false);
            entretienRepository.save(entretien);

            return ResponseEntity.ok(Map.of(
                    "message",     "Date confirmée avec succès !",
                    "entretienId", entretien.getId(),
                    "date",        entretien.getDate().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    // ✅ Terminer entretien avec résultat IA
    @PutMapping("/{id}/terminer")
    public ResponseEntity<?> terminer(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            Entretien entretien = entretienRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));
            entretien.setResultat(body.get("resultat"));
            entretien.setNotesIA(body.get("notes"));
            return ResponseEntity.ok(entretienRepository.save(entretien));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    // ✅ Supprimer
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            Entretien entretien = entretienRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

            // ✅ Délier la candidature avant suppression
            entretien.setCandidature(null);
            entretienRepository.save(entretien);

            // ✅ Puis supprimer
            entretienRepository.deleteById(id);

            return ResponseEntity.ok("Entretien supprimé");

        } catch (Exception e) {
            System.out.println("❌ Erreur suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }
}
