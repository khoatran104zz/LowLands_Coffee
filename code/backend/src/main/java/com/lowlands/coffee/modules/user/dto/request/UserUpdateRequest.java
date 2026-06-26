package com.lowlands.coffee.modules.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Email
    @NotBlank
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotNull
    private Long roleId;

    @NotBlank
    @Size(max = 20)
    private String status;
}
