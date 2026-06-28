package com.lowlands.coffee.modules.dashboard.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.AdminDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ApiResponse<AdminDashboardSummaryResponse> getSummary() {
        return ApiResponse.success(dashboardService.getAdminSummary());
    }
}
