package com.project.backend.Controller;

import com.project.backend.Repository.CandidateRepository;
import com.project.backend.model.Candidate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:4200")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private com.project.backend.Repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Candidate> registerCandidate(
            @RequestPart("candidate") Candidate candidate,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        if (userRepository.existsByEmail(candidate.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        try {
            if (file != null && !file.isEmpty()) {
                String uploadDir = "uploads/cv/";
                new java.io.File(uploadDir).mkdirs();
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                java.nio.file.Files.write(java.nio.file.Paths.get(uploadDir + fileName), file.getBytes());
                candidate.setCV(uploadDir + fileName);
            }
            candidate.setMotDePasse(passwordEncoder.encode(candidate.getMotDePasse()));
            Candidate savedCandidate = candidateRepository.save(candidate);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCandidate);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

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

        System.out.println("=== UPDATE PROFILE CALLED for ID: " + id);

        return candidateRepository.findById(id)
                .map(candidate -> {
                    System.out.println("=== CANDIDATE FOUND: " + candidate.getEmail());
                    try {
                        if (nom != null) candidate.setNom(nom);
                        if (prenom != null) candidate.setPrenom(prenom);
                        if (email != null) candidate.setEmail(email);
                        if (telephone != null) candidate.setTelephone(telephone);
                        if (universite != null) candidate.setUniversite(universite);
                        if (diplome != null) candidate.setDiplome(diplome);
                        if (anneeDiplome != null) candidate.setAnneeDiplome(anneeDiplome);
                        if (informations != null) candidate.setInformations(informations);
                        if (paysResidence != null) candidate.setPaysResidence(paysResidence);

                        if (photo != null && !photo.isEmpty()) {
                            String uploadDir = "uploads/photos/";
                            new java.io.File(uploadDir).mkdirs();
                            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                            java.nio.file.Files.write(java.nio.file.Paths.get(uploadDir + fileName), photo.getBytes());
                            candidate.setPhoto(uploadDir + fileName);
                            System.out.println("=== PHOTO SAVED: " + fileName);
                        }

                        if (cv != null && !cv.isEmpty()) {
                            String uploadDir = "uploads/cv/";
                            new java.io.File(uploadDir).mkdirs();
                            String fileName = System.currentTimeMillis() + "_" + cv.getOriginalFilename();
                            java.nio.file.Files.write(java.nio.file.Paths.get(uploadDir + fileName), cv.getBytes());
                            candidate.setCV(uploadDir + fileName);
                            System.out.println("=== CV SAVED: " + fileName);
                        }

                        System.out.println("=== SAVING TO DB...");
                        Candidate saved = candidateRepository.save(candidate);
                        System.out.println("=== SAVE SUCCESS");
                        return ResponseEntity.ok(saved);

                    } catch (Exception e) {
                        System.out.println("=== SAVE FAILED: " + e.getMessage()); // ✅ shows exact error
                        e.printStackTrace();
                        return ResponseEntity.<Candidate>status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                })
                .orElseGet(() -> {
                    System.out.println("=== CANDIDATE NOT FOUND for ID: " + id);
                    return ResponseEntity.notFound().build(); // ✅ no generic needed
                });
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        if (candidates.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(candidates);
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