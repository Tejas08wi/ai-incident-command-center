package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.dto.ServiceHealthRequestDto;
import com.tejaswi.incident_command_center.dto.ServiceHealthResponseDto;
import com.tejaswi.incident_command_center.service.ServiceHealthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
public class ServiceHealthController {

    private final ServiceHealthService serviceHealthService;

    public ServiceHealthController(
            ServiceHealthService serviceHealthService
    ) {
        this.serviceHealthService = serviceHealthService;
    }

    @GetMapping("/service/{serviceName}")
    public ResponseEntity<ServiceHealthResponseDto> getServiceHealth(
            @PathVariable String serviceName
    ) {

        return ResponseEntity.ok(
                serviceHealthService.getLatestHealth(
                        serviceName
                )
        );
    }

    @PostMapping("/service")
    public ResponseEntity<ServiceHealthResponseDto> createHealthRecord(
            @Valid @RequestBody ServiceHealthRequestDto request
    ) {

        return ResponseEntity.ok(
                serviceHealthService.createHealthRecord(
                        request
                )
        );
    }
}