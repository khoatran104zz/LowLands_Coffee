package com.lowlands.coffee.modules.employee.service.impl;

import com.lowlands.coffee.modules.employee.entity.EmployeeEntity;
import com.lowlands.coffee.modules.employee.repository.EmployeeRepository;
import com.lowlands.coffee.modules.employee.service.EmployeeService;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";
    private static final String USER_ACTIVE = "ACTIVE";
    private static final String ROLE_MANAGER = "MANAGER";
    private static final String ROLE_STAFF = "STAFF";
    private static final String EMPLOYEE_CODE_PREFIX = "EMP";

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeEntity> findByUserId(Long userId) {
        return employeeRepository.findByUserId(userId);
    }

    @Override
    public EmployeeEntity ensureEmployeeForUser(UserEntity user) {
        return employeeRepository.findByUserId(user.getId())
                .map(employee -> {
                    employee.setStatus(employeeStatusFor(user));
                    return employeeRepository.save(employee);
                })
                .orElseGet(() -> {
                    EmployeeEntity employee = new EmployeeEntity();
                    employee.setUser(user);
                    employee.setEmployeeCode(nextEmployeeCode());
                    employee.setStatus(employeeStatusFor(user));
                    return employeeRepository.save(employee);
                });
    }

    @Override
    public void syncEmployeeForUserRole(UserEntity user) {
        if (isEmployeeRole(user)) {
            ensureEmployeeForUser(user);
            return;
        }

        employeeRepository.findByUserId(user.getId()).ifPresent(employee -> {
            employee.setStatus(INACTIVE);
            employeeRepository.save(employee);
        });
    }

    private boolean isEmployeeRole(UserEntity user) {
        if (user.getRole() == null || user.getRole().getName() == null) {
            return false;
        }
        String roleName = user.getRole().getName();
        return ROLE_MANAGER.equals(roleName) || ROLE_STAFF.equals(roleName);
    }

    private String employeeStatusFor(UserEntity user) {
        return USER_ACTIVE.equalsIgnoreCase(user.getStatus()) ? ACTIVE : INACTIVE;
    }

    private String nextEmployeeCode() {
        int nextNumber = employeeRepository.findMaxEmployeeCodeNumber() + 1;
        return EMPLOYEE_CODE_PREFIX + String.format("%04d", nextNumber);
    }
}
