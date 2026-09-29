    package com.tejaswi.incident_command_center.service;

    import com.tejaswi.incident_command_center.dto.ServiceLogResponseDto;

    import java.util.List;

    public interface ServiceLogService {

        List<ServiceLogResponseDto> getLogsByService(
                String serviceName
        );
    }