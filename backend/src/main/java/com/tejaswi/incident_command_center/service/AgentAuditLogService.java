package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.entity.AgentAuditLog;

import java.util.List;

public interface AgentAuditLogService {

    AgentAuditLog createAuditLog(
            Long investigationId,
            String eventType,
            String message
    );

    List<AgentAuditLog> getAuditLogs(
            Long investigationId
    );
}