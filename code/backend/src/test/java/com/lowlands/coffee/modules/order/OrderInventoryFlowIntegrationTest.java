package com.lowlands.coffee.modules.order;

import com.lowlands.coffee.modules.order.dto.request.OrderCreateRequest;
import com.lowlands.coffee.modules.order.dto.request.OrderItemCreateRequest;
import com.lowlands.coffee.modules.order.dto.response.OrderResponse;
import com.lowlands.coffee.modules.order.exception.OrderCompletionException;
import com.lowlands.coffee.modules.order.service.OrderService;
import com.lowlands.coffee.modules.payment.dto.request.PaymentPayRequest;
import com.lowlands.coffee.modules.payment.dto.response.PaymentDetailResponse;
import com.lowlands.coffee.modules.payment.service.PaymentService;
import com.lowlands.coffee.modules.product.dto.response.ProductAvailabilityResponse;
import com.lowlands.coffee.modules.product.service.ProductAvailabilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class OrderInventoryFlowIntegrationTest {

    private static final String ADMIN_EMAIL = "admin@lowlands.coffee";
    private static final long STORE_ID = 1L;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ProductAvailabilityService productAvailabilityService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createPayCompleteCreatesOrderStockMovements() {
        RecipeFixture fixture = createRecipeFixture("happy", List.of(
                new IngredientSpec("Coffee QA", "g", new BigDecimal("10.00"), new BigDecimal("100.00"), true),
                new IngredientSpec("Milk QA", "ml", new BigDecimal("30.00"), new BigDecimal("300.00"), true)
        ));

        OrderResponse created = createReadyPaidOrder(fixture.variantId(), 2);
        OrderResponse completed = orderService.complete(created.getId(), ADMIN_EMAIL);

        assertThat(completed.getStatus()).isEqualTo("COMPLETED");
        assertThat(completed.getPayment().getPaymentStatus()).isEqualTo("PAID");
        assertThat(countOutMovements(created.getId())).isEqualTo(2);

        List<OutMovementRow> outRows = outMovementRows(created.getId());
        assertThat(outRows)
                .extracting(OutMovementRow::referenceType)
                .containsOnly("ORDER");
        assertThat(outRows)
                .extracting(OutMovementRow::referenceId)
                .containsOnly(created.getId());
        assertThat(outQuantity(created.getId(), fixture.ingredients().get(0).ingredientId()))
                .isEqualByComparingTo("20.00");
        assertThat(outQuantity(created.getId(), fixture.ingredients().get(1).ingredientId()))
                .isEqualByComparingTo("60.00");
    }

    @Test
    void inventoryDecreasesByRecipeQuantityTimesOrderQuantity() {
        RecipeFixture fixture = createRecipeFixture("inventory", List.of(
                new IngredientSpec("Powder QA", "g", new BigDecimal("7.50"), new BigDecimal("100.00"), true)
        ));
        Long ingredientId = fixture.ingredients().get(0).ingredientId();
        BigDecimal before = currentStock(ingredientId);

        OrderResponse order = createReadyPaidOrder(fixture.variantId(), 2);
        orderService.complete(order.getId(), ADMIN_EMAIL);

        BigDecimal after = currentStock(ingredientId);
        assertThat(before.subtract(after)).isEqualByComparingTo("15.00");
    }

    @Test
    void completingOrderTwiceDoesNotDeductStockTwice() {
        RecipeFixture fixture = createRecipeFixture("idempotent", List.of(
                new IngredientSpec("Idempotent QA", "g", new BigDecimal("5.00"), new BigDecimal("100.00"), true)
        ));
        Long ingredientId = fixture.ingredients().get(0).ingredientId();
        OrderResponse order = createReadyPaidOrder(fixture.variantId(), 1);

        orderService.complete(order.getId(), ADMIN_EMAIL);
        int outCountAfterFirstComplete = countOutMovements(order.getId());
        BigDecimal stockAfterFirstComplete = currentStock(ingredientId);

        OrderResponse secondComplete = orderService.complete(order.getId(), ADMIN_EMAIL);

        assertThat(secondComplete.getStatus()).isEqualTo("COMPLETED");
        assertThat(countOutMovements(order.getId())).isEqualTo(outCountAfterFirstComplete);
        assertThat(currentStock(ingredientId)).isEqualByComparingTo(stockAfterFirstComplete);
    }

    @Test
    void insufficientStockBlocksCompleteAndCreatesNoOutMovement() {
        RecipeFixture fixture = createRecipeFixture("shortage", List.of(
                new IngredientSpec("Shortage QA", "g", new BigDecimal("10.00"), new BigDecimal("3.00"), true)
        ));
        OrderResponse order = createReadyPaidOrder(fixture.variantId(), 1);

        assertThatThrownBy(() -> orderService.complete(order.getId(), ADMIN_EMAIL))
                .isInstanceOfSatisfying(OrderCompletionException.class, exception -> {
                    OrderCompletionException completionException = (OrderCompletionException) exception;
                    assertThat(completionException.getDetails().getReason()).isEqualTo("INSUFFICIENT_STOCK");
                    assertThat(completionException.getDetails().getShortages()).hasSize(1);
                    assertThat(completionException.getDetails().getShortages().get(0).getIngredientName())
                            .contains("Shortage QA");
                    assertThat(completionException.getDetails().getShortages().get(0).getRequiredQuantity())
                            .isEqualByComparingTo("10.00");
                    assertThat(completionException.getDetails().getShortages().get(0).getAvailableQuantity())
                            .isEqualByComparingTo("3.00");
                });

        assertThat(orderStatus(order.getId())).isEqualTo("READY");
        assertThat(countOutMovements(order.getId())).isZero();
    }

    @Test
    void missingRecipeBlocksComplete() {
        VariantFixture fixture = createVariantFixture("missing-recipe");
        OrderResponse order = createReadyPaidOrder(fixture.variantId(), 1);

        assertThatThrownBy(() -> orderService.complete(order.getId(), ADMIN_EMAIL))
                .isInstanceOfSatisfying(OrderCompletionException.class, exception -> {
                    OrderCompletionException completionException = (OrderCompletionException) exception;
                    assertThat(completionException.getDetails().getReason()).isEqualTo("MISSING_RECIPE");
                    assertThat(completionException.getDetails().getProductName()).isEqualTo(fixture.productName());
                    assertThat(completionException.getDetails().getVariantId()).isEqualTo(fixture.variantId());
                });
    }

    @Test
    void emptyRecipeBlocksComplete() {
        VariantFixture fixture = createVariantFixture("empty-recipe");
        createRecipe(fixture.variantId(), "REC_EMPTY_" + suffix(), true);
        OrderResponse order = createReadyPaidOrder(fixture.variantId(), 1);

        assertThatThrownBy(() -> orderService.complete(order.getId(), ADMIN_EMAIL))
                .isInstanceOfSatisfying(OrderCompletionException.class, exception -> {
                    OrderCompletionException completionException = (OrderCompletionException) exception;
                    assertThat(completionException.getDetails().getReason()).isEqualTo("EMPTY_RECIPE");
                    assertThat(completionException.getDetails().getProductName()).isEqualTo(fixture.productName());
                    assertThat(completionException.getDetails().getVariantId()).isEqualTo(fixture.variantId());
                });
    }

    @Test
    void availabilityReportsAllBusinessStatesAndStockDepletion() {
        RecipeFixture available = createRecipeFixture("available", List.of(
                new IngredientSpec("Available QA", "g", new BigDecimal("4.00"), new BigDecimal("20.00"), true)
        ));
        VariantFixture missingRecipe = createVariantFixture("availability-missing");
        VariantFixture emptyRecipe = createVariantFixture("availability-empty");
        createRecipe(emptyRecipe.variantId(), "REC_EMPTY_AV_" + suffix(), true);
        RecipeFixture inactiveIngredient = createRecipeFixture("inactive-ingredient", List.of(
                new IngredientSpec("Inactive QA", "g", new BigDecimal("4.00"), new BigDecimal("20.00"), false)
        ));
        RecipeFixture insufficientStock = createRecipeFixture("availability-shortage", List.of(
                new IngredientSpec("Availability Shortage QA", "g", new BigDecimal("4.00"), new BigDecimal("1.00"), true)
        ));
        RecipeFixture depleting = createRecipeFixture("depleting", List.of(
                new IngredientSpec("Depleting QA", "g", new BigDecimal("4.00"), new BigDecimal("4.00"), true)
        ));

        assertAvailability(available.variantId(), true, null);
        assertAvailability(missingRecipe.variantId(), false, "MISSING_RECIPE");
        assertAvailability(emptyRecipe.variantId(), false, "EMPTY_RECIPE");
        assertAvailability(inactiveIngredient.variantId(), false, "INGREDIENT_INACTIVE");
        assertAvailability(insufficientStock.variantId(), false, "INSUFFICIENT_STOCK");
        assertAvailability(depleting.variantId(), true, null);

        OrderResponse order = createReadyPaidOrder(depleting.variantId(), 1);
        orderService.complete(order.getId(), ADMIN_EMAIL);

        assertAvailability(depleting.variantId(), false, "INSUFFICIENT_STOCK");
    }

    private OrderResponse createReadyPaidOrder(Long variantId, int quantity) {
        OrderResponse created = orderService.create(orderRequest(variantId, quantity), ADMIN_EMAIL);

        PaymentPayRequest payRequest = new PaymentPayRequest();
        payRequest.setMethod("CASH");
        PaymentDetailResponse payment = paymentService.payOrder(created.getId(), payRequest, ADMIN_EMAIL);
        assertThat(payment.getPaymentStatus()).isEqualTo("PAID");

        orderService.confirm(created.getId(), ADMIN_EMAIL);
        orderService.prepare(created.getId(), ADMIN_EMAIL);
        return orderService.ready(created.getId(), ADMIN_EMAIL);
    }

    private OrderCreateRequest orderRequest(Long variantId, int quantity) {
        OrderItemCreateRequest item = new OrderItemCreateRequest();
        item.setProductVariantId(variantId);
        item.setQuantity(quantity);
        item.setToppingIds(List.of());

        OrderCreateRequest request = new OrderCreateRequest();
        request.setStoreId(STORE_ID);
        request.setOrderType("TAKEAWAY");
        request.setPaymentMethod("CASH");
        request.setReceiverName("QA Staff");
        request.setReceiverPhone("0900000000");
        request.setDeliveryAddress("");
        request.setItems(List.of(item));
        return request;
    }

    private RecipeFixture createRecipeFixture(String nameSeed, List<IngredientSpec> specs) {
        VariantFixture variant = createVariantFixture(nameSeed);
        Long recipeId = createRecipe(variant.variantId(), "REC_QA_" + suffix(), true);
        List<IngredientFixture> ingredients = specs.stream()
                .map(spec -> {
                    Long ingredientId = createIngredient(spec.name(), spec.unit(), spec.active());
                    addRecipeIngredient(recipeId, ingredientId, spec.quantity(), spec.unit());
                    addStock(ingredientId, spec.stock(), spec.unit());
                    return new IngredientFixture(ingredientId, spec.quantity(), spec.unit());
                })
                .toList();
        return new RecipeFixture(variant.productId(), variant.variantId(), recipeId, ingredients);
    }

    private VariantFixture createVariantFixture(String nameSeed) {
        Long categoryId = jdbcTemplate.queryForObject(
                "select min(id) from categories where status = 'active'",
                Long.class
        );
        String productName = "QA " + nameSeed + " " + suffix();
        jdbcTemplate.update("""
                insert into products (category_id, name, description, image_url, status)
                values (?, ?, 'QA flow fixture', null, 'active')
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
        return new VariantFixture(productId, variantId, productName);
    }

    private Long createRecipe(Long variantId, String code, boolean active) {
        jdbcTemplate.update("""
                insert into recipes (product_variant_id, code, name, description, status)
                values (?, ?, ?, 'QA recipe fixture', ?)
                """, variantId, code, code, active ? "active" : "inactive");
        return jdbcTemplate.queryForObject("select id from recipes where code = ?", Long.class, code);
    }

    private Long createIngredient(String name, String unit, boolean active) {
        Long categoryId = jdbcTemplate.queryForObject(
                "select min(id) from ingredient_categories where status = 'active'",
                Long.class
        );
        String code = "QA_" + suffix();
        jdbcTemplate.update("""
                insert into ingredients (category_id, code, name, unit, min_stock, description, status)
                values (?, ?, ?, ?, 0, 'QA ingredient fixture', ?)
                """, categoryId, code, name + " " + code, unit, active ? "active" : "inactive");
        return jdbcTemplate.queryForObject("select id from ingredients where code = ?", Long.class, code);
    }

    private void addRecipeIngredient(Long recipeId, Long ingredientId, BigDecimal quantity, String unit) {
        jdbcTemplate.update("""
                insert into recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
                values (?, ?, ?, ?)
                """, recipeId, ingredientId, quantity, unit);
    }

    private void addStock(Long ingredientId, BigDecimal quantity, String unit) {
        Long adminId = jdbcTemplate.queryForObject(
                "select id from users where email = ?",
                Long.class,
                ADMIN_EMAIL
        );
        jdbcTemplate.update("""
                insert into stock_movements (
                    store_id, ingredient_id, movement_type, quantity, unit,
                    reference_type, reference_id, note, created_by
                )
                values (?, ?, 'IN', ?, ?, 'MANUAL_ADJUSTMENT', null, 'QA opening stock', ?)
                """, STORE_ID, ingredientId, quantity, unit, adminId);
    }

    private void assertAvailability(Long variantId, boolean available, String reason) {
        ProductAvailabilityResponse response = productAvailabilityService.findAvailability(STORE_ID, ADMIN_EMAIL).stream()
                .filter(item -> item.getVariantId().equals(variantId))
                .findFirst()
                .orElseThrow();
        assertThat(response.isAvailable()).isEqualTo(available);
        assertThat(response.getReason()).isEqualTo(reason);
    }

    private BigDecimal currentStock(Long ingredientId) {
        return jdbcTemplate.queryForObject("""
                select coalesce(sum(
                    case
                        when movement_type = 'IN' then quantity
                        when movement_type = 'OUT' then -quantity
                        else quantity
                    end
                ), 0)
                from stock_movements
                where store_id = ? and ingredient_id = ?
                """, BigDecimal.class, STORE_ID, ingredientId);
    }

    private int countOutMovements(Long orderId) {
        return jdbcTemplate.queryForObject("""
                select count(*)
                from stock_movements
                where movement_type = 'OUT'
                  and reference_type = 'ORDER'
                  and reference_id = ?
                """, Integer.class, orderId);
    }

    private List<OutMovementRow> outMovementRows(Long orderId) {
        return jdbcTemplate.query("""
                select reference_type, reference_id
                from stock_movements
                where movement_type = 'OUT'
                  and reference_type = 'ORDER'
                  and reference_id = ?
                """,
                (rs, rowNum) -> new OutMovementRow(rs.getString("reference_type"), rs.getLong("reference_id")),
                orderId
        );
    }

    private BigDecimal outQuantity(Long orderId, Long ingredientId) {
        return jdbcTemplate.queryForObject("""
                select coalesce(sum(quantity), 0)
                from stock_movements
                where movement_type = 'OUT'
                  and reference_type = 'ORDER'
                  and reference_id = ?
                  and ingredient_id = ?
                """, BigDecimal.class, orderId, ingredientId);
    }

    private String orderStatus(Long orderId) {
        return jdbcTemplate.queryForObject("select status from orders where id = ?", String.class, orderId);
    }

    private String suffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private record IngredientSpec(String name, String unit, BigDecimal quantity, BigDecimal stock, boolean active) {
    }

    private record VariantFixture(Long productId, Long variantId, String productName) {
    }

    private record IngredientFixture(Long ingredientId, BigDecimal recipeQuantity, String unit) {
    }

    private record RecipeFixture(Long productId, Long variantId, Long recipeId, List<IngredientFixture> ingredients) {
    }

    private record OutMovementRow(String referenceType, Long referenceId) {
    }
}
