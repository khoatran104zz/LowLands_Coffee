package com.lowlands.coffee.modules.employee.service;

import com.lowlands.coffee.modules.employee.entity.EmployeeEntity;
import com.lowlands.coffee.modules.user.entity.UserEntity;

import java.util.Optional;

public interface EmployeeService {

    Optional<EmployeeEntity> findByUserId(Long userId);

    EmployeeEntity ensureEmployeeForUser(UserEntity user);

    void syncEmployeeForUserRole(UserEntity user);
}
