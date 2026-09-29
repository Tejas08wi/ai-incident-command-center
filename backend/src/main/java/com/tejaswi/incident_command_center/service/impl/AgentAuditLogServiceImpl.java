package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.entity.AgentAuditLog;
import com.tejaswi.incident_command_center.repository.AgentAuditLogRepository;
import com.tejaswi.incident_command_center.service.AgentAuditLogService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AgentAuditLogServiceImpl
        implements AgentAuditLogService {

    private final AgentAuditLogRepository auditLogRepository;

    public AgentAuditLogServiceImpl(
            AgentAuditLogRepository auditLogRepository
    ) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public AgentAuditLog createAuditLog(
            Long investigationId,
            String eventType,
            String message
    ) {

        AgentAuditLog auditLog = AgentAuditLog.builder()
                .investigationId(investigationId)
                .eventType(eventType)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();

        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AgentAuditLog> getAuditLogs(
            Long investigationId
    ) {

        return auditLogRepository
                .findByInvestigationIdOrderByCreatedAtAsc(
                        investigationId
                );
    }
}