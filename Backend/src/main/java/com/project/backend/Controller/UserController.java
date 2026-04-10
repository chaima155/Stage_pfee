package com.project.backend.Controller;

import com.project.backend.Repository.UserRepository;
import com.project.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("motDePasse");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email ou mot de passe incorrect"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getMotDePasse())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email ou mot de passe incorrect"));
        }

        // Return user info (without password)
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("nom", user.getNom());
        response.put("prenom", user.getPrenom());
        response.put("email", user.getEmail());
        response.put("sexes", user.getSexes());
        response.put("photo", user.getPhoto());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update user profile (with optional photo upload)
    @PutMapping(value = "/{id}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestPart(value = "nom", required = false) String nom,
            @RequestPart(value = "prenom", required = false) String prenom,
            @RequestPart(value = "email", required = false) String email,
            @RequestPart(value = "telephone", required = false) String telephone,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        if (nom != null && !nom.isEmpty()) user.setNom(nom);
        if (prenom != null && !prenom.isEmpty()) user.setPrenom(prenom);
        if (email != null && !email.isEmpty()) {
            // Check if new email is already taken by another user
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Cet email est déjà utilisé"));
            }
            user.setEmail(email);
        }

        // Handle photo upload
        if (photo != null && !photo.isEmpty()) {
            try {
                String uploadDir = "uploads/photos/";
                java.io.File dir = new java.io.File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + fileName);
                java.nio.file.Files.write(filePath, photo.getBytes());

                user.setPhoto(uploadDir + fileName);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Erreur lors du téléchargement de la photo"));
            }
        }

        User savedUser = userRepository.save(user);

        // Return updated user info
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("nom", savedUser.getNom());
        response.put("prenom", savedUser.getPrenom());
        response.put("email", savedUser.getEmail());
        response.put("sexes", savedUser.getSexes());
        response.put("photo", savedUser.getPhoto());
        response.put("role", savedUser.getRole());

        return ResponseEntity.ok(response);
    }

    // Serve uploaded photos
    @GetMapping("/photos/{filename}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable String filename) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads/photos/" + filename);
            byte[] imageBytes = java.nio.file.Files.readAllBytes(filePath);

            String contentType = "image/jpeg";
            if (filename.endsWith(".png")) contentType = "image/png";
            else if (filename.endsWith(".gif")) contentType = "image/gif";
            else if (filename.endsWith(".webp")) contentType = "image/webp";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}