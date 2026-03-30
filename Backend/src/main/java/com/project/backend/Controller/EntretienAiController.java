package com.project.backend.Controller;

import com.project.backend.dto.EntretienAiRequest;
import com.project.backend.service.EntretienAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/entretien-ai")
@CrossOrigin(origins = "http://localhost:4200")
public class EntretienAiController {

    @Autowired
    private EntretienAiService entretienAiService;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyze(
            @RequestBody EntretienAiRequest request
    ) {
        String analysis = entretienAiService.analyzeInterview(request);
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }
}