package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.entity.AgentAuditLog;
import com.tejaswi.incident_command_center.service.AgentAuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investigations")
public class AgentAuditLogController {

    private final AgentAuditLogService auditLogService;

    public AgentAuditLogController(
            AgentAuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/{investigationId}/audit-logs")
    public ResponseEntity<List<AgentAuditLog>> getAuditLogs(
            @PathVariable Long investigationId) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogs(
                        investigationId));
    }

    @PostMapping("/{investigationId}/audit-logs")
    public ResponseEntity<AgentAuditLog> createAuditLog(
            @PathVariable Long investigationId,
            @RequestParam String eventType,
            @RequestParam String message) {

        return ResponseEntity.ok(
                auditLogService.createAuditLog(
                        investigationId,
                        eventType,
                        message));
    }
}