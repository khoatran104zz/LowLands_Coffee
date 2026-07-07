package com.lowlands.coffee.modules.dashboard;

import com.lowlands.coffee.modules.dashboard.dto.response.AdminDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardStoreRankingResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardTopProductResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.ManagerDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.service.DashboardService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DashboardRevenueIntegrationTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void adminRevenueCountsOnlyPaidCompletedOrders() {
        StoreFixture store = createStore("admin-rule");
        ProductFixture product = createProduct("admin-rule");

        createOrder(store.storeId(), product, "COMPLETED", "PAID", "100.00", 1);
        createOrder(store.storeId(), product, "COMPLETED", "UNPAID", "200.00", 1);
        createOrder(store.storeId(), product, "CANCELLED", "PAID", "300.00", 1);
        createOrder(store.storeId(), product, "COMPLETED", "REFUNDED", "400.00", 1);
        createOrder(store.storeId(), product, "COMPLETED", "FAILED", "500.00", 1);

        AdminDashboardSummaryResponse summary = dashboardService.getAdminSummary(store.storeId());

        assertThat(summary.getTotalRevenue()).isEqualByComparingTo("100.00");
        assertThat(summary.getTodayRevenue()).isEqualByComparingTo("100.00");
        assertThat(summary.getMonthRevenue()).isEqualByComparingTo("100.00");
        assertThat(summary.getTotalOrders()).isEqualTo(5);
        assertThat(summary.getCompletedOrders()).isEqualTo(4);
        assertThat(summary.getCancelledOrders()).isEqualTo(1);
    }

    @Test
    void managerSeesOnlyAssignedStorePaidCompletedRevenue() {
        StoreFixture assignedStore = createStore("manager-own");
        StoreFixture otherStore = createStore("manager-other");
        ProductFixture product = createProduct("manager-scope");
        String managerEmail = createManagerAssignedToStore(assignedStore.storeId());

        createOrder(assignedStore.storeId(), product, "COMPLETED", "PAID", "120.00", 1);
        createOrder(otherStore.storeId(), product, "COMPLETED", "PAID", "340.00", 1);

        authenticate(managerEmail);
        ManagerDashboardSummaryResponse summary = dashboardService.getManagerSummary(managerEmail);

        assertThat(summary.getStoreId()).isEqualTo(assignedStore.storeId());
        assertThat(summary.getTotalRevenue()).isEqualByComparingTo("120.00");
        assertThat(summary.getTodayRevenue()).isEqualByComparingTo("120.00");
    }

    @Test
    void adminAllStoresAndStoreFilterUsePaidCompletedRevenue() {
        StoreFixture firstStore = createStore("admin-all-a");
        StoreFixture secondStore = createStore("admin-all-b");
        ProductFixture product = createProduct("admin-all");

        createOrder(firstStore.storeId(), product, "COMPLETED", "PAID", "110.00", 1);
        createOrder(secondStore.storeId(), product, "COMPLETED", "PAID", "220.00", 1);
        createOrder(secondStore.storeId(), product, "COMPLETED", "UNPAID", "999.00", 1);

        AdminDashboardSummaryResponse allStores = dashboardService.getAdminSummary(null);
        AdminDashboardSummaryResponse firstStoreOnly = dashboardService.getAdminSummary(firstStore.storeId());

        assertThat(allStores.getTotalRevenue()).isEqualByComparingTo("330.00");
        assertThat(firstStoreOnly.getTotalRevenue()).isEqualByComparingTo("110.00");
    }

    @Test
    void topProductsAndStoreRankingUseOnlyPaidCompletedOrders() {
        StoreFixture firstStore = createStore("ranking-a");
        StoreFixture secondStore = createStore("ranking-b");
        ProductFixture coffee = createProduct("ranking-coffee");
        ProductFixture cake = createProduct("ranking-cake");

        createOrder(firstStore.storeId(), coffee, "COMPLETED", "PAID", "100.00", 1);
        createOrder(firstStore.storeId(), cake, "COMPLETED", "UNPAID", "900.00", 3);
        createOrder(firstStore.storeId(), cake, "CANCELLED", "PAID", "800.00", 2);
        createOrder(secondStore.storeId(), cake, "COMPLETED", "PAID", "200.00", 2);

        AdminDashboardSummaryResponse summary = dashboardService.getAdminSummary(null);

        assertThat(summary.getTopProducts())
                .extracting(DashboardTopProductResponse::getProductId)
                .containsExactly(cake.productId(), coffee.productId());
        assertThat(summary.getTopProducts().get(0).getRevenue()).isEqualByComparingTo("200.00");
        assertThat(summary.getTopProducts().get(1).getRevenue()).isEqualByComparingTo("100.00");

        assertThat(summary.getStoreRanking())
                .extracting(DashboardStoreRankingResponse::getStoreId)
                .containsExactly(secondStore.storeId(), firstStore.storeId());
        assertThat(summary.getStoreRanking().get(0).getRevenue()).isEqualByComparingTo("200.00");
        assertThat(summary.getStoreRanking().get(1).getRevenue()).isEqualByComparingTo("100.00");
    }

    private StoreFixture createStore(String seed) {
        String name = "QA Dashboard Store " + seed + " " + suffix();
        jdbcTemplate.update("""
                insert into stores (name, address, phone, status)
                values (?, 'QA address', '0900000000', 'active')
                """, name);
        Long storeId = jdbcTemplate.queryForObject(
                "select id from stores where name = ?",
                Long.class,
                name
        );
        return new StoreFixture(storeId);
    }

    private ProductFixture createProduct(String seed) {
        String categoryName = "QA Dashboard Category " + seed + " " + suffix();
        jdbcTemplate.update("""
                insert into categories (name, description, status)
                values (?, 'QA dashboard category', 'active')
                """, categoryName);
        Long categoryId = jdbcTemplate.queryForObject(
                "select id from categories where name = ?",
                Long.class,
                categoryName
        );

        String productName = "QA Dashboard Product " + seed + " " + suffix();
        jdbcTemplate.update("""
                insert into products (category_id, name, description, image_url, status)
                values (?, ?, 'QA dashboard product', null, 'active')
                """, categoryId, productName);
        Long productId = jdbcTemplate.queryForObject(
                "select id from products where name = ?",
                Long.class,
                productName
        );
        jdbcTemplate.update("""
                insert into product_variants (product_id, size, price, status)
                values (?, 'M', 10000, 'active')
                """, productId);
        Long variantId = jdbcTemplate.queryForObject(
                "select id from product_variants where product_id = ? and size = 'M'",
                Long.class,
                productId
        );
        return new ProductFixture(productId, variantId);
    }

    private Long createOrder(
            Long storeId,
            ProductFixture product,
            String orderStatus,
            String paymentStatus,
            String total,
            int quantity
    ) {
        String code = "QA-DASH-" + suffix();
        BigDecimal amount = new BigDecimal(total);
        jdbcTemplate.update("""
                insert into orders (
                    store_id, order_code, order_type, status,
                    receiver_name, receiver_phone, delivery_address,
                    subtotal, discount_amount, total_amount, note
                )
                values (?, ?, 'TAKEAWAY', ?, 'QA Customer', '0900000000', 'QA address', ?, 0, ?, 'QA dashboard order')
                """, storeId, code, orderStatus, amount, amount);
        Long orderId = jdbcTemplate.queryForObject(
                "select id from orders where order_code = ?",
                Long.class,
                code
        );
        jdbcTemplate.update("""
                insert into order_items (
                    order_id, product_id, product_variant_id, product_name,
                    size, unit_price, quantity, total_price, note
                )
                values (?, ?, ?, ?, 'M', ?, ?, ?, null)
                """,
                orderId,
                product.productId(),
                product.variantId(),
                "QA Product " + product.productId(),
                amount.divide(BigDecimal.valueOf(quantity)),
                quantity,
                amount
        );
        jdbcTemplate.update("""
                insert into payments (order_id, payment_method, payment_status, amount, paid_at)
                values (?, 'CASH', ?, ?, case when ? = 'PAID' then current_timestamp else null end)
                """, orderId, paymentStatus, amount, paymentStatus);
        return orderId;
    }

    private String createManagerAssignedToStore(Long storeId) {
        Long managerRoleId = jdbcTemplate.queryForObject(
                "select id from roles where name = 'MANAGER'",
                Long.class
        );
        String email = "qa.manager." + suffix().toLowerCase() + "@lowlands.test";
        jdbcTemplate.update("""
                insert into users (full_name, email, phone, password, role_id, status)
                values ('QA Manager', ?, '0900000000', 'secret', ?, 'active')
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

    private String suffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private record StoreFixture(Long storeId) {
    }

    private record ProductFixture(Long productId, Long variantId) {
    }
}
