package com.lowlands.coffee.modules.notification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(name = "sender_name", length = 100)
    private String senderName;

    @Column(name = "recipient_user_id")
    private Long recipientUserId;

    @Column(name = "recipient_role", length = 50)
    private String recipientRole;

    @Column(name = "store_id")
    private Long storeId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(length = 255)
    private String link;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
