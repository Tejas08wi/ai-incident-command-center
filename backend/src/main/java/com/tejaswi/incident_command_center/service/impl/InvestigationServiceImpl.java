package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.dto.InvestigationResponseDto;
import com.tejaswi.incident_command_center.entity.Investigation;
import com.tejaswi.incident_command_center.repository.InvestigationRepository;
import com.tejaswi.incident_command_center.service.InvestigationService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvestigationServiceImpl
                implements InvestigationService {

        private final InvestigationRepository investigationRepository;

        public InvestigationServiceImpl(
                        InvestigationRepository investigationRepository) {
                this.investigationRepository = investigationRepository;
        }

        @Override
        public InvestigationResponseDto createInvestigation(
                        Long incidentId) {

                Investigation investigation = Investigation.builder()
                                .incidentId(incidentId)
                                .startedAt(LocalDateTime.now())
                                .status("IN_PROGRESS")
                                .build();

                Investigation saved = investigationRepository.save(investigation);

                return mapToDto(saved);
        }

        @Override
        public InvestigationResponseDto completeInvestigation(
                        Long investigationId,
                        String finalAnalysis) {

                Investigation investigation = investigationRepository.findById(investigationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Investigation not found: "
                                                                + investigationId));

                investigation.setCompletedAt(
                                LocalDateTime.now());

                investigation.setStatus("COMPLETED");

                investigation.setFinalAnalysis(
                                finalAnalysis);

                Investigation saved = investigationRepository.save(investigation);

                return mapToDto(saved);
        }

        @Override
        public List<InvestigationResponseDto> getInvestigationsByIncident(Long incidentId) {

                return investigationRepository
                                .findByIncidentIdOrderByStartedAtDesc(incidentId)
                                .stream()
                                .map(this::mapToDto)
                                .toList();
        }

        @Override
        public InvestigationResponseDto getInvestigationById(
                        Long investigationId) {

                Investigation investigation = investigationRepository.findById(investigationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Investigation not found: "
                                                                + investigationId));

                return mapToDto(investigation);
        }

        private InvestigationResponseDto mapToDto(
                        Investigation investigation) {

                return InvestigationResponseDto.builder()
                                .id(investigation.getId())
                                .incidentId(investigation.getIncidentId())
                                .startedAt(investigation.getStartedAt())
                                .completedAt(investigation.getCompletedAt())
                                .status(investigation.getStatus())
                                .finalAnalysis(investigation.getFinalAnalysis())
                                .build();
        }

        @Override
        public InvestigationResponseDto rejectInvestigation(
                        Long investigationId) {

                Investigation investigation = investigationRepository.findById(investigationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Investigation not found: "
                                                                + investigationId));

                investigation.setCompletedAt(
                                LocalDateTime.now());

                investigation.setStatus("REJECTED");

                investigation.setFinalAnalysis(
                                "Investigation was rejected by the human operator.");

                Investigation saved = investigationRepository.save(investigation);

                return mapToDto(saved);
        }
}