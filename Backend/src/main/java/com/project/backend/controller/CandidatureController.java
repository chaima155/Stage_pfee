package com.project.backend.controller;

import com.project.backend.Repository.CandidatureRepository;
import com.project.backend.Repository.SujetStageRepository;
import com.project.backend.Repository.CandidateRepository;
import com.project.backend.model.Candidature;
import com.project.backend.model.Candidate;
import com.project.backend.model.SujetStage;
import com.project.backend.service.AiService;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("api/candidatures")
@CrossOrigin(origins = "http://localhost:4200")
public class CandidatureController {

    private final CandidatureRepository candidatureRepository;
    private final SujetStageRepository sujetStageRepository;
    private final AiService aiService;

    public CandidatureController(
            CandidatureRepository candidatureRepository,
            SujetStageRepository sujetStageRepository,
            AiService aiService
    ) {
        this.candidatureRepository = candidatureRepository;
        this.sujetStageRepository = sujetStageRepository;
        this.aiService = aiService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postuler(
            @RequestParam("sujetId") Long sujetId,
            @RequestParam("typeEntretien") String typeEntretien,
            @RequestParam("cv") MultipartFile cvFile
    ) {
        try {
            // ✅ Récupérer le sujet
            SujetStage sujet = sujetStageRepository.findById(sujetId)
                    .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

            // ✅ Analyser le CV avec AI
            Map<String, Object> result = aiService.analyserCV(
                    cvFile,
                    sujet.getTitre(),
                    sujet.getDescription(),
                    sujet.getMotsCles()
            );

            boolean valide = (Boolean) result.get("valide");

            // ✅ Sauvegarder la candidature
            Candidature candidature = new Candidature();
            candidature.setSujetStage(sujet);
            candidature.setTypeEntretien(typeEntretien);
            candidature.setStatut(valide ? "VALIDEE" : "REJETEE");
            candidature.setCommentaireAI((String) result.get("commentaire"));
            candidature.setScoreAI((Integer) result.get("score"));
            candidatureRepository.save(candidature);

            // ✅ Construire la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("valide", valide);
            response.put("score", result.get("score"));
            response.put("commentaire", result.get("commentaire"));
            response.put("motsClesTrouves", result.get("motsClesTrouves"));
            response.put("motsClesManquants", result.get("motsClesManquants"));
            response.put("statut", valide ? "VALIDEE" : "REJETEE");
            if (!valide) {
                response.put("message", "Votre CV ne contient pas tous les mots clés requis.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }
}