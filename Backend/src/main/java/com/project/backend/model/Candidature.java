package com.project.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class Candidature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String statut;
    private String typeEntretien;
    @Column(columnDefinition = "TEXT")
    private String commentaireAI;
    private Integer scoreAI;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    @JsonIgnoreProperties({"candidatures", "cv", "hibernateLazyInitializer"})
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "sujet_id")
    @JsonBackReference
    private SujetStage sujetStage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public SujetStage getSujetStage() {
        return sujetStage;
    }

    public void setSujetStage(SujetStage sujetStage) {
        this.sujetStage = sujetStage;
    }

    public String getCommentaireAI() {
        return commentaireAI;
    }

    public void setCommentaireAI(String commentaireAI) {
        this.commentaireAI = commentaireAI;
    }

    public Integer getScoreAI() {
        return scoreAI;
    }

    public void setScoreAI(Integer scoreAI) {
        this.scoreAI = scoreAI;
    }

    public String getTypeEntretien() {
        return typeEntretien;
    }

    }
}

