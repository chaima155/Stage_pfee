package com.project.backend.Controller;

import com.project.backend.Repository.ResponsableStageRepository;
import com.project.backend.Repository.UserRepository;
import com.project.backend.model.ResponsableStage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responsables")
@CrossOrigin(origins = "http://localhost:4200")
public class ResponsableStageController {

    @Autowired
    private ResponsableStageRepository responsableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String motDePasse = credentials.get("motDePasse");

        ResponsableStage responsable = responsableRepository.findByEmail(email);
        if (responsable == null || !passwordEncoder.matches(motDePasse, responsable.getMotDePasse())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(responsable);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponsableStage> register(@RequestBody ResponsableStage responsable) {
        if (userRepository.existsByEmail(responsable.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        responsable.setMotDePasse(passwordEncoder.encode(responsable.getMotDePasse()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responsableRepository.save(responsable));
    }

    @GetMapping
    public ResponseEntity<List<ResponsableStage>> getAll() {
        List<ResponsableStage> responsables = responsableRepository.findAll();
        if (responsables.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responsables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponsableStage> getById(@PathVariable Long id) {
        return responsableRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponsableStage> update(@PathVariable Long id,
                                                   @RequestBody ResponsableStage details) {
        return responsableRepository.findById(id)
                .map(r -> {
                    r.setNom(details.getNom());
                    r.setPrenom(details.getPrenom());
                    r.setEmail(details.getEmail());
                    r.setDepartment(details.getDepartment());
                    r.setPoste(details.getPoste());
                    r.setService(details.getService());
                    return ResponseEntity.ok(responsableRepository.save(r));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!responsableRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        responsableRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}