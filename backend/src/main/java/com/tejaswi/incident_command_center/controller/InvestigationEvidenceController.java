package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.entity.InvestigationEvidence;
import com.tejaswi.incident_command_center.service.InvestigationEvidenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investigations")
public class InvestigationEvidenceController {

    private final InvestigationEvidenceService
            investigationEvidenceService;

    public InvestigationEvidenceController(
            InvestigationEvidenceService
                    investigationEvidenceService
    ) {
        this.investigationEvidenceService =
                investigationEvidenceService;
    }

    @PostMapping("/{investigationId}/evidence")
    public ResponseEntity<InvestigationEvidence> addEvidence(
            @PathVariable Long investigationId,
            @RequestParam String toolName,
            @RequestParam String arguments,
            @RequestParam String result
    ) {

        return ResponseEntity.ok(
                investigationEvidenceService.addEvidence(
                        investigationId,
                        toolName,
                        arguments,
                        result
                )
        );
    }

    @GetMapping("/{investigationId}/evidence")
    public ResponseEntity<List<InvestigationEvidence>>
    getEvidence(
            @PathVariable Long investigationId
    ) {

        return ResponseEntity.ok(
                investigationEvidenceService.getEvidence(
                        investigationId
                )
        );
    }
}