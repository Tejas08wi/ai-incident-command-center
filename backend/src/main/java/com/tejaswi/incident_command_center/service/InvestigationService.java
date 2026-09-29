package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.dto.InvestigationResponseDto;

import java.util.List;

public interface InvestigationService {

    InvestigationResponseDto createInvestigation(
            Long incidentId
    );

    InvestigationResponseDto completeInvestigation(
            Long investigationId,
            String finalAnalysis
    );

    InvestigationResponseDto rejectInvestigation(
            Long investigationId
    );

    List<InvestigationResponseDto> getInvestigationsByIncident(
            Long incidentId
    );

    InvestigationResponseDto getInvestigationById(
            Long investigationId
    );
}