package com.project.backend.controller;


import com.project.backend.Repository.ResponsableStageRepository;
import com.project.backend.model.ResponsableStage;
import com.project.backend.model.SujetStage;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("api/resp")
public class ResponsableStageController {

    private final ResponsableStageRepository responsableStageRepository;

    public ResponsableStageController(ResponsableStageRepository responsableStageRepository) {
        this.responsableStageRepository = responsableStageRepository;
    }
    @PostMapping
    public ResponseEntity<ResponsableStage> create(@Valid @RequestBody ResponsableStage responsablestage) {
        return new ResponseEntity<>(responsableStageRepository.save(responsablestage), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ResponsableStage> getAll() {
        return responsableStageRepository.findAll();
    }
}
