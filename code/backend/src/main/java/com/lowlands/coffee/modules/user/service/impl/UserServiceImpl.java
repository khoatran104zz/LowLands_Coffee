package com.lowlands.coffee.modules.user.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.employee.entity.EmployeeEntity;
import com.lowlands.coffee.modules.employee.service.EmployeeService;
import com.lowlands.coffee.modules.role.entity.RoleEntity;
import com.lowlands.coffee.modules.role.repository.RoleRepository;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.dto.request.UserCreateRequest;

import com.lowlands.coffee.modules.user.dto.request.UserUpdateRequest;
import com.lowlands.coffee.modules.user.dto.response.UserResponse;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.mapper.UserMapper;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import com.lowlands.coffee.modules.user.service.UserService;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeService employeeService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final StoreUserRepository storeUserRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            EmployeeService employeeService,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            StoreUserRepository storeUserRepository,
            StoreRepository storeRepository,
            OrderRepository orderRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.employeeService = employeeService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.storeUserRepository = storeUserRepository;
        this.storeRepository = storeRepository;
        this.orderRepository = orderRepository;
    }


    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        List<Object[]> statsList = orderRepository.getCustomerOrderStatsByStatus("COMPLETED");
        Map<Long, Object[]> statsMap = new HashMap<>();
        for (Object[] row : statsList) {
            if (row[0] != null) {
                statsMap.put((Long) row[0], row);
            }
        }

        return userRepository.findAll().stream()
                .map(user -> {
                    UserResponse response = userMapper.toResponse(user);
                    populateBranchInfo(user.getId(), response);

                    if (user.getRole() != null && "CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
                        Object[] row = statsMap.get(user.getId());
                        if (row != null) {
                            response.setOrderCount((Long) row[1]);
                            response.setTotalSpent((BigDecimal) row[2]);
                        } else {
                            response.setOrderCount(0L);
                            response.setTotalSpent(BigDecimal.ZERO);
                        }
                    }
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        UserEntity user = getUser(id);
        UserResponse response = userMapper.toResponse(user);
        populateBranchInfo(id, response);
        populateCustomerStats(user, response);
        return response;
    }

    @Override
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        UserEntity user = userMapper.toEntity(request);
        user.setRole(getRole(request.getRoleId()));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        UserEntity savedUser = userRepository.save(user);

        employeeService.syncEmployeeForUserRole(savedUser);
        attachEmployee(savedUser);
        handleBranchAssignment(savedUser, request.getBranchId());

        UserResponse response = userMapper.toResponse(savedUser);
        populateBranchInfo(savedUser.getId(), response);
        populateCustomerStats(savedUser, response);
        return response;
    }

    @Override
    public UserResponse update(Long id, UserUpdateRequest request) {
        UserEntity user = getUser(id);
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        userMapper.updateEntity(request, user);
        user.setRole(getRole(request.getRoleId()));
        UserEntity savedUser = userRepository.save(user);

        employeeService.syncEmployeeForUserRole(savedUser);
        attachEmployee(savedUser);
        handleBranchAssignment(savedUser, request.getBranchId());

        UserResponse response = userMapper.toResponse(savedUser);
        populateBranchInfo(savedUser.getId(), response);
        populateCustomerStats(savedUser, response);
        return response;
    }

    @Override
    public void delete(Long id) {
        userRepository.delete(getUser(id));
    }

    private void populateCustomerStats(UserEntity user, UserResponse response) {
        if (user.getRole() != null && "CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            List<Object[]> statsList = orderRepository.getCustomerOrderStatsByStatus("COMPLETED");
            Object[] stats = statsList.stream()
                    .filter(row -> user.getId().equals(row[0]))
                    .findFirst()
                    .orElse(null);
            if (stats != null) {
                response.setOrderCount((Long) stats[1]);
                response.setTotalSpent((BigDecimal) stats[2]);
            } else {
                response.setOrderCount(0L);
                response.setTotalSpent(BigDecimal.ZERO);
            }
        }
    }

    private UserEntity getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private RoleEntity getRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }

    private void attachEmployee(UserEntity user) {
        EmployeeEntity employee = employeeService.findByUserId(user.getId()).orElse(null);
        user.setEmployee(employee);
    }

    private void populateBranchInfo(Long userId, UserResponse response) {
        storeUserRepository.findByUserId(userId).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .findFirst()
                .ifPresent(su -> {
                    response.setBranchId(su.getStore().getId());
                    response.setBranchName(su.getStore().getName());
                });
    }

    private void handleBranchAssignment(UserEntity user, Long branchId) {
        List<StoreUserEntity> activeAssignments = storeUserRepository.findByUserId(user.getId()).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .toList();

        if (branchId != null && branchId > 0) {
            boolean alreadyAssigned = activeAssignments.stream()
                    .anyMatch(su -> su.getStore().getId().equals(branchId));

            if (!alreadyAssigned) {
                // Deactivate other active assignments
                for (StoreUserEntity assignment : activeAssignments) {
                    assignment.setStatus("inactive");
                    storeUserRepository.save(assignment);
                }

                // Create new assignment
                StoreEntity store = storeRepository.findById(branchId)
                        .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

                StoreUserEntity newAssignment = new StoreUserEntity();
                newAssignment.setUser(user);
                newAssignment.setStore(store);
                newAssignment.setPosition(user.getRole().getName());
                newAssignment.setStatus("active");
                storeUserRepository.save(newAssignment);
            }
        } else {
            // Deactivate all active assignments
            for (StoreUserEntity assignment : activeAssignments) {
                assignment.setStatus("inactive");
                storeUserRepository.save(assignment);
            }
        }
    }
}

