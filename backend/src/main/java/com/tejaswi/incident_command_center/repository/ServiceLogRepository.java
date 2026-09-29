package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.ServiceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceLogRepository
        extends JpaRepository<ServiceLog, Long> {

    List<ServiceLog> findByServiceNameOrderByTimestampDesc(
            String serviceName
    );
}