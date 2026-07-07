package com.lowlands.coffee.modules.report.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.report.entity.ReportExportLogEntity;
import com.lowlands.coffee.modules.report.repository.ReportExportLogRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportExportController {

    private final ReportExportLogRepository repository;

    public ReportExportController(ReportExportLogRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/export")
    public ApiResponse<String> logExport(
            @RequestBody ExportRequest request,
            Authentication authentication
    ) {
        ReportExportLogEntity entity = new ReportExportLogEntity();
        entity.setReportType(request.getReportType());
        entity.setExportFormat(request.getExportFormat());
        entity.setFilters(request.getFilters());
        
        String username = (authentication != null) ? authentication.getName() : "anonymous";
        entity.setCreatedBy(username);

        repository.save(entity);

        return ApiResponse.success("Export details logged successfully in database.", "OK");
    }

    @Getter
    @Setter
    public static class ExportRequest {
        private String reportType;
        private String exportFormat;
        private String filters;
    }
}
