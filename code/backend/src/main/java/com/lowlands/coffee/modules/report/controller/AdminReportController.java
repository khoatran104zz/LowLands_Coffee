package com.lowlands.coffee.modules.report.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;
import com.lowlands.coffee.modules.report.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<RevenueReportResponse> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId
    ) {
        return ApiResponse.success(reportService.getAdminRevenueReport(fromDate, toDate, storeId));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<OrderReportResponse> getOrderReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getAdminOrderReport(fromDate, toDate, storeId, orderStatus, keyword));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<PaymentReportResponse> getPaymentReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String paymentMethod
    ) {
        return ApiResponse.success(reportService.getAdminPaymentReport(fromDate, toDate, storeId, paymentMethod));
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<InventoryReportResponse> getInventoryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getAdminInventoryReport(fromDate, toDate, storeId, keyword));
    }

    @GetMapping("/goods-receipts")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<GoodsReceiptReportResponse> getGoodsReceiptReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getAdminGoodsReceiptReport(fromDate, toDate, storeId, keyword));
    }

    @GetMapping("/ingredient-consumption")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<IngredientConsumptionReportResponse> getIngredientConsumptionReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getAdminIngredientConsumptionReport(fromDate, toDate, storeId, keyword));
    }
}
