package com.lowlands.coffee.modules.auth.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.auth.dto.request.LoginRequest;
import com.lowlands.coffee.modules.auth.dto.request.ProfileUpdateRequest;
import com.lowlands.coffee.modules.auth.dto.request.RefreshTokenRequest;
import com.lowlands.coffee.modules.auth.dto.request.RegisterRequest;
import com.lowlands.coffee.modules.auth.dto.response.AuthResponse;
import com.lowlands.coffee.modules.auth.service.AuthService;
import com.lowlands.coffee.modules.user.dto.response.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request));
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile(Authentication authentication) {
        return ApiResponse.success(authService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ApiResponse.success(authService.updateProfile(authentication.getName(), request));
    }
}
