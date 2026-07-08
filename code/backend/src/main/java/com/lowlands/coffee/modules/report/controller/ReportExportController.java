package com.lowlands.coffee.modules.report.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;
import com.lowlands.coffee.modules.report.entity.ReportExportLogEntity;
import com.lowlands.coffee.modules.report.export.ExcelExportService;
import com.lowlands.coffee.modules.report.export.ReportExcelFile;
import com.lowlands.coffee.modules.report.export.ReportExportMetadata;
import com.lowlands.coffee.modules.report.repository.ReportExportLogRepository;
import com.lowlands.coffee.modules.report.service.ReportService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/v1")
public class ReportExportController {

    private final ReportExportLogRepository repository;
    private final ReportService reportService;
    private final ExcelExportService excelExportService;

    public ReportExportController(
            ReportExportLogRepository repository,
            ReportService reportService,
            ExcelExportService excelExportService
    ) {
        this.repository = repository;
        this.reportService = reportService;
        this.excelExportService = excelExportService;
    }

    @PostMapping("/reports/export")
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

    @GetMapping("/admin/reports/export/excel")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<byte[]> exportAdminExcel(
            @RequestParam String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String keyword,
            Authentication authentication
    ) {
        return excelResponse(exportAdminFile(reportType, fromDate, toDate, storeId, paymentMethod, orderStatus, keyword, authentication));
    }

    @GetMapping("/manager/reports/export/excel")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<byte[]> exportManagerExcel(
            @RequestParam String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String keyword,
            Authentication authentication
    ) {
        return excelResponse(exportManagerFile(reportType, fromDate, toDate, paymentMethod, orderStatus, keyword, authentication));
    }

