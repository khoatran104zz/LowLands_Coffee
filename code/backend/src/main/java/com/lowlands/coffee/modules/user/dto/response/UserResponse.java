package com.lowlands.coffee.modules.user.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Long roleId;
    private String roleName;
    private String role;
    private List<String> permissions = new ArrayList<>();
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
