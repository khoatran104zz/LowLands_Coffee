package com.lowlands.coffee.modules.employee.repository;

import com.lowlands.coffee.modules.employee.entity.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long> {

    Optional<EmployeeEntity> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query(
            value = """
                    SELECT COALESCE(MAX(CAST(SUBSTRING(employee_code, 4) AS INTEGER)), 0)
                    FROM employees
                    WHERE employee_code LIKE 'EMP%'
                    """,
            nativeQuery = true
    )
    int findMaxEmployeeCodeNumber();
}
