package com.tejaswi.incident_command_center.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceLogResponseDto {

    private Long id;

    private String serviceName;

    private LocalDateTime timestamp;

    private String level;

    private String message;
}