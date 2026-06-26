package com.lowlands.coffee.modules.role.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class RoleResponse {

    private Long id;
    private String name;
    private Set<String> permissions;
}
