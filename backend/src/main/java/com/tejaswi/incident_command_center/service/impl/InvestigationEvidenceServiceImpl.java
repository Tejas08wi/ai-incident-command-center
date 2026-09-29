package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.entity.InvestigationEvidence;
import com.tejaswi.incident_command_center.repository.InvestigationEvidenceRepository;
import com.tejaswi.incident_command_center.service.InvestigationEvidenceService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvestigationEvidenceServiceImpl
        implements InvestigationEvidenceService {

    private final InvestigationEvidenceRepository
            investigationEvidenceRepository;

    public InvestigationEvidenceServiceImpl(
            InvestigationEvidenceRepository
                    investigationEvidenceRepository
    ) {
        this.investigationEvidenceRepository =
                investigationEvidenceRepository;
    }

    @Override
    public InvestigationEvidence addEvidence(
            Long investigationId,
            String toolName,
            String arguments,
            String result
    ) {

        InvestigationEvidence evidence =
                InvestigationEvidence.builder()
                        .investigationId(investigationId)
                        .toolName(toolName)
                        .arguments(arguments)
                        .result(result)
                        .createdAt(LocalDateTime.now())
                        .build();

        return investigationEvidenceRepository.save(
                evidence
        );
    }

    @Override
    public List<InvestigationEvidence> getEvidence(
            Long investigationId
    ) {

        return investigationEvidenceRepository
                .findByInvestigationIdOrderByCreatedAtAsc(
                        investigationId
                );
    }
}