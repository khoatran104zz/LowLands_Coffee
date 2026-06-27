package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    List<CategoryEntity> findAllByOrderByIdAsc();

    List<CategoryEntity> findByStatusOrderByIdAsc(String status);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
