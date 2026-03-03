package com.project.backend.controller;

import com.project.backend.Repository.CandidateRepository;
import com.project.backend.Repository.CandidatureRepository;
import com.project.backend.Repository.EntretienRepository;
import com.project.backend.Repository.SujetStageRepository;
import com.project.backend.model.Candidate;
import com.project.backend.model.Candidature;
import com.project.backend.model.SujetStage;
import com.project.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/condidature")
public class CandidatureController {

    @Autowired
    private SujetStageRepository sujetStageRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private AiService aiService;

    @PostMapping("/candidater")
    public ResponseEntity<String> postuler(@RequestParam Long sujetId, @RequestBody Candidate candidate) {
        SujetStage sujet = sujetStageRepository.findById(sujetId)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        boolean accepte = aiService.validerCv(candidate, sujet);

        if (accepte) {
            // enregistrer la candidature
            Candidature candidature = new Candidature();
            candidature.setCandidate(candidate);
            candidature.setSujetStage(sujet);
            candidatureRepository.save(candidature);

            return ResponseEntity.ok("CV accepté ✅");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("CV refusé ❌ : mots-clés manquants");
        }
    }



}
