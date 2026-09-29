package com.tejaswi.incident_command_center.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceHealthResponseDto {

    private Long id;

    private String serviceName;

    private String status;

    private Integer responseTime;

    private LocalDateTime checkedAt;
}