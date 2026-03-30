package com.project.backend.service;
import com.project.backend.dto.EntretienAiRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class EntretienAiService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    public String analyzeInterview(EntretienAiRequest request) {

        String prompt = String.format("""
                Tu es un assistant RH expert en évaluation de candidats.
                
                Candidat : %s
                Durée de l'entretien : %s
                Actions et comportements détectés durant l'appel :
                %s
                
                Analyse le comportement du candidat et fournis :
                1. Évaluation globale (3-4 phrases)
                2. Points positifs
                3. Points à améliorer
                4. Recommandation finale : ACCEPTER ou REFUSER
                """,
                request.getCandidateName(),
                request.getDuree(),
                request.getActions()
        );

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "claude-sonnet-4-20250514");
        body.put("max_tokens", 600);
        body.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.anthropic.com/v1/messages",
                    entity,
                    Map.class
            );

            Map responseBody = response.getBody();
            if (responseBody == null) return "Analyse non disponible";

            List<Map> content = (List<Map>) responseBody.get("content");
            if (content == null || content.isEmpty()) return "Analyse non disponible";

            return (String) content.get(0).get("text");

        } catch (Exception e) {
            System.err.println("❌ Erreur Claude API: " + e.getMessage());
            return "Analyse IA non disponible — décision manuelle requise.";
        }
    }
}