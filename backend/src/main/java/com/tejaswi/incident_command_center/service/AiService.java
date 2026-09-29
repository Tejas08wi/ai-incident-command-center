package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.dto.AiResponseDto;
import com.tejaswi.incident_command_center.dto.IncidentAnalysisResponseDto;

public interface AiService {

    String generateResponse(String prompt);

    IncidentAnalysisResponseDto analyzeIncident(Long incidentId);
}