package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.dto.InvestigationResponseDto;
import com.tejaswi.incident_command_center.service.InvestigationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investigations")
public class InvestigationController {

        private final InvestigationService investigationService;

        public InvestigationController(
                        InvestigationService investigationService) {
                this.investigationService = investigationService;
        }

        @PostMapping("/incident/{incidentId}")
        public ResponseEntity<InvestigationResponseDto> createInvestigation(
                        @PathVariable Long incidentId) {

                return ResponseEntity.ok(
                                investigationService.createInvestigation(
                                                incidentId));
        }

        @GetMapping("/{investigationId}")
        public ResponseEntity<InvestigationResponseDto> getInvestigation(
                        @PathVariable Long investigationId) {

                return ResponseEntity.ok(
                                investigationService.getInvestigationById(
                                                investigationId));
        }

        @GetMapping("/incident/{incidentId}")
        public ResponseEntity<List<InvestigationResponseDto>> getInvestigationsByIncident(
                        @PathVariable Long incidentId) {

                return ResponseEntity.ok(
                                investigationService
                                                .getInvestigationsByIncident(incidentId));
        }

        @PutMapping("/{investigationId}/complete")
        public ResponseEntity<InvestigationResponseDto> completeInvestigation(
                        @PathVariable Long investigationId,
                        @RequestBody String finalAnalysis) {

                return ResponseEntity.ok(
                                investigationService.completeInvestigation(
                                                investigationId,
                                                finalAnalysis));
        }

        @PutMapping("/{investigationId}/reject")
        public ResponseEntity<InvestigationResponseDto> rejectInvestigation(
                        @PathVariable Long investigationId) {

                return ResponseEntity.ok(
                                investigationService.rejectInvestigation(
                                                investigationId));
        }
}