package com.lowlands.coffee.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
class SecurityBoundaryIntegrationTest {

    private static final String PASSWORD = "Security@Test123";

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private FilterChainProxy springSecurityFilterChain;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters((Filter) springSecurityFilterChain)
                .build();
    }

    @Test
    void managerCannotAccessAdminApi() throws Exception {
        String token = login(createUser("MANAGER"));

        MvcResult response = getWithToken("/api/v1/admin/products", token);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        assertThat(response.getResponse().getContentAsString()).contains("\"success\":false");
    }

    @Test
    void staffCannotAccessAdminApi() throws Exception {
        String token = login(createUser("STAFF"));

        MvcResult response = getWithToken("/api/v1/admin/products", token);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        assertThat(response.getResponse().getContentAsString()).contains("\"success\":false");
    }

    @Test
    void staffCannotAccessManagerApi() throws Exception {
        String token = login(createUser("STAFF"));

        MvcResult response = getWithToken("/api/v1/manager/dashboard/summary", token);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        assertThat(response.getResponse().getContentAsString()).contains("\"success\":false");
    }

    @Test
    void managerCanAccessManagerApi() throws Exception {
        String token = login(createUser("MANAGER"));

        MvcResult response = getWithToken("/api/v1/manager/dashboard/summary", token);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getResponse().getContentAsString()).contains("\"success\":true");
    }

    @Test
    void adminCanAccessAdminApi() throws Exception {
        String token = login("admin@lowlands.coffee");

        MvcResult response = getWithToken("/api/v1/admin/products", token);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getResponse().getContentAsString()).contains("\"success\":true");
    }

    @Test
    void publicMenuAllowsAnonymousAccess() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/v1/menu")).andReturn();

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getResponse().getContentAsString()).contains("\"success\":true");
    }

    private String login(String email) throws Exception {
        MvcResult response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", passwordFor(email)
                        ))))
                .andReturn();

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());
        return body.path("data").path("accessToken").asText();
    }

    private String passwordFor(String email) {
        return "admin@lowlands.coffee".equals(email) ? "Admin@123" : PASSWORD;
    }

    private MvcResult getWithToken(String path, String token) throws Exception {
        return mockMvc.perform(get(path).header("Authorization", "Bearer " + token)).andReturn();
    }

    private String createUser(String roleName) {
        Long roleId = jdbcTemplate.queryForObject(
                "select id from roles where name = ?",
                Long.class,
                roleName
        );
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toLowerCase();
        String email = "security." + roleName.toLowerCase() + "." + suffix + "@lowlands.test";
        jdbcTemplate.update("""
                insert into users (full_name, email, phone, password, role_id, status)
                values (?, ?, ?, ?, ?, 'active')
                """,
                "Security " + roleName,
                email,
                "090" + suffix.substring(0, 7),
                passwordEncoder.encode(PASSWORD),
                roleId
        );

        if ("MANAGER".equals(roleName) || "STAFF".equals(roleName)) {
            Long userId = jdbcTemplate.queryForObject(
                    "select id from users where email = ?",
                    Long.class,
                    email
            );
            Long storeId = createStore(roleName, suffix);
            jdbcTemplate.update("""
                    insert into store_users (staff_id, store_id, position, status)
                    values (?, ?, ?, 'active')
                    """,
                    userId,
                    storeId,
                    "MANAGER".equals(roleName) ? "MANAGER" : "CASHIER"
            );
        }

        return email;
    }

    private Long createStore(String roleName, String suffix) {
        String name = "Security " + roleName + " Store " + suffix;
        jdbcTemplate.update("""
                insert into stores (name, address, phone, status)
                values (?, 'Security test address', '0900000000', 'active')
                """, name);
        return jdbcTemplate.queryForObject(
                "select id from stores where name = ?",
                Long.class,
                name
        );
    }
}