    private ReportExcelFile exportAdminFile(
            String reportType,
            LocalDate fromDate,
            LocalDate toDate,
            Long storeId,
            String paymentMethod,
            String orderStatus,
            String keyword,
            Authentication authentication
    ) {
        DateRange range = resolveRange(fromDate, toDate);
        return switch (normalizeReportType(reportType)) {
            case "revenue" -> {
                RevenueReportResponse report = reportService.getAdminRevenueReport(fromDate, toDate, storeId);
                yield excelExportService.exportRevenue(report, metadata("Revenue Report", authentication, range, storeLabel(storeId, storesFromRevenue(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "orders" -> {
                OrderReportResponse report = reportService.getAdminOrderReport(fromDate, toDate, storeId, orderStatus, keyword);
                yield excelExportService.exportOrders(report, metadata("Orders Report", authentication, range, storeLabel(storeId, storesFromOrders(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "payment" -> {
                PaymentReportResponse report = reportService.getAdminPaymentReport(fromDate, toDate, storeId, paymentMethod);
                yield excelExportService.exportPayments(report, metadata("Payment Report", authentication, range, storeLabel(storeId, storesFromPayments(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "inventory" -> {
                InventoryReportResponse report = reportService.getAdminInventoryReport(fromDate, toDate, storeId, keyword);
                yield excelExportService.exportInventory(report, metadata("Inventory Report", authentication, range, storeLabel(storeId, storesFromInventory(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "goods-receipt" -> {
                GoodsReceiptReportResponse report = reportService.getAdminGoodsReceiptReport(fromDate, toDate, storeId, keyword);
                yield excelExportService.exportGoodsReceipts(report, metadata("Goods Receipt Report", authentication, range, storeLabel(storeId, storesFromGoodsReceipts(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "consumption" -> {
                IngredientConsumptionReportResponse report = reportService.getAdminIngredientConsumptionReport(fromDate, toDate, storeId, keyword);
                yield excelExportService.exportIngredientConsumption(report, metadata("Ingredient Consumption Report", authentication, range, storeId == null ? "All Stores" : "Store ID " + storeId, filterSummary(paymentMethod, orderStatus, keyword)));
            }
            default -> throw unsupportedReportType(reportType);
        };
    }

    private ReportExcelFile exportManagerFile(
            String reportType,
            LocalDate fromDate,
            LocalDate toDate,
            String paymentMethod,
            String orderStatus,
            String keyword,
            Authentication authentication
    ) {
        DateRange range = resolveRange(fromDate, toDate);
        return switch (normalizeReportType(reportType)) {
            case "revenue" -> {
                RevenueReportResponse report = reportService.getManagerRevenueReport(fromDate, toDate);
                yield excelExportService.exportRevenue(report, metadata("Revenue Report", authentication, range, storeLabel(null, storesFromRevenue(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "orders" -> {
                OrderReportResponse report = reportService.getManagerOrderReport(fromDate, toDate, orderStatus, keyword);
                yield excelExportService.exportOrders(report, metadata("Orders Report", authentication, range, storeLabel(null, storesFromOrders(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "payment" -> {
                PaymentReportResponse report = reportService.getManagerPaymentReport(fromDate, toDate, paymentMethod);
                yield excelExportService.exportPayments(report, metadata("Payment Report", authentication, range, storeLabel(null, storesFromPayments(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "inventory" -> {
                InventoryReportResponse report = reportService.getManagerInventoryReport(fromDate, toDate, keyword);
                yield excelExportService.exportInventory(report, metadata("Inventory Report", authentication, range, storeLabel(null, storesFromInventory(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "goods-receipt" -> {
                GoodsReceiptReportResponse report = reportService.getManagerGoodsReceiptReport(fromDate, toDate, keyword);
                yield excelExportService.exportGoodsReceipts(report, metadata("Goods Receipt Report", authentication, range, storeLabel(null, storesFromGoodsReceipts(report)), filterSummary(paymentMethod, orderStatus, keyword)));
            }
            case "consumption" -> {
                IngredientConsumptionReportResponse report = reportService.getManagerIngredientConsumptionReport(fromDate, toDate, keyword);
                yield excelExportService.exportIngredientConsumption(report, metadata("Ingredient Consumption Report", authentication, range, "Manager Store", filterSummary(paymentMethod, orderStatus, keyword)));
            }
            default -> throw unsupportedReportType(reportType);
        };
    }

    private ResponseEntity<byte[]> excelResponse(ReportExcelFile file) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.filename()).build().toString())
                .body(file.content());
    }

    private ReportExportMetadata metadata(
            String reportName,
            Authentication authentication,
            DateRange range,
            String store,
            String filterSummary
    ) {
        return new ReportExportMetadata(
                reportName,
                authentication == null ? "anonymous" : authentication.getName(),
                LocalDateTime.now(),
                range.fromDate(),
                range.toDate(),
                store,
                filterSummary
        );
    }

    private DateRange resolveRange(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        LocalDate resolvedFrom = fromDate == null ? today.withDayOfMonth(1) : fromDate;
        LocalDate resolvedTo = toDate == null ? today : toDate;
        if (resolvedTo.isBefore(resolvedFrom)) {
            resolvedTo = resolvedFrom;
        }
        return new DateRange(resolvedFrom, resolvedTo);
    }

    private String normalizeReportType(String reportType) {
        return reportType == null ? "" : reportType.trim().toLowerCase();
    }

    private BadRequestException unsupportedReportType(String reportType) {
        return new BadRequestException("Unsupported report type: " + reportType);
    }

    private String filterSummary(String paymentMethod, String orderStatus, String keyword) {
        StringBuilder summary = new StringBuilder();
        appendFilter(summary, "Payment Method", paymentMethod);
        appendFilter(summary, "Order Status", orderStatus);
        appendFilter(summary, "Keyword", keyword);
        return summary.isEmpty() ? "No extra filters" : summary.toString();
    }

    private void appendFilter(StringBuilder summary, String label, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (!summary.isEmpty()) {
            summary.append("; ");
        }
        summary.append(label).append(": ").append(value.trim());
    }

    private String storeLabel(Long requestedStoreId, Set<String> stores) {
        if (stores.isEmpty()) {
            return requestedStoreId == null ? "All Stores" : "Store ID " + requestedStoreId;
        }
        if (stores.size() == 1) {
            return stores.iterator().next();
        }
        return requestedStoreId == null ? "All Stores" : "Multiple Stores";
    }

    private Set<String> storesFromRevenue(RevenueReportResponse report) {
        Set<String> stores = new LinkedHashSet<>();
        report.rows().forEach(row -> stores.add(row.storeName()));
        return stores;
    }

    private Set<String> storesFromOrders(OrderReportResponse report) {
        Set<String> stores = new LinkedHashSet<>();
        report.rows().forEach(row -> stores.add(row.storeName()));
        return stores;
    }

    private Set<String> storesFromPayments(PaymentReportResponse report) {
        Set<String> stores = new LinkedHashSet<>();
        report.details().forEach(row -> stores.add(row.storeName()));
        return stores;
    }

    private Set<String> storesFromInventory(InventoryReportResponse report) {
        Set<String> stores = new LinkedHashSet<>();
        report.rows().forEach(row -> stores.add(row.storeName()));
        return stores;
    }

    private Set<String> storesFromGoodsReceipts(GoodsReceiptReportResponse report) {
        Set<String> stores = new LinkedHashSet<>();
        report.rows().forEach(row -> stores.add(row.storeName()));
        return stores;
    }

    @Getter
    @Setter
    public static class ExportRequest {
        private String reportType;
        private String exportFormat;
        private String filters;
    }

    private record DateRange(LocalDate fromDate, LocalDate toDate) {
    }
}
