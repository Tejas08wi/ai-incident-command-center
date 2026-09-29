package com.tejaswi.incident_command_center.dto;

import java.time.LocalDateTime;

public class IncidentResponseDto {

    private Long id;
    private String title;
    private String description;
    private String serviceName;
    private String severity;
    private String status;
    private LocalDateTime createdAt;

    public IncidentResponseDto() {
    }

    public IncidentResponseDto(
            Long id,
            String title,
            String description,
            String serviceName,
            String severity,
            String status,
            LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.serviceName = serviceName;
        this.severity = severity;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getSeverity() {
        return severity;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}