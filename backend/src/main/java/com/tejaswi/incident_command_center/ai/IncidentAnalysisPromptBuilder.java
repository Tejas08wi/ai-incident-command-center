package com.tejaswi.incident_command_center.ai;

import com.tejaswi.incident_command_center.entity.Incident;
import org.springframework.stereotype.Component;

@Component
public class IncidentAnalysisPromptBuilder {

    public String buildPrompt(Incident incident) {

        return """
                Analyze the following production incident.

                Incident ID: %d
                Title: %s
                Description: %s
                Severity: %s

                Return ONLY valid JSON.

                The JSON must have exactly these fields:

                {
                  "analysis": "short analysis of the incident",
                  "possibleCauses": [
                    "possible cause 1",
                    "possible cause 2"
                  ],
                  "immediateActions": [
                    "immediate action 1",
                    "immediate action 2"
                  ]
                }

                Do not include markdown.
                Do not include ```json.
                Do not include any explanation outside the JSON.
                """.formatted(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getSeverity()
        );
    }
}