package com.project.backend.dto;


public class EntretienAiRequest {
    private String actions;
    private String candidateName;
    private String duree;

    public String getActions() { return actions; }
    public void setActions(String actions) { this.actions = actions; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getDuree() { return duree; }
    public void setDuree(String duree) { this.duree = duree; }
}