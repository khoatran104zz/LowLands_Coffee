package com.lowlands.coffee.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "report_export_logs")
public class ReportExportLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_type", nullable = false, length = 50)
    private String reportType;

    @Column(name = "export_format", nullable = false, length = 10)
    private String exportFormat;

    @Column(columnDefinition = "TEXT")
    private String filters;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 150)
    private String createdBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
