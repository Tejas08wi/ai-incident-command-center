package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.dto.IncidentRequestDto;
import com.tejaswi.incident_command_center.dto.IncidentResponseDto;
import com.tejaswi.incident_command_center.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponseDto> createIncident(
            @Valid @RequestBody IncidentRequestDto request) {

        IncidentResponseDto response =
                incidentService.createIncident(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDto>> getAllIncidents() {

        return ResponseEntity.ok(
                incidentService.getAllIncidents()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDto> getIncidentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                incidentService.getIncidentById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(
            @PathVariable Long id) {

        incidentService.deleteIncident(id);

        return ResponseEntity.noContent().build();
    }
}