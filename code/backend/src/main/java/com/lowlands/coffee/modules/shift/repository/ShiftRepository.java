package com.lowlands.coffee.modules.shift.repository;

import com.lowlands.coffee.modules.shift.entity.ShiftEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ShiftRepository extends JpaRepository<ShiftEntity, Long> {

    @EntityGraph(attributePaths = {"store", "user"})
    List<ShiftEntity> findByStoreIdAndShiftDate(Long storeId, LocalDate shiftDate);

    @EntityGraph(attributePaths = {"store", "user"})
    List<ShiftEntity> findByStoreIdAndShiftDateBetween(Long storeId, LocalDate start, LocalDate end);

    boolean existsByStoreIdAndUserIdAndShiftDateAndShiftName(
            Long storeId,
            Long userId,
            LocalDate shiftDate,
            String shiftName
    );
}
