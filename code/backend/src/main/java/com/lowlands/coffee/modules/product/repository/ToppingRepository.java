package com.lowlands.coffee.modules.product.repository;

import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ToppingRepository extends JpaRepository<ToppingEntity, Long> {

    List<ToppingEntity> findAllByOrderByIdAsc();

    List<ToppingEntity> findByStatusOrderByIdAsc(String status);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
