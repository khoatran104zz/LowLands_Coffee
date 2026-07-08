package com.lowlands.coffee.modules.report;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.WorkbookFactory;
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

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
class ReportExcelExportIntegrationTest {

    private static final String PASSWORD = "Report@Test123";

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
                .addFilters(springSecurityFilterChain)
                .build();
    }

    @Test
    void adminCanExportAllReportTypesAsXlsx() throws Exception {
        String token = login("admin@lowlands.coffee", "Admin@123");
        String[] reportTypes = {"revenue", "orders", "payment", "inventory", "goods-receipt", "consumption"};

        for (String reportType : reportTypes) {
            MvcResult result = mockMvc.perform(get("/api/v1/admin/reports/export/excel")
                            .header("Authorization", "Bearer " + token)
                            .param("reportType", reportType))
                    .andReturn();

            assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
            assertThat(result.getResponse().getContentType())
                    .isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            assertThat(result.getResponse().getHeader("Content-Disposition")).contains(".xlsx");
            assertWorkbookHasSheet(result.getResponse().getContentAsByteArray());
        }
    }

    @Test
    void managerRevenueExportUsesAssignedStoreScope() throws Exception {
        Long assignedStoreId = createStore("manager-export-own");
        Long otherStoreId = createStore("manager-export-other");
        String managerEmail = createManagerAssignedToStore(assignedStoreId);

        createOrder(assignedStoreId, "COMPLETED", "PAID", "125.00");
        createOrder(otherStoreId, "COMPLETED", "PAID", "999.00");

        String token = login(managerEmail, PASSWORD);
        MvcResult result = mockMvc.perform(get("/api/v1/manager/reports/export/excel")
                        .header("Authorization", "Bearer " + token)
                        .param("reportType", "revenue")
                        .param("storeId", String.valueOf(otherStoreId)))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertWorkbookContains(result.getResponse().getContentAsByteArray(), "125");
        assertWorkbookDoesNotContain(result.getResponse().getContentAsByteArray(), "999");
    }

    private void assertWorkbookHasSheet(byte[] bytes) throws Exception {
        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertThat(workbook.getNumberOfSheets()).isGreaterThanOrEqualTo(1);
            assertThat(workbook.getSheetAt(0).getPhysicalNumberOfRows()).isGreaterThan(0);
        }
    }

    private void assertWorkbookContains(byte[] bytes, String expected) throws Exception {
        assertThat(workbookText(bytes)).contains(expected);
    }

    private void assertWorkbookDoesNotContain(byte[] bytes, String unexpected) throws Exception {
        assertThat(workbookText(bytes)).doesNotContain(unexpected);
    }

    private String workbookText(byte[] bytes) throws Exception {
        StringBuilder text = new StringBuilder();
        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            for (Row row : workbook.getSheetAt(0)) {
                for (Cell cell : row) {
                    text.append(cell).append(' ');
                }
            }
        }
        return text.toString();
    }

    private String login(String email, String password) throws Exception {
        MvcResult response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", password
                        ))))
                .andReturn();

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());
        return body.path("data").path("accessToken").asText();
    }

    private Long createStore(String seed) {
        String name = "QA Excel Store " + seed + " " + suffix();
        jdbcTemplate.update("""
                insert into stores (name, address, phone, status)
                values (?, 'QA excel address', '0900000000', 'active')
                """, name);
        return jdbcTemplate.queryForObject(
                "select id from stores where name = ?",
                Long.class,
                name
        );
    }

    private String createManagerAssignedToStore(Long storeId) {
        Long managerRoleId = jdbcTemplate.queryForObject(
                "select id from roles where name = 'MANAGER'",
                Long.class
        );
        String email = "qa.excel.manager." + suffix().toLowerCase() + "@lowlands.test";
        jdbcTemplate.update("""
                insert into users (full_name, email, phone, password, role_id, status)
                values ('QA Excel Manager', ?, '0900000000', ?, ?, 'active')
                """, email, passwordEncoder.encode(PASSWORD), managerRoleId);
        Long userId = jdbcTemplate.queryForObject(
                "select id from users where email = ?",
                Long.class,
                email
        );
        jdbcTemplate.update("""
                insert into store_users (staff_id, store_id, position, status)
                values (?, ?, 'MANAGER', 'active')
                """, userId, storeId);
        return email;
    }

    private void createOrder(Long storeId, String orderStatus, String paymentStatus, String total) {
        String code = "QA-EXCEL-" + suffix();
        BigDecimal amount = new BigDecimal(total);
        jdbcTemplate.update("""
                insert into orders (
                    store_id, order_code, order_type, status,
                    receiver_name, receiver_phone, delivery_address,
                    subtotal, discount_amount, total_amount, note
                )
                values (?, ?, 'TAKEAWAY', ?, 'QA Excel Customer', '0900000000', 'QA address', ?, 0, ?, 'QA excel order')
                """, storeId, code, orderStatus, amount, amount);
        Long orderId = jdbcTemplate.queryForObject(
                "select id from orders where order_code = ?",
                Long.class,
                code
        );
        jdbcTemplate.update("""
                insert into payments (order_id, payment_method, payment_status, amount, paid_at)
                values (?, 'CASH', ?, ?, case when ? = 'PAID' then current_timestamp else null end)
                """, orderId, paymentStatus, amount, paymentStatus);
    }

    private String suffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
