package com.project.backend.service;

import com.project.backend.model.Candidate;
import com.project.backend.model.SujetStage;
import org.springframework.stereotype.Service;

@Service
public class AiService {
    public boolean validerCv(Candidate candidate, SujetStage sujetStage) {
        if (candidate.getCV() == null || candidate.getCV().isEmpty()) {
            return false; // CV vide → refusé
        }

        String[] motsCles = sujetStage.getMotsCles().split(",");

        for (String mot : motsCles) {
            if (!candidate.getCV().toLowerCase().contains(mot.trim().toLowerCase())) {
                return false; // Un mot-clé manquant → refusé
            }
        }

        return true; // Tous les mots-clés présents → accepté
    }
}
