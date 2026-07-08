package com.lowlands.coffee.modules.report.export;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReportExportMetadata(
        String reportName,
        String generatedBy,
        LocalDateTime generatedAt,
        LocalDate fromDate,
        LocalDate toDate,
        String store,
        String filterSummary
) {
}
