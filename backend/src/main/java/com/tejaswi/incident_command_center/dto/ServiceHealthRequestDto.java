package com.tejaswi.incident_command_center.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceHealthRequestDto {

    @NotBlank
    private String serviceName;

    @NotBlank
    private String status;

    @NotNull
    private Integer responseTime;
}