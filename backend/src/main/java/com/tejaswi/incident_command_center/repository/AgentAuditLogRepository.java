package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.AgentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgentAuditLogRepository
        extends JpaRepository<AgentAuditLog, Long> {

    List<AgentAuditLog> findByInvestigationIdOrderByCreatedAtAsc(
            Long investigationId
    );
}