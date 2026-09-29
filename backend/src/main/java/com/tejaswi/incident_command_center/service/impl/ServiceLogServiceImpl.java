package com.tejaswi.incident_command_center.service.impl;

import com.tejaswi.incident_command_center.dto.ServiceLogResponseDto;
import com.tejaswi.incident_command_center.entity.ServiceLog;
import com.tejaswi.incident_command_center.repository.ServiceLogRepository;
import com.tejaswi.incident_command_center.service.ServiceLogService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceLogServiceImpl implements ServiceLogService {

    private final ServiceLogRepository serviceLogRepository;

    public ServiceLogServiceImpl(
            ServiceLogRepository serviceLogRepository
    ) {
        this.serviceLogRepository = serviceLogRepository;
    }

    @Override
    public List<ServiceLogResponseDto> getLogsByService(
            String serviceName
    ) {

        List<ServiceLog> logs =
                serviceLogRepository
                        .findByServiceNameOrderByTimestampDesc(
                                serviceName
                        );

        return logs.stream()
                .map(log -> ServiceLogResponseDto.builder()
                        .id(log.getId())
                        .serviceName(log.getServiceName())
                        .timestamp(log.getTimestamp())
                        .level(log.getLevel())
                        .message(log.getMessage())
                        .build())
                .toList();
    }
}