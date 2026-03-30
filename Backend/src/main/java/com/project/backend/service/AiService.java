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
            String cvPath,
            String titreSujet,
            String descriptionSujet,
            String motsCles
    ) {
        // ✅ Simulation temporaire sans API
        Map<String, Object> result = new HashMap<>();
        result.put("valide", true);
        result.put("score", 85);
        result.put("motsClesTrouves", List.of("Java", "Spring"));
        result.put("motsClesManquants", List.of());
        result.put("commentaire", "CV analysé avec succès - simulation");
        return result;
    }
}