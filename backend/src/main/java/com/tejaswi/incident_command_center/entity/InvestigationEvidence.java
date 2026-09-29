package com.tejaswi.incident_command_center.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "investigation_evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long investigationId;

    private String toolName;

    @Column(length = 2000)
    private String arguments;

    @Column(length = 5000)
    private String result;

    private LocalDateTime createdAt;
}