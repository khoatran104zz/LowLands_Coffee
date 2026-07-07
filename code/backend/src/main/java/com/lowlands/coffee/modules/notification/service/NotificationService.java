package com.lowlands.coffee.modules.notification.service;

import com.lowlands.coffee.modules.notification.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications(String email);
    void markAsRead(Long id, String email);
    void markAllAsRead(String email);
    void createNotification(
            String title,
            String content,
            String type,
            String senderName,
            Long recipientUserId,
            String recipientRole,
            Long storeId,
            String link
    );
}
