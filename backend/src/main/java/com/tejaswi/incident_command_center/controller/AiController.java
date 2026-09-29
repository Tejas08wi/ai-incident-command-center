package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.dto.AiRequestDto;
import com.tejaswi.incident_command_center.dto.AiResponseDto;
import com.tejaswi.incident_command_center.dto.IncidentAnalysisResponseDto;
import com.tejaswi.incident_command_center.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/test")
    public ResponseEntity<AiResponseDto> testAi(
            @Valid @RequestBody AiRequestDto request) {

        String response = aiService.generateResponse(request.getPrompt());

        return ResponseEntity.ok(
                new AiResponseDto(response));
    }

    @GetMapping("/analyze/{incidentId}")
    public ResponseEntity<IncidentAnalysisResponseDto> analyzeIncident(
            @PathVariable Long incidentId) {

        IncidentAnalysisResponseDto response = aiService.analyzeIncident(incidentId);

        return ResponseEntity.ok(response);
    }
}