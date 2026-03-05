package com.project.backend.controller;

import com.project.backend.Repository.EntretienRepository;
import com.project.backend.model.Entretien;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("api/entretien")
public class EntretienController {
    private final EntretienRepository entretienRepository;

    public EntretienController(EntretienRepository entretienRepository) {
        this.entretienRepository = entretienRepository;
    }

    @PostMapping
    public ResponseEntity<Entretien> create(@Valid @RequestBody Entretien entretien) {
        Entretien savedentretien = entretienRepository.save(entretien);
        return new ResponseEntity<>(savedentretien, HttpStatus.CREATED);

    }
    @GetMapping
    public List<Entretien> getAllEntretien() {
        return entretienRepository.findAll();
    }

    @GetMapping("/{id}")
    public Entretien getEntretienById(@PathVariable Long id) {
        return entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("entretien non trouvé"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entretien> updateEntretien(@PathVariable Long id, @RequestBody Entretien entretien) {
        Optional<Entretien> entretiens = entretienRepository.findById(id);

        if (entretiens.isPresent()) {
            Entretien existingEntretien = entretiens.get();
            existingEntretien.setDate(entretien.getDate());

            Entretien updateEntretien = entretienRepository.save(existingEntretien);

            return new ResponseEntity<>(updateEntretien, HttpStatus.OK);

        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }}
    @DeleteMapping("/{id}")
    public String deleteEntretien(@PathVariable Long id) {
        entretienRepository.deleteById(id);
        return "date de l'entretien supprimé avec succès";
    }

}
