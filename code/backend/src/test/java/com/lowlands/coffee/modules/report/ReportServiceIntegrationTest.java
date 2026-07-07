package com.lowlands.coffee.modules.report;

import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;
import com.lowlands.coffee.modules.report.service.ReportService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ReportServiceIntegrationTest {

    @Autowired
    private ReportService reportService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void adminRevenueCountsOnlyCompletedPaidOrders() {
        StoreFixture store = createStore("admin-revenue");

        createOrder(store.storeId(), "COMPLETED", "PAID", "100.00");
        createOrder(store.storeId(), "COMPLETED", "UNPAID", "200.00");
        createOrder(store.storeId(), "CANCELLED", "PAID", "300.00");
        createOrder(store.storeId(), "COMPLETED", "FAILED", "400.00");

        RevenueReportResponse report = reportService.getAdminRevenueReport(LocalDate.now(), LocalDate.now(), store.storeId());

        assertMetricAmount(report, "revenue", "100.00");
        assertMetricCount(report, "orders", 4L);
        assertMetricCount(report, "completed", 3L);
        assertMetricCount(report, "cancelled", 1L);
        assertThat(report.rows()).hasSize(1);
        assertThat(report.rows().get(0).revenue()).isEqualByComparingTo("100.00");
        assertThat(report.chart()).hasSize(1);
        assertThat(report.chart().get(0).value()).isEqualByComparingTo("100.00");
    }

    @Test
    void adminStoreFilterDoesNotMixRevenueAcrossStores() {
        StoreFixture firstStore = createStore("admin-filter-a");
        StoreFixture secondStore = createStore("admin-filter-b");

        createOrder(firstStore.storeId(), "COMPLETED", "PAID", "120.00");
        createOrder(secondStore.storeId(), "COMPLETED", "PAID", "340.00");

        RevenueReportResponse firstStoreReport = reportService.getAdminRevenueReport(LocalDate.now(), LocalDate.now(), firstStore.storeId());

        assertMetricAmount(firstStoreReport, "revenue", "120.00");
        assertThat(firstStoreReport.rows())
                .extracting(row -> row.storeId())
                .containsOnly(firstStore.storeId());
    }

    @Test
    void managerRevenueIsScopedToAssignedStore() {
        StoreFixture assignedStore = createStore("manager-report-own");
        StoreFixture otherStore = createStore("manager-report-other");
        String managerEmail = createManagerAssignedToStore(assignedStore.storeId());

        createOrder(assignedStore.storeId(), "COMPLETED", "PAID", "150.00");
        createOrder(otherStore.storeId(), "COMPLETED", "PAID", "450.00");

        authenticate(managerEmail);
        RevenueReportResponse report = reportService.getManagerRevenueReport(LocalDate.now(), LocalDate.now());

        assertMetricAmount(report, "revenue", "150.00");
        assertThat(report.rows())
                .extracting(row -> row.storeId())
                .containsOnly(assignedStore.storeId());
    }

    private StoreFixture createStore(String seed) {
        String name = "QA Report Store " + seed + " " + suffix();
        jdbcTemplate.update("""
                insert into stores (name, address, phone, status)
                values (?, 'QA report address', '0900000000', 'active')
                """, name);
        Long storeId = jdbcTemplate.queryForObject(
                "select id from stores where name = ?",
                Long.class,
                name
        );
        return new StoreFixture(storeId);
    }

    private void createOrder(Long storeId, String orderStatus, String paymentStatus, String total) {
        String code = "QA-REPORT-" + suffix();
        BigDecimal amount = new BigDecimal(total);
        jdbcTemplate.update("""
                insert into orders (
                    store_id, order_code, order_type, status,
                    receiver_name, receiver_phone, delivery_address,
                    subtotal, discount_amount, total_amount, note
                )
                values (?, ?, 'TAKEAWAY', ?, 'QA Report Customer', '0900000000', 'QA address', ?, 0, ?, 'QA report order')
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

    private String createManagerAssignedToStore(Long storeId) {
        Long managerRoleId = jdbcTemplate.queryForObject(
                "select id from roles where name = 'MANAGER'",
                Long.class
        );
        String email = "qa.report.manager." + suffix().toLowerCase() + "@lowlands.test";
        jdbcTemplate.update("""
                insert into users (full_name, email, phone, password, role_id, status)
                values ('QA Report Manager', ?, '0900000000', 'secret', ?, 'active')
                """, email, managerRoleId);
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

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, "n/a")
        );
    }

    private void assertMetricAmount(RevenueReportResponse report, String key, String expected) {
        assertThat(report.summary())
                .filteredOn(metric -> metric.key().equals(key))
                .singleElement()
                .satisfies(metric -> assertThat(metric.amount()).isEqualByComparingTo(expected));
    }

    private void assertMetricCount(RevenueReportResponse report, String key, Long expected) {
        assertThat(report.summary())
                .filteredOn(metric -> metric.key().equals(key))
                .singleElement()
                .satisfies(metric -> assertThat(metric.count()).isEqualTo(expected));
    }

    private String suffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private record StoreFixture(Long storeId) {
    }
}
