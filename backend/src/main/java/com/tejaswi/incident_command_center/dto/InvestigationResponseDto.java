package com.tejaswi.incident_command_center.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationResponseDto {

    private Long id;

    private Long incidentId;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private String status;

    private String finalAnalysis;
}