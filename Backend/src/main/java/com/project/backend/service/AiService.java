package com.project.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Service
public class AiService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> analyserCV(
            String cvPath,        // ✅ String chemin du fichier
            String titreSujet,
            String descriptionSujet,
            String motsCles
    ) {
        try {
            // ✅ Lire le fichier depuis le chemin
            byte[] cvBytes = Files.readAllBytes(Paths.get(cvPath));
            String base64CV = Base64.getEncoder().encodeToString(cvBytes);

            // ✅ Media type toujours PDF
            String mediaType = "application/pdf";

            String prompt = String.format("""
                Tu es un système automatique de filtrage de CV. Tu dois être TRÈS STRICT.
                
                Sujet de stage: %s
                Description: %s
                Mots clés OBLIGATOIRES: %s
                
                RÈGLE ABSOLUE:
                - Cherche CHAQUE mot clé dans le CV
                - Si UN SEUL mot clé est ABSENT → valide = FALSE automatiquement
                - Score = (mots clés trouvés / total mots clés) * 100
                
                Réponds UNIQUEMENT avec ce JSON:
                {
                    "valide": false,
                    "score": 0,
                    "motsClesTrouves": [],
                    "motsClesManquants": [],
                    "commentaire": ""
                }
                """, titreSujet, descriptionSujet, motsCles);

            Map<String, Object> pdfContent = new HashMap<>();
            pdfContent.put("type", "document");
            pdfContent.put("source", Map.of(
                    "type", "base64",
                    "media_type", mediaType,
                    "data", base64CV
            ));

            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");
            textContent.put("text", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "claude-sonnet-4-20250514");
            body.put("max_tokens", 500);
            body.put("messages", List.of(
                    Map.of("role", "user", "content", List.of(pdfContent, textContent))
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ANTHROPIC_URL, request, Map.class
            );

            List<Map> content = (List<Map>) response.getBody().get("content");
            String jsonText = (String) content.get(0).get("text");
            jsonText = jsonText.replaceAll("```json", "").replaceAll("```", "").trim();

            return mapper.readValue(jsonText, Map.class);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("valide", false);
            error.put("score", 0);
            error.put("motsClesTrouves", List.of());
            error.put("motsClesManquants", List.of());
            error.put("commentaire", "Erreur: " + e.getMessage());
            return error;
        }
    }
}