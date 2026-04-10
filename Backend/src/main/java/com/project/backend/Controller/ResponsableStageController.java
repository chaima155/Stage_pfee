package com.project.backend.Controller;

import com.project.backend.Repository.ResponsableStageRepository;
import com.project.backend.Repository.UserRepository;
import com.project.backend.model.ResponsableStage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/responsables")
@CrossOrigin(origins = "*")
public class ResponsableStageController {

    @Autowired
    private ResponsableStageRepository responsableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Value("${upload.dir:uploads/}")
    private String uploadDir;

    // ══════════════════════════════════════
    // AUTH
    // ══════════════════════════════════════

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email      = credentials.get("email");
        String motDePasse = credentials.get("motDePasse");

        ResponsableStage responsable = responsableRepository.findByEmail(email);
        if (responsable == null ||
                !passwordEncoder.matches(motDePasse, responsable.getMotDePasse())) {
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

    // ══════════════════════════════════════
    // GET
    // ══════════════════════════════════════

    @GetMapping
    public ResponseEntity<List<ResponsableStage>> getAll() {
        List<ResponsableStage> responsables = responsableRepository.findAll();
        return responsables.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(responsables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponsableStage> getById(@PathVariable Long id) {
        return responsableRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Endpoint /me — récupérer le responsable connecté
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestParam(required = false) Long id) {
        // Essayer via header ou param
        if (id != null) {
            return responsableRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        // Retourner le premier responsable si pas d'id (à adapter selon votre auth)
        return responsableRepository.findAll().stream().findFirst()
                .map(r -> ResponseEntity.ok(r))
                .orElse(ResponseEntity.notFound().build());
    }

    // ══════════════════════════════════════
    // UPDATE
    // ══════════════════════════════════════

    @PutMapping("/{id}")
    public ResponseEntity<ResponsableStage> update(
            @PathVariable Long id,
            @RequestBody ResponsableStage details
    ) {
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

    // ✅ Upload photo
    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("photo") MultipartFile file
    ) {
        try {
            ResponsableStage responsable = responsableRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));

            Path uploadPath = Paths.get(uploadDir + "responsables/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Supprimer ancienne photo
            if (responsable.getPhoto() != null) {
                try {
                    Files.deleteIfExists(
                            Paths.get(uploadDir + "responsables/").resolve(responsable.getPhoto())
                    );
                } catch (Exception ignored) {}
            }

            // ✅ Sauvegarder nouvelle photo
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath   = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // ✅ Stocker seulement le nom du fichier
            responsable.setPhoto(fileName);
            responsableRepository.save(responsable);

            return ResponseEntity.ok(responsable);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur upload: " + e.getMessage());
        }
    }
    // ✅ Servir les photos
    @GetMapping("/photos/{filename}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir + "responsables/").resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            }
            return ResponseEntity.notFound().build();

        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Changer mot de passe
    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            ResponsableStage responsable = responsableRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));

            String newPassword = body.get("newPassword");
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                        .body("Le mot de passe doit contenir au moins 6 caractères");
            }

            responsable.setMotDePasse(passwordEncoder.encode(newPassword));
            responsableRepository.save(responsable);

            return ResponseEntity.ok(Map.of("message", "Mot de passe changé avec succès"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    // ══════════════════════════════════════
    // DELETE
    // ══════════════════════════════════════

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!responsableRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        responsableRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}