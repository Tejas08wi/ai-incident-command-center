package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.ai.GeminiService;
import com.tejaswi.incident_command_center.ai.IncidentAnalysisPromptBuilder;
import com.tejaswi.incident_command_center.dto.IncidentAnalysisResponseDto;
import com.tejaswi.incident_command_center.entity.Incident;
import com.tejaswi.incident_command_center.exception.IncidentNotFoundException;
import com.tejaswi.incident_command_center.repository.IncidentRepository;
import com.tejaswi.incident_command_center.service.AiService;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class AiServiceImpl implements AiService {

    private final GeminiService geminiService;
    private final IncidentRepository incidentRepository;
    private final ObjectMapper objectMapper;
    private final IncidentAnalysisPromptBuilder promptBuilder;

    public AiServiceImpl(
            GeminiService geminiService,
            IncidentRepository incidentRepository,
            ObjectMapper objectMapper,
            IncidentAnalysisPromptBuilder promptBuilder) {

        this.geminiService = geminiService;
        this.incidentRepository = incidentRepository;
        this.objectMapper = objectMapper;
        this.promptBuilder = promptBuilder;
    }

    @Override
    public String generateResponse(String prompt) {
        return geminiService.generateResponse(prompt);
    }

    @Override
    public IncidentAnalysisResponseDto analyzeIncident(Long incidentId) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IncidentNotFoundException(
                        "Incident not found with id: " + incidentId));

        String prompt = promptBuilder.buildPrompt(incident);

        String aiResponse = geminiService.generateResponse(prompt);

        try {

            IncidentAnalysisResponseDto analysis = objectMapper.readValue(
                    aiResponse,
                    IncidentAnalysisResponseDto.class);

            analysis.setIncidentId(incident.getId());
            analysis.setIncidentTitle(incident.getTitle());

            return analysis;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to parse AI response",
                    e);
        }
    }
}