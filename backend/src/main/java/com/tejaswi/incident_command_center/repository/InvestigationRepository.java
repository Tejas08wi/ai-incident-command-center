package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestigationRepository
        extends JpaRepository<Investigation, Long> {

    List<Investigation> findByIncidentIdOrderByStartedAtDesc(
            Long incidentId
    );
}