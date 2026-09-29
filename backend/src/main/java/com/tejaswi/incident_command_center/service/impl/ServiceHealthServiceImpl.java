package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.dto.ServiceHealthRequestDto;
import com.tejaswi.incident_command_center.dto.ServiceHealthResponseDto;
import com.tejaswi.incident_command_center.entity.ServiceHealth;
import com.tejaswi.incident_command_center.exception.ServiceHealthNotFoundException;
import com.tejaswi.incident_command_center.repository.ServiceHealthRepository;
import com.tejaswi.incident_command_center.service.ServiceHealthService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ServiceHealthServiceImpl
        implements ServiceHealthService {

    private final ServiceHealthRepository serviceHealthRepository;

    public ServiceHealthServiceImpl(
            ServiceHealthRepository serviceHealthRepository
    ) {
        this.serviceHealthRepository = serviceHealthRepository;
    }

    @Override
    public ServiceHealthResponseDto getLatestHealth(
            String serviceName
    ) {

        ServiceHealth health =
                serviceHealthRepository
                        .findFirstByServiceNameOrderByCheckedAtDesc(
                                serviceName
                        )
                        .orElseThrow(() ->
                                new ServiceHealthNotFoundException(
                                        "No health information found for service: "
                                                + serviceName
                                )
                        );

        return mapToResponse(health);
    }

    @Override
    public ServiceHealthResponseDto createHealthRecord(
            ServiceHealthRequestDto request
    ) {

        ServiceHealth health =
                ServiceHealth.builder()
                        .serviceName(request.getServiceName())
                        .status(request.getStatus())
                        .responseTime(request.getResponseTime())
                        .checkedAt(LocalDateTime.now())
                        .build();

        ServiceHealth savedHealth =
                serviceHealthRepository.save(health);

        return mapToResponse(savedHealth);
    }

    private ServiceHealthResponseDto mapToResponse(
            ServiceHealth health
    ) {

        return ServiceHealthResponseDto.builder()
                .id(health.getId())
                .serviceName(health.getServiceName())
                .status(health.getStatus())
                .responseTime(health.getResponseTime())
                .checkedAt(health.getCheckedAt())
                .build();
    }
}