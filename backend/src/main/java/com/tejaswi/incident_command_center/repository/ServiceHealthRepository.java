package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.ServiceHealth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceHealthRepository
        extends JpaRepository<ServiceHealth, Long> {

    Optional<ServiceHealth> findFirstByServiceNameOrderByCheckedAtDesc(
            String serviceName
    );
}