package com.project.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "responsable_stage")
@DiscriminatorValue("responsable_stage")
public class ResponsableStage extends User {

    @JsonProperty("department")
    private String department;

    @JsonProperty("poste")
    private String poste;

    @JsonProperty("service")
    private String service;


    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }


}