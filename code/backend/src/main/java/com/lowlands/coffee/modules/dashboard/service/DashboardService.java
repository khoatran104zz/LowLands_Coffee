package com.lowlands.coffee.modules.dashboard.service;

import com.lowlands.coffee.modules.dashboard.dto.response.AdminDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.ManagerDashboardSummaryResponse;

public interface DashboardService {

    AdminDashboardSummaryResponse getAdminSummary();

    ManagerDashboardSummaryResponse getManagerSummary(String managerEmail);
}
