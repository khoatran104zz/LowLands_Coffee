package com.lowlands.coffee.modules.user.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.employee.entity.EmployeeEntity;
import com.lowlands.coffee.modules.employee.service.EmployeeService;
import com.lowlands.coffee.modules.role.entity.RoleEntity;
import com.lowlands.coffee.modules.role.repository.RoleRepository;
import com.lowlands.coffee.modules.user.dto.request.UserCreateRequest;
import com.lowlands.coffee.modules.user.dto.request.UserUpdateRequest;
import com.lowlands.coffee.modules.user.dto.response.UserResponse;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.mapper.UserMapper;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import com.lowlands.coffee.modules.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeService employeeService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            EmployeeService employeeService,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.employeeService = employeeService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(userMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    @Override
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        UserEntity user = userMapper.toEntity(request);
        user.setRole(getRole(request.getRoleId()));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        UserEntity saved = userRepository.save(user);
        employeeService.syncEmployeeForUserRole(saved);
        attachEmployee(saved);
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse update(Long id, UserUpdateRequest request) {
        UserEntity user = getUser(id);
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        userMapper.updateEntity(request, user);
        user.setRole(getRole(request.getRoleId()));
        UserEntity saved = userRepository.save(user);
        employeeService.syncEmployeeForUserRole(saved);
        attachEmployee(saved);
        return userMapper.toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        userRepository.delete(getUser(id));
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
}
