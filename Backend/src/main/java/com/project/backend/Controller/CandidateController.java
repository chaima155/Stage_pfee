package com.project.backend.Controller;

import com.project.backend.Repository.CandidateRepository;
import com.project.backend.model.Candidate;
import com.project.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private com.project.backend.Repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // ✅ Tokens de vérification en mémoire
    private static final Map<String, Long> verificationTokens = new ConcurrentHashMap<>();

    // ══════════════════════════════════════
    // REGISTER
    // ══════════════════════════════════════

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerCandidate(
            @RequestPart("candidate") Candidate candidate,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        if (userRepository.existsByEmail(candidate.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "EMAIL_EXISTS",
                            "message", "Cette adresse email est déjà utilisée."));
        }

        try {
            // ✅ Sauvegarder le CV
            if (file != null && !file.isEmpty()) {
                String uploadDir = "uploads/cv/";
                new java.io.File(uploadDir).mkdirs();
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                java.nio.file.Files.write(
                        java.nio.file.Paths.get(uploadDir + fileName), file.getBytes()
                );
                candidate.setCV(uploadDir + fileName);
            }

            // ✅ Encoder le mot de passe
            candidate.setMotDePasse(passwordEncoder.encode(candidate.getMotDePasse()));

            // ✅ Email non vérifié par défaut
            candidate.setEmailVerifie(false);

            Candidate savedCandidate = candidateRepository.save(candidate);

            // ✅ Générer token de vérification
            String token = UUID.randomUUID().toString();
            verificationTokens.put(token, savedCandidate.getId());

            // ✅ Envoyer email de vérification
            String verifyUrl = "http://localhost:4200/verify-email?token=" + token;
            emailService.sendVerificationEmail(
                    savedCandidate.getEmail(),
                    savedCandidate.getPrenom(),
                    verifyUrl
            );

            System.out.println("✅ Inscription réussie — email envoyé à: " + savedCandidate.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
                    "email",   savedCandidate.getEmail()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ══════════════════════════════════════
    // ✅ VÉRIFICATION EMAIL
    // ══════════════════════════════════════

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        Long candidateId = verificationTokens.get(token);

        if (candidateId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "INVALID_TOKEN",
                            "message", "Token invalide ou expiré."));
        }

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElse(null);

        if (candidate == null) {
            return ResponseEntity.notFound().build();
        }

        candidate.setEmailVerifie(true);
        candidateRepository.save(candidate);
        verificationTokens.remove(token);

        System.out.println("✅ Email vérifié pour: " + candidate.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Email vérifié avec succès ! Vous pouvez maintenant vous connecter."
        ));
    }

    // ══════════════════════════════════════
    // ✅ RENVOYER EMAIL DE VÉRIFICATION
    // ══════════════════════════════════════

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Candidate candidate = candidateRepository.findByEmail(email);
        if (candidate == null) {
            return ResponseEntity.notFound().build();
        }

        if (candidate.isEmailVerifie()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email déjà vérifié."));
        }

        String token = UUID.randomUUID().toString();
        verificationTokens.put(token, candidate.getId());

        String verifyUrl = "http://localhost:4200/verify-email?token=" + token;
        emailService.sendVerificationEmail(candidate.getEmail(), candidate.getPrenom(), verifyUrl);

        return ResponseEntity.ok(Map.of("message", "Email de vérification renvoyé !"));
    }

    // ══════════════════════════════════════
    // LOGIN — vérifier email confirmé
    // ══════════════════════════════════════

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email      = credentials.get("email");
        String motDePasse = credentials.get("motDePasse");

        Candidate candidate = candidateRepository.findByEmail(email);

        if (candidate == null ||
                !passwordEncoder.matches(motDePasse, candidate.getMotDePasse())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "INVALID_CREDENTIALS",
                            "message", "Email ou mot de passe incorrect."));
        }

        // ✅ Vérifier si email confirmé
        if (!candidate.isEmailVerifie()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error",   "EMAIL_NOT_VERIFIED",
                            "message", "Veuillez vérifier votre email avant de vous connecter.",
                            "email",   candidate.getEmail()));
        }

        return ResponseEntity.ok(candidate);
    }

    // ══════════════════════════════════════
    // AUTRES ENDPOINTS EXISTANTS
    // ══════════════════════════════════════

    @PutMapping(value = "/{id}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String telephone,
            @RequestParam(required = false) String universite,
            @RequestParam(required = false) String diplome,
            @RequestParam(required = false) String anneeDiplome,
            @RequestParam(required = false) String informations,
            @RequestParam(required = false) String paysResidence,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "cv", required = false) MultipartFile cv) {

        return candidateRepository.findById(id)
                .map(candidate -> {
                    try {
                        if (nom != null)           candidate.setNom(nom);
                        if (prenom != null)         candidate.setPrenom(prenom);
                        if (email != null)          candidate.setEmail(email);
                        if (telephone != null)      candidate.setTelephone(telephone);
                        if (universite != null)     candidate.setUniversite(universite);
                        if (diplome != null)        candidate.setDiplome(diplome);
                        if (anneeDiplome != null)   candidate.setAnneeDiplome(anneeDiplome);
                        if (informations != null)   candidate.setInformations(informations);
                        if (paysResidence != null)  candidate.setPaysResidence(paysResidence);

                        if (photo != null && !photo.isEmpty()) {
                            String uploadDir = "uploads/photos/";
                            new java.io.File(uploadDir).mkdirs();
                            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                            java.nio.file.Files.write(
                                    java.nio.file.Paths.get(uploadDir + fileName), photo.getBytes()
                            );
                            candidate.setPhoto(uploadDir + fileName);
                        }

                        if (cv != null && !cv.isEmpty()) {
                            String uploadDir = "uploads/cv/";
                            new java.io.File(uploadDir).mkdirs();
                            String fileName = System.currentTimeMillis() + "_" + cv.getOriginalFilename();
                            java.nio.file.Files.write(
                                    java.nio.file.Paths.get(uploadDir + fileName), cv.getBytes()
                            );
                            candidate.setCV(uploadDir + fileName);
                        }

                        return ResponseEntity.ok(candidateRepository.save(candidate));

                    } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.<Candidate>status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        return candidates.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        return candidateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate updatedCandidate) {
        return candidateRepository.findById(id)
                .map(candidate -> {
                    candidate.setNom(updatedCandidate.getNom());
                    candidate.setPrenom(updatedCandidate.getPrenom());
                    candidate.setEmail(updatedCandidate.getEmail());
                    candidate.setSexes(updatedCandidate.getSexes());
                    candidate.setUniversite(updatedCandidate.getUniversite());
                    candidate.setDiplome(updatedCandidate.getDiplome());
                    candidate.setAnneeDiplome(updatedCandidate.getAnneeDiplome());
                    candidate.setInformations(updatedCandidate.getInformations());
                    candidate.setDateNaissance(updatedCandidate.getDateNaissance());
                    candidate.setTelephone(updatedCandidate.getTelephone());
                    candidate.setPaysResidence(updatedCandidate.getPaysResidence());
                    return ResponseEntity.ok(candidateRepository.save(candidate));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        if (!candidateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        candidateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}