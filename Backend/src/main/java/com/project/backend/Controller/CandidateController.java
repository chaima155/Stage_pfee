package com.project.backend.controller;

import com.project.backend.Repository.CandidateRepository;
import com.project.backend.model.Candidate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/candidate")
public class CandidateController {
    private final CandidateRepository candidateRepository;

    public CandidateController(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    @PostMapping("/inscription")
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }
}
