package com.project.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.Date;

@Entity

public class Entretien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date date;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "sujet_stage_id")
    private SujetStage sujetStage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public SujetStage getSujetStage() {
        return sujetStage;
    }

    public void setSujetStage(SujetStage sujetStage) {
        this.sujetStage = sujetStage;
    }
}
