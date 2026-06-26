package com.lowlands.coffee.modules.user.service;

import com.lowlands.coffee.modules.user.dto.request.UserCreateRequest;
import com.lowlands.coffee.modules.user.dto.request.UserUpdateRequest;
import com.lowlands.coffee.modules.user.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> findAll();

    UserResponse findById(Long id);

    UserResponse create(UserCreateRequest request);

    UserResponse update(Long id, UserUpdateRequest request);

    void delete(Long id);
}
