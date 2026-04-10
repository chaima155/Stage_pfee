package com.project.backend.Controller;

import com.project.backend.Repository.CandidatureRepository;
import com.project.backend.Repository.EntretienRepository;
import com.project.backend.model.Candidature;
import com.project.backend.model.Entretien;
import com.project.backend.service.EmailService; // ✅ ajouter
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/entretien")
public class EntretienController {

    private final EntretienRepository entretienRepository;
    private final CandidatureRepository candidatureRepository;
    private final EmailService emailService; // ✅ ajouter

    public EntretienController(
            EntretienRepository entretienRepository,
            CandidatureRepository candidatureRepository,
            EmailService emailService // ✅ ajouter
    ) {
        this.entretienRepository  = entretienRepository;
        this.candidatureRepository = candidatureRepository;
        this.emailService         = emailService; // ✅ ajouter
    }

    @PostMapping
    public ResponseEntity<Entretien> create(@RequestBody Entretien entretien) {
        entretien.setDisponible(true);
        return new ResponseEntity<>(entretienRepository.save(entretien), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Entretien> getAllEntretien() {
        return entretienRepository.findAll();
    }

    @GetMapping("/{id}")
    public Entretien getEntretienById(@PathVariable Long id) {
        return entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Entretien>> getDisponibles() {
        return ResponseEntity.ok(entretienRepository.findByDisponibleTrue());
    }

    @PutMapping("/{id}/choisir")
    public ResponseEntity<?> choisirDate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            Entretien entretien = entretienRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

            if (!entretien.getDisponible()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Ce créneau n'est plus disponible.");
            }

            if (body != null && body.containsKey("candidatureId")) {
                Long candidatureId = Long.valueOf(body.get("candidatureId").toString());
                Candidature candidature = candidatureRepository.findById(candidatureId)
                        .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));
                entretien.setCandidature(candidature);
            }

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

    // ✅ Terminer avec email
    @PutMapping("/{id}/terminer")
    public ResponseEntity<?> terminer(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            Entretien entretien = entretienRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

            String resultat = body.get("resultat");
            String notes    = body.get("notes");

            entretien.setResultat(resultat);
            entretien.setNotesIA(notes);
            entretienRepository.save(entretien);

            // ✅ Récupérer candidat depuis DB
            Candidature candidature = entretien.getCandidature();

            if (candidature != null && candidature.getCandidate() != null) {
                String email = candidature.getCandidate().getEmail();
                String name  = candidature.getCandidate().getNom();

                if (email != null && !email.isEmpty()) {
                    try {
                        emailService.sendResultatEmail(email, name, resultat);
                        System.out.println("✅ Email envoyé à: " + email);
                    } catch (Exception e) {
                        System.err.println("❌ Erreur email: " + e.getMessage());
                    }
                }
            }

            return ResponseEntity.ok(entretien);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            Entretien entretien = entretienRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));
            entretien.setCandidature(null);
            entretienRepository.save(entretien);
            entretienRepository.deleteById(id);
            return ResponseEntity.ok("Entretien supprimé");
        } catch (Exception e) {
            System.out.println("❌ Erreur suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/supprimer-passes")
    public ResponseEntity<?> supprimerDatesPassees() {
        try {
            List<Entretien> entretiens = entretienRepository.findByDisponibleTrue();
            Date maintenant = new Date();

            List<Entretien> aSupprimer = entretiens.stream()
                    .filter(e -> e.getDate() != null && e.getDate().before(maintenant))
                    .collect(java.util.stream.Collectors.toList());

            entretienRepository.deleteAll(aSupprimer);

            return ResponseEntity.ok(Map.of(
                    "message", aSupprimer.size() + " date(s) supprimée(s)",
                    "count",   aSupprimer.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }
}