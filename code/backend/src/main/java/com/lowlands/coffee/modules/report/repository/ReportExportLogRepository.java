package com.lowlands.coffee.modules.report.repository;

import com.lowlands.coffee.modules.report.entity.ReportExportLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportExportLogRepository extends JpaRepository<ReportExportLogEntity, Long> {
}
