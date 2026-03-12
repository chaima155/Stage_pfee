package com.project.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;


@Entity
public class SujetStage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private String motsCles;
    private Integer nbrStagiaires;
    private String niveau;
    private Integer duree;
    private String technologies;
    private LocalDateTime dateposte;

    @OneToMany(mappedBy = "sujetStage", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Entretien> entretien;

    @OneToMany(mappedBy = "sujetStage", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonManagedReference
    private List<Candidature> candidatures;

    @PrePersist
    public void prePersist() {
        this.dateposte = LocalDateTime.now();
    }


    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public  String getMotsCles() {
        return motsCles;
    }

    public void setMotsCles(String motsCles) {
        this.motsCles = motsCles;
    }

    public Integer getNbrStagiaires() {
        return nbrStagiaires;
    }

    public void setNbrStagiaires(Integer nbrStagiaires) {
        this.nbrStagiaires = nbrStagiaires;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public Integer getDuree() {
        return duree;
    }

    public void setDuree(Integer duree) {
        this.duree = duree;
    }

    public String getTechnologies() {
        return technologies;
    }

    public void setTechnologies(String technologies) {
        this.technologies = technologies;
    }

    public LocalDateTime getDateposte() {
        return dateposte;
    }

    public void setDateposte(LocalDateTime dateposte) {
        this.dateposte = dateposte;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Entretien> getEntretien() {
        return entretien;
    }

    public void setEntretien(List<Entretien> entretien) {
        this.entretien = entretien;
    }

    public List<Candidature> getCandidatures() {
        return candidatures;
    }

    public void setCandidatures(List<Candidature> candidatures) {
        this.candidatures = candidatures;
    }
}
