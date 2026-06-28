package com.lowlands.coffee.modules.dashboard.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.ManagerDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/manager/dashboard")
public class ManagerDashboardController {

    private final DashboardService dashboardService;

    public ManagerDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ApiResponse<ManagerDashboardSummaryResponse> getSummary(Authentication authentication) {
        return ApiResponse.success(dashboardService.getManagerSummary(authentication.getName()));
    }
}
