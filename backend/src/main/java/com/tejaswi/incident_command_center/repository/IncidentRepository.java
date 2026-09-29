package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.Incident;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
}
