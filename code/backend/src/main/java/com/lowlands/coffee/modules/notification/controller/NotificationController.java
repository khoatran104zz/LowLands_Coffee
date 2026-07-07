package com.lowlands.coffee.modules.notification.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.notification.dto.response.NotificationResponse;
import com.lowlands.coffee.modules.notification.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications(Authentication authentication) {
        if (authentication == null) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(notificationService.getMyNotifications(authentication.getName()));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<String> markAsRead(@PathVariable Long id, Authentication authentication) {
        if (authentication != null) {
            notificationService.markAsRead(id, authentication.getName());
        }
        return ApiResponse.success("Notification marked as read", "OK");
    }

    @PostMapping("/read-all")
    public ApiResponse<String> markAllAsRead(Authentication authentication) {
        if (authentication != null) {
            notificationService.markAllAsRead(authentication.getName());
        }
        return ApiResponse.success("All notifications marked as read", "OK");
    }
}
