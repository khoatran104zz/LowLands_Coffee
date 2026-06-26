package com.lowlands.coffee.modules.auth.dto.response;

import com.lowlands.coffee.modules.user.dto.response.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final UserResponse user;
}
