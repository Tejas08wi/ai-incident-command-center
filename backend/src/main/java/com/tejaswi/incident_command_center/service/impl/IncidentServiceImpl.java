package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.dto.IncidentRequestDto;
import com.tejaswi.incident_command_center.dto.IncidentResponseDto;
import com.tejaswi.incident_command_center.entity.Incident;
import com.tejaswi.incident_command_center.exception.IncidentNotFoundException;
import com.tejaswi.incident_command_center.repository.IncidentRepository;
import com.tejaswi.incident_command_center.service.IncidentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentServiceImpl(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Override
    public IncidentResponseDto createIncident(IncidentRequestDto request) {

        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .serviceName(request.getServiceName())
                .severity(request.getSeverity())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        Incident savedIncident = incidentRepository.save(incident);

        return mapToResponse(savedIncident);
    }

    @Override
    public List<IncidentResponseDto> getAllIncidents() {

        return incidentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public IncidentResponseDto getIncidentById(Long id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException(
                        "Incident not found with id: " + id));

        return mapToResponse(incident);
    }

    @Override
    public void deleteIncident(Long id) {

        if (!incidentRepository.existsById(id)) {
            throw new IncidentNotFoundException(
                    "Incident not found with id: " + id);
        }

        incidentRepository.deleteById(id);
    }

    private IncidentResponseDto mapToResponse(Incident incident) {

        return new IncidentResponseDto(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getServiceName(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getCreatedAt());
    }
}