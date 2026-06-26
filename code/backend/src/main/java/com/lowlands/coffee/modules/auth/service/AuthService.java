package com.lowlands.coffee.modules.auth.service;

import com.lowlands.coffee.modules.auth.dto.request.LoginRequest;
import com.lowlands.coffee.modules.auth.dto.request.ProfileUpdateRequest;
import com.lowlands.coffee.modules.auth.dto.request.RefreshTokenRequest;
import com.lowlands.coffee.modules.auth.dto.request.RegisterRequest;
import com.lowlands.coffee.modules.auth.dto.response.AuthResponse;
import com.lowlands.coffee.modules.user.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    UserResponse getProfile(String email);

    UserResponse updateProfile(String email, ProfileUpdateRequest request);
}
