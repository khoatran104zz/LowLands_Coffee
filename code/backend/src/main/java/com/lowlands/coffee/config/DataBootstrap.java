package com.lowlands.coffee.config;

import com.lowlands.coffee.modules.role.entity.RoleEntity;
import com.lowlands.coffee.modules.role.repository.RoleRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableConfigurationProperties(BootstrapProperties.class)
public class DataBootstrap {

    @Bean
    public ApplicationRunner bootstrapAdmin(
            BootstrapProperties bootstrapProperties,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.existsByEmail(bootstrapProperties.adminEmail())) {
                return;
            }
            RoleEntity adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new IllegalStateException("ADMIN role is missing"));
            UserEntity admin = new UserEntity();
            admin.setFullName(bootstrapProperties.adminFullName());
            admin.setEmail(bootstrapProperties.adminEmail());
            admin.setPassword(passwordEncoder.encode(bootstrapProperties.adminPassword()));
            admin.setRole(adminRole);
            admin.setStatus("ACTIVE");
            userRepository.save(admin);
        };
    }
}
