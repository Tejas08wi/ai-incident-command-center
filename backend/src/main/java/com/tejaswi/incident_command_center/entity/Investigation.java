package com.tejaswi.incident_command_center.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "investigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long incidentId;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private String status;

    @Lob 
    @Column(columnDefinition = "LONGTEXT")
    private String finalAnalysis;
}