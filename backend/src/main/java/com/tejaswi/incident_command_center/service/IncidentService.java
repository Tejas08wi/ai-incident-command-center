package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.dto.IncidentRequestDto;
import com.tejaswi.incident_command_center.dto.IncidentResponseDto;

import java.util.List;

public interface IncidentService {

    IncidentResponseDto createIncident(IncidentRequestDto request);

    List<IncidentResponseDto> getAllIncidents();

    IncidentResponseDto getIncidentById(Long id);

    void deleteIncident(Long id);
}