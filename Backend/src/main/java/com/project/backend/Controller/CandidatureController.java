package com.project.backend.Controller;

import com.project.backend.Repository.CandidatureRepository;
import com.project.backend.Repository.EntretienRepository;
import com.project.backend.Repository.SujetStageRepository;
import com.project.backend.Repository.CandidateRepository;
import com.project.backend.model.Candidature;
import com.project.backend.model.Candidate;
import com.project.backend.model.Entretien;
import com.project.backend.model.SujetStage;
import com.project.backend.service.AiService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("api/candidatures")
@CrossOrigin(origins = "http://localhost:4200")
public class CandidatureController {

    private final CandidatureRepository candidatureRepository;
    private final SujetStageRepository sujetStageRepository;
    private final AiService aiService;
    private final CandidateRepository candidateRepository;
    private final EntretienRepository entretienRepository; // ✅ Ajouter

    public CandidatureController(
            CandidatureRepository candidatureRepository,
            SujetStageRepository sujetStageRepository,
            AiService aiService,
            CandidateRepository candidateRepository,
            EntretienRepository entretienRepository // ✅ Ajouter
    ) {
        this.candidatureRepository = candidatureRepository;
        this.sujetStageRepository = sujetStageRepository;
        this.aiService = aiService;
        this.candidateRepository = candidateRepository;
        this.entretienRepository = entretienRepository; // ✅ Ajouter
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postuler(
            @RequestParam("sujetId") Long sujetId,
            @RequestParam("candidateId") Long candidateId,
            @RequestParam("typeEntretien") String typeEntretien
    ) {
        try {
            SujetStage sujet = sujetStageRepository.findById(sujetId)
                    .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

            Candidate candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidat non trouvé"));

            // ✅ Récupérer le chemin CV depuis le profil candidat
            String cvPath = candidate.getCV();
            if (cvPath == null || cvPath.isEmpty()) {
                return ResponseEntity.badRequest().body("Aucun CV trouvé dans votre profil !");
            }

            Map<String, Object> result = aiService.analyserCV(
                    cvPath,
                    sujet.getTitre(),
                    sujet.getDescription(),
                    sujet.getMotsCles()
            );

            boolean valide = (Boolean) result.get("valide");

            Candidature candidature = new Candidature();
            candidature.setSujetStage(sujet);
            candidature.setCandidate(candidate);
            candidature.setTypeEntretien(typeEntretien);
            candidature.setStatut(valide ? "VALIDEE" : "REJETEE");
            candidature.setCommentaireAI((String) result.get("commentaire"));
            Object scoreObj = result.get("score");
            if (scoreObj instanceof Integer) {
                candidature.setScoreAI((Integer) scoreObj);
            }
            candidatureRepository.save(candidature);

            Map<String, Object> response = new HashMap<>();
            response.put("valide", valide);
            response.put("score", result.get("score"));
            response.put("commentaire", result.get("commentaire"));
            response.put("motsClesTrouves", result.get("motsClesTrouves"));
            response.put("motsClesManquants", result.get("motsClesManquants"));
            response.put("statut", valide ? "VALIDEE" : "REJETEE");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Candidature> getAllCandidatures() {
        return candidatureRepository.findAll();
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Candidature> getCandidaturesByCandidate(@PathVariable Long candidateId) {
        return candidatureRepository.findByCandidate_Id(candidateId);
    }

    @GetMapping("/sujet/{sujetId}")
    public List<Candidature> getCandidaturesBySujet(@PathVariable Long sujetId) {
        return candidatureRepository.findBySujetStage_Id(sujetId);
    }

    @GetMapping("/candidate/{candidateId}/dates")
    public ResponseEntity<?> getDatesByCandidateAccepte(@PathVariable Long candidateId) {
        try {
            List<Candidature> candidatures = candidatureRepository
                    .findByCandidate_IdAndStatut(candidateId, "VALIDEE");

            List<Map<String, Object>> dates = new ArrayList<>();
            for (Candidature c : candidatures) {
                // ✅ entretienRepository (minuscule) pas EntretienRepository
                List<Entretien> entretiens = entretienRepository
                        .findBySujetStageId(c.getSujetStage().getId());
                for (Entretien e : entretiens) {
                    Map<String, Object> dateInfo = new HashMap<>();
                    dateInfo.put("id", e.getId());
                    dateInfo.put("date", e.getDate());
                    dateInfo.put("sujetTitre", c.getSujetStage().getTitre());
                    dateInfo.put("sujetId", c.getSujetStage().getId());
                    dates.add(dateInfo);
                }
            }
            return ResponseEntity.ok(dates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }
}