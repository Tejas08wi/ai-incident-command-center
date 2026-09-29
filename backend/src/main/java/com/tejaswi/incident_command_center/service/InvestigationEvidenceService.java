package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.entity.InvestigationEvidence;

import java.util.List;

public interface InvestigationEvidenceService {

    InvestigationEvidence addEvidence(
            Long investigationId,
            String toolName,
            String arguments,
            String result
    );

    List<InvestigationEvidence> getEvidence(
            Long investigationId
    );
}