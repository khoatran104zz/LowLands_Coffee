package com.lowlands.coffee.modules.notification.repository;

import com.lowlands.coffee.modules.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("""
            select n from NotificationEntity n
            where n.recipientUserId = :userId
               or (n.recipientUserId is null and n.recipientRole = :roleName and (:storeId is null or n.storeId is null or n.storeId = :storeId))
               or (n.recipientUserId is null and n.recipientRole is null and n.storeId = :storeId)
               or (n.recipientUserId is null and n.recipientRole is null and n.storeId is null)
            order by n.createdAt desc
            """)
    List<NotificationEntity> findMyNotifications(
            @Param("userId") Long userId,
            @Param("roleName") String roleName,
            @Param("storeId") Long storeId
    );
}
