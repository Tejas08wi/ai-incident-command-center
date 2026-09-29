package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.dto.ServiceHealthRequestDto;
import com.tejaswi.incident_command_center.dto.ServiceHealthResponseDto;

public interface ServiceHealthService {

    ServiceHealthResponseDto getLatestHealth(
            String serviceName
    );

    ServiceHealthResponseDto createHealthRecord(
            ServiceHealthRequestDto request
    );
}