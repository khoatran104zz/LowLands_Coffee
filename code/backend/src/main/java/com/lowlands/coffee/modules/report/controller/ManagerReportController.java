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
@RequestMapping("/api/v1/manager/reports")
public class ManagerReportController {

    private final ReportService reportService;

    public ManagerReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<RevenueReportResponse> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ApiResponse.success(reportService.getManagerRevenueReport(fromDate, toDate));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<OrderReportResponse> getOrderReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getManagerOrderReport(fromDate, toDate, orderStatus, keyword));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<PaymentReportResponse> getPaymentReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String paymentMethod
    ) {
        return ApiResponse.success(reportService.getManagerPaymentReport(fromDate, toDate, paymentMethod));
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<InventoryReportResponse> getInventoryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getManagerInventoryReport(fromDate, toDate, keyword));
    }

    @GetMapping("/goods-receipts")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<GoodsReceiptReportResponse> getGoodsReceiptReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getManagerGoodsReceiptReport(fromDate, toDate, keyword));
    }

    @GetMapping("/ingredient-consumption")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<IngredientConsumptionReportResponse> getIngredientConsumptionReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(reportService.getManagerIngredientConsumptionReport(fromDate, toDate, keyword));
    }
}
