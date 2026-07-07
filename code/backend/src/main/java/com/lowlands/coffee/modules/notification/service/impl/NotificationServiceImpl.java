package com.lowlands.coffee.modules.notification.service.impl;

import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.notification.dto.response.NotificationResponse;
import com.lowlands.coffee.modules.notification.entity.NotificationEntity;
import com.lowlands.coffee.modules.notification.repository.NotificationRepository;
import com.lowlands.coffee.modules.notification.service.NotificationService;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StoreUserRepository storeUserRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            StoreUserRepository storeUserRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.storeUserRepository = storeUserRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String roleName = user.getRole() != null ? user.getRole().getName().toUpperCase() : "";
        Long storeId = null;

        // If user is a MANAGER or STAFF, check store assignment
        if ("MANAGER".equals(roleName) || "STAFF".equals(roleName)) {
            storeId = storeUserRepository.findByUserId(user.getId()).stream()
                    .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                    .map(StoreUserEntity::getStore)
                    .map(store -> store.getId())
                    .findFirst()
                    .orElse(null);
        }

        List<NotificationEntity> entities = notificationRepository.findMyNotifications(
                user.getId(),
                roleName,
                storeId
        );

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public void markAsRead(Long id, String email) {
        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String roleName = user.getRole() != null ? user.getRole().getName().toUpperCase() : "";
        Long storeId = null;

        if ("MANAGER".equals(roleName) || "STAFF".equals(roleName)) {
            storeId = storeUserRepository.findByUserId(user.getId()).stream()
                    .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                    .map(StoreUserEntity::getStore)
                    .map(store -> store.getId())
                    .findFirst()
                    .orElse(null);
        }

        List<NotificationEntity> entities = notificationRepository.findMyNotifications(
                user.getId(),
                roleName,
                storeId
        );

        entities.forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Override
    public void createNotification(
            String title,
            String content,
            String type,
            String senderName,
            Long recipientUserId,
            String recipientRole,
            Long storeId,
            String link
    ) {
        NotificationEntity notification = new NotificationEntity();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setSenderName(senderName);
        notification.setRecipientUserId(recipientUserId);
        notification.setRecipientRole(recipientRole);
        notification.setStoreId(storeId);
        notification.setLink(link);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(NotificationEntity entity) {
        NotificationResponse response = new NotificationResponse();
        response.setId(entity.getId());
        response.setTitle(entity.getTitle());
        response.setContent(entity.getContent());
        response.setType(entity.getType());
        response.setSenderName(entity.getSenderName());
        response.setRead(entity.isRead());
        response.setLink(entity.getLink());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
