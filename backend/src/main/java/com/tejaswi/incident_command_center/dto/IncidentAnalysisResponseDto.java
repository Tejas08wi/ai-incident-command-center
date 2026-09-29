package com.tejaswi.incident_command_center.dto;

import java.util.List;

public class IncidentAnalysisResponseDto {

    private Long incidentId;

    private String incidentTitle;

    private String analysis;

    private List<String> possibleCauses;

    private List<String> immediateActions;

    public IncidentAnalysisResponseDto() {
    }

    public IncidentAnalysisResponseDto(
            Long incidentId,
            String incidentTitle,
            String analysis,
            List<String> possibleCauses,
            List<String> immediateActions) {

        this.incidentId = incidentId;
        this.incidentTitle = incidentTitle;
        this.analysis = analysis;
        this.possibleCauses = possibleCauses;
        this.immediateActions = immediateActions;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public String getIncidentTitle() {
        return incidentTitle;
    }

    public void setIncidentTitle(String incidentTitle) {
        this.incidentTitle = incidentTitle;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }

    public List<String> getPossibleCauses() {
        return possibleCauses;
    }

    public void setPossibleCauses(List<String> possibleCauses) {
        this.possibleCauses = possibleCauses;
    }

    public List<String> getImmediateActions() {
        return immediateActions;
    }

    public void setImmediateActions(List<String> immediateActions) {
        this.immediateActions = immediateActions;
    }
}