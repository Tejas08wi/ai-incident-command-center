package com.tejaswi.incident_command_center.controller;

import com.tejaswi.incident_command_center.dto.ServiceLogResponseDto;
import com.tejaswi.incident_command_center.service.ServiceLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ServiceLogController {

    private final ServiceLogService serviceLogService;

    public ServiceLogController(
            ServiceLogService serviceLogService
    ) {
        this.serviceLogService = serviceLogService;
    }

    @GetMapping("/service/{serviceName}")
    public ResponseEntity<List<ServiceLogResponseDto>> getLogsByService(
            @PathVariable String serviceName
    ) {

        return ResponseEntity.ok(
                serviceLogService.getLogsByService(serviceName)
        );
    }
}