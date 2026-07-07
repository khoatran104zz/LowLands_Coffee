package com.lowlands.coffee.modules.notification.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private String title;
    private String content;
    private String type;
    private String senderName;
    private boolean isRead;
    private String link;
    private LocalDateTime createdAt;
}
