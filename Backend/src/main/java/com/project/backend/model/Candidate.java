package com.project.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.Date;
import java.util.List;

@Entity
@DiscriminatorValue("candidate")
public class Candidate extends User {

    @JsonProperty("universite")
    private String universite;

    @JsonProperty("diplome")
    private String diplome;

    @JsonProperty("anneeDiplome")
    private String anneeDiplome;

    @JsonProperty("informations")
    private String informations;

    @JsonProperty("dateNaissance")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date dateNaissance;

    @JsonProperty("telephone")
    private String telephone;

    @JsonProperty("paysResidence")
    private String paysResidence;

    @JsonProperty("CV")
    private String CV;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Candidature> candidatures;


    public String getAnneeDiplome() {
        return anneeDiplome;
    }

    public void setAnneeDiplome(String anneeDiplome) {
        this.anneeDiplome = anneeDiplome;
    }

    public String getDiplome() {
        return diplome;
    }

    public void setDiplome(String diplome) {
        this.diplome = diplome;
    }

    public String getUniversite() {
        return universite;
    }

    public void setUniversite(String universite) {
        this.universite = universite;
    }

    public String getInformations() {
        return informations;
    }

    public void setInformations(String informations) {
        this.informations = informations;
    }

    public Date getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(Date dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getPaysResidence() {
        return paysResidence;
    }

    public void setPaysResidence(String paysResidence) {
        this.paysResidence = paysResidence;
    }

    public String getCV() {
        return CV;
    }

    public void setCV(String CV) {
        this.CV = CV;
    }

    public List<Candidature> getCandidatures() {
        return candidatures;
    }

    public void setCandidatures(List<Candidature> candidatures) {
        this.candidatures = candidatures;
    }
}
