package com.lowlands.coffee.modules.inventory.repository;

import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsReceiptItemRepository extends JpaRepository<GoodsReceiptItemEntity, Long> {
}
