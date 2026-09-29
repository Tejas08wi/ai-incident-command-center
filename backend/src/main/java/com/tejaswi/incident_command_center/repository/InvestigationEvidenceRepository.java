package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.InvestigationEvidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestigationEvidenceRepository
        extends JpaRepository<InvestigationEvidence, Long> {

    List<InvestigationEvidence> findByInvestigationIdOrderByCreatedAtAsc(
            Long investigationId
    );
}