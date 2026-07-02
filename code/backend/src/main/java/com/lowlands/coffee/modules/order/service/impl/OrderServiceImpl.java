package com.lowlands.coffee.modules.order.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ConflictException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.order.dto.request.OrderCancelRequest;
import com.lowlands.coffee.modules.order.dto.request.OrderCreateRequest;
import com.lowlands.coffee.modules.order.dto.request.OrderItemCreateRequest;
import com.lowlands.coffee.modules.order.dto.response.OrderResponse;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.OrderItemEntity;
import com.lowlands.coffee.modules.order.entity.OrderItemToppingEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import com.lowlands.coffee.modules.order.mapper.OrderMapper;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.order.service.OrderService;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import com.lowlands.coffee.modules.product.repository.ProductToppingRepository;
import com.lowlands.coffee.modules.product.repository.ProductVariantRepository;
import com.lowlands.coffee.modules.product.repository.ToppingRepository;
import com.lowlands.coffee.modules.recipe.entity.RecipeEntity;
import com.lowlands.coffee.modules.recipe.entity.RecipeIngredientEntity;
import com.lowlands.coffee.modules.recipe.repository.RecipeRepository;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private static final String ACTIVE = "active";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_CUSTOMER = "CUSTOMER";
    private static final String PENDING = "PENDING";
    private static final String CONFIRMED = "CONFIRMED";
    private static final String PREPARING = "PREPARING";
    private static final String READY = "READY";
    private static final String COMPLETED = "COMPLETED";
    private static final String CANCELLED = "CANCELLED";
    private static final String UNPAID = "UNPAID";
    private static final String PAID = "PAID";
    private static final String OUT = "OUT";
    private static final String ORDER = "ORDER";

    private static final Set<String> ORDER_TYPES = Set.of("DELIVERY", "PICKUP", "DINE_IN", "TAKEAWAY");
    private static final Set<String> PAYMENT_METHODS = Set.of("CASH", "BANKING", "MOMO", "CARD");
    private static final Set<String> ORDER_STATUSES = Set.of(PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED);

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    private final StoreUserRepository storeUserRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductToppingRepository productToppingRepository;
    private final ToppingRepository toppingRepository;
    private final RecipeRepository recipeRepository;
    private final StockMovementRepository stockMovementRepository;
    private final OrderCodeGenerator orderCodeGenerator;
    private final OrderMapper orderMapper;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            StoreRepository storeRepository,
            StoreUserRepository storeUserRepository,
            UserRepository userRepository,
            ProductVariantRepository productVariantRepository,
            ProductToppingRepository productToppingRepository,
            ToppingRepository toppingRepository,
            RecipeRepository recipeRepository,
            StockMovementRepository stockMovementRepository,
            OrderCodeGenerator orderCodeGenerator,
            OrderMapper orderMapper
    ) {
        this.orderRepository = orderRepository;
        this.storeRepository = storeRepository;
        this.storeUserRepository = storeUserRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
        this.productToppingRepository = productToppingRepository;
        this.toppingRepository = toppingRepository;
        this.recipeRepository = recipeRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.orderCodeGenerator = orderCodeGenerator;
        this.orderMapper = orderMapper;
    }

    @Override
    public OrderResponse create(OrderCreateRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        StoreEntity store = getStore(request.getStoreId());
        ensureActive(store.getStatus(), "Store is inactive");
        ensureStoreScope(actor, store.getId());

        OrderEntity order = new OrderEntity();
        order.setStore(store);
        order.setUser(isCustomer(actor) ? actor : null);
        order.setOrderCode(orderCodeGenerator.generate());
        order.setOrderType(normalizeAllowed(request.getOrderType(), ORDER_TYPES, "Unsupported order type"));
        order.setStatus(PENDING);
        order.setReceiverName(clean(request.getReceiverName()));
        order.setReceiverPhone(clean(request.getReceiverPhone()));
        order.setDeliveryAddress(clean(request.getDeliveryAddress()));
        order.setNote(clean(request.getNote()));
        replaceItems(order, request.getItems());
        order.setSubtotal(calculateSubtotal(order));
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(order.getSubtotal());
        order.setPayment(createPayment(order, request.getPaymentMethod()));
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> findAll(
            Long storeId,
            String status,
            String orderType,
            String search,
            int page,
            int size,
            String actorEmail
    ) {
        UserEntity actor = getActor(actorEmail);
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(Math.min(size, 100), 1),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        Set<Long> allowedStoreIds = allowedStoreIds(actor, storeId);
        if (!isAdmin(actor) && allowedStoreIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        String normalizedStatus = hasText(status)
                ? normalizeAllowed(status, ORDER_STATUSES, "Unsupported order status")
                : null;
        String normalizedOrderType = hasText(orderType)
                ? normalizeAllowed(orderType, ORDER_TYPES, "Unsupported order type")
                : null;
        Specification<OrderEntity> specification = filterOrders(
                actor,
                storeId,
                allowedStoreIds,
                normalizedStatus,
                normalizedOrderType,
                clean(search)
        );
        return orderRepository.findAll(specification, pageable).map(orderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findById(Long id, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        OrderEntity order = getOrder(id);
        ensureStoreScope(actor, order.getStore().getId());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findByCode(String orderCode, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        OrderEntity order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        ensureStoreScope(actor, order.getStore().getId());
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse confirm(Long id, String actorEmail) {
        return transition(id, PENDING, CONFIRMED, actorEmail);
    }

    @Override
    public OrderResponse prepare(Long id, String actorEmail) {
        return transition(id, CONFIRMED, PREPARING, actorEmail);
    }

    @Override
    public OrderResponse ready(Long id, String actorEmail) {
        return transition(id, PREPARING, READY, actorEmail);
    }

    @Override
    public OrderResponse cancel(Long id, OrderCancelRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        OrderEntity order = getOrder(id);
        ensureStoreScope(actor, order.getStore().getId());
        if (COMPLETED.equals(order.getStatus()) || CANCELLED.equals(order.getStatus())) {
            throw new BadRequestException("Completed or cancelled order cannot be cancelled");
        }
        order.setStatus(CANCELLED);
        String reason = request == null ? null : clean(request.getReason());
        if (hasText(reason)) {
            order.setNote(appendNote(order.getNote(), "Cancel reason: " + reason));
        }
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse complete(Long id, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        OrderEntity order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        ensureStoreScope(actor, order.getStore().getId());
        if (COMPLETED.equals(order.getStatus())) {
            if (hasOrderStockMovements(order)) {
                return orderMapper.toResponse(order);
            }
            log.error("Completed order {} is missing ORDER OUT stock movements", order.getId());
            throw new ConflictException("Completed order is missing stock movements");
        }
        if (!READY.equals(order.getStatus())) {
            throw new BadRequestException("Only ready orders can be completed");
        }
        if (hasOrderStockMovements(order)) {
            throw new ConflictException("Order stock has already been deducted");
        }

        List<StockMovementEntity> movements = createOrderStockMovements(order, actor);
        order.setStatus(COMPLETED);
        PaymentEntity payment = order.getPayment();
        if (payment != null) {
            payment.setPaymentStatus(PAID);
            if (payment.getPaidAt() == null) {
                payment.setPaidAt(LocalDateTime.now());
            }
        }
        stockMovementRepository.saveAll(movements);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    private OrderResponse transition(Long id, String fromStatus, String toStatus, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        OrderEntity order = getOrder(id);
        ensureStoreScope(actor, order.getStore().getId());
        if (COMPLETED.equals(order.getStatus()) || CANCELLED.equals(order.getStatus())) {
            throw new BadRequestException("Completed or cancelled order cannot be changed");
        }
        if (!fromStatus.equals(order.getStatus())) {
            throw new BadRequestException("Order status must be " + fromStatus + " before changing to " + toStatus);
        }
        order.setStatus(toStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    private Specification<OrderEntity> filterOrders(
            UserEntity actor,
            Long storeId,
            Set<Long> allowedStoreIds,
            String status,
            String orderType,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (storeId != null) {
                if (!isAdmin(actor) && !allowedStoreIds.contains(storeId)) {
                    throw new AccessDeniedException("Store access denied");
                }
                predicates.add(criteriaBuilder.equal(root.get("store").get("id"), storeId));
            } else if (!isAdmin(actor)) {
                predicates.add(root.get("store").get("id").in(allowedStoreIds));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (orderType != null) {
                predicates.add(criteriaBuilder.equal(root.get("orderType"), orderType));
            }
            if (hasText(search)) {
                String keyword = "%" + search.toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("orderCode")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("receiverName")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("receiverPhone")), keyword)
                ));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void replaceItems(OrderEntity order, List<OrderItemCreateRequest> requests) {
        order.getItems().clear();
        for (OrderItemCreateRequest request : requests) {
            ProductVariantEntity variant = productVariantRepository.findWithDetailsById(request.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
            ProductEntity product = variant.getProduct();
            validateSellable(product, variant);

            OrderItemEntity item = new OrderItemEntity();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductVariant(variant);
            item.setProductName(product.getName());
            item.setSize(variant.getSize());
            item.setUnitPrice(variant.getPrice());
            item.setQuantity(request.getQuantity());
            item.setNote(clean(request.getNote()));
            item.setTotalPrice(variant.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            addToppings(item, request.getToppingIds());
            item.setTotalPrice(item.getTotalPrice().add(calculateToppingTotal(item)));
            order.getItems().add(item);
        }
    }

    private void addToppings(OrderItemEntity item, List<Long> toppingIds) {
        if (toppingIds == null || toppingIds.isEmpty()) {
            return;
        }
        if (toppingIds.stream().anyMatch(id -> id == null)) {
            throw new BadRequestException("Topping id is required");
        }
        List<Long> ids = List.copyOf(new LinkedHashSet<>(toppingIds));
        if (ids.size() != toppingIds.size()) {
            throw new BadRequestException("Topping must be unique per order item");
        }
        List<ToppingEntity> toppings = toppingRepository.findAllById(ids);
        if (toppings.size() != ids.size()) {
            throw new ResourceNotFoundException("Topping not found");
        }
        Map<Long, ToppingEntity> toppingsById = toppings.stream()
                .collect(Collectors.toMap(ToppingEntity::getId, topping -> topping));
        for (Long toppingId : ids) {
            ToppingEntity topping = toppingsById.get(toppingId);
            ensureActive(topping.getStatus(), "Topping is inactive");
            if (!productToppingRepository.existsByProduct_IdAndTopping_Id(item.getProduct().getId(), topping.getId())) {
                throw new BadRequestException("Topping is not allowed for this product");
            }
            OrderItemToppingEntity orderTopping = new OrderItemToppingEntity();
            orderTopping.setOrderItem(item);
            orderTopping.setTopping(topping);
            orderTopping.setToppingName(topping.getName());
            orderTopping.setUnitPrice(topping.getPrice());
            orderTopping.setQuantity(1);
            orderTopping.setTotalPrice(topping.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            item.getToppings().add(orderTopping);
        }
    }

    private List<StockMovementEntity> createOrderStockMovements(OrderEntity order, UserEntity actor) {
        Map<Long, IngredientRequirement> requirements = calculateIngredientRequirements(order);
        if (requirements.isEmpty()) {
            throw new ConflictException("Order has no ingredient requirements");
        }
        for (IngredientRequirement requirement : requirements.values()) {
            BigDecimal currentStock = stockMovementRepository.calculateCurrentStock(
                    order.getStore().getId(),
                    requirement.ingredient().getId()
            );
            if (currentStock.compareTo(requirement.quantity()) < 0) {
                throw new ConflictException("Insufficient stock for ingredient " + requirement.ingredient().getName());
            }
        }
        return requirements.values().stream()
                .map(requirement -> createOutMovement(order, actor, requirement))
                .toList();
    }

    private Map<Long, IngredientRequirement> calculateIngredientRequirements(OrderEntity order) {
        Map<Long, IngredientRequirement> requirements = new LinkedHashMap<>();
        for (OrderItemEntity item : order.getItems()) {
            RecipeEntity recipe = recipeRepository.findByProductVariant_IdAndStatus(item.getProductVariant().getId(), ACTIVE)
                    .orElseThrow(() -> new ConflictException("Active recipe is missing for " + item.getProductName() + " " + item.getSize()));
            if (recipe.getIngredients().isEmpty()) {
                throw new ConflictException("Recipe has no ingredients for " + item.getProductName() + " " + item.getSize());
            }
            for (RecipeIngredientEntity recipeIngredient : recipe.getIngredients()) {
                IngredientEntity ingredient = recipeIngredient.getIngredient();
                ensureActive(ingredient.getStatus(), "Ingredient is inactive: " + ingredient.getName());
                if (!sameText(ingredient.getUnit(), recipeIngredient.getUnit())) {
                    throw new ConflictException("Unit conversion is not configured for ingredient " + ingredient.getName());
                }
                BigDecimal requiredQuantity = recipeIngredient.getQuantity()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                IngredientRequirement existing = requirements.get(ingredient.getId());
                if (existing == null) {
                    requirements.put(ingredient.getId(), new IngredientRequirement(
                            ingredient,
                            requiredQuantity,
                            recipeIngredient.getUnit()
                    ));
                    continue;
                }
                if (!sameText(existing.unit(), recipeIngredient.getUnit())) {
                    throw new ConflictException("Recipe units are inconsistent for ingredient " + ingredient.getName());
                }
                requirements.put(ingredient.getId(), new IngredientRequirement(
                        ingredient,
                        existing.quantity().add(requiredQuantity),
                        existing.unit()
                ));
            }
        }
        return requirements;
    }

    private StockMovementEntity createOutMovement(
            OrderEntity order,
            UserEntity actor,
            IngredientRequirement requirement
    ) {
        StockMovementEntity movement = new StockMovementEntity();
        movement.setStore(order.getStore());
        movement.setIngredient(requirement.ingredient());
        movement.setMovementType(OUT);
        movement.setQuantity(requirement.quantity());
        movement.setUnit(requirement.unit());
        movement.setReferenceType(ORDER);
        movement.setReferenceId(order.getId());
        movement.setNote("Order " + order.getOrderCode());
        movement.setCreatedBy(actor);
        return movement;
    }

    private PaymentEntity createPayment(OrderEntity order, String paymentMethod) {
        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setPaymentMethod(normalizeAllowed(paymentMethod, PAYMENT_METHODS, "Unsupported payment method"));
        payment.setPaymentStatus(UNPAID);
        payment.setAmount(order.getTotalAmount());
        return payment;
    }

    private BigDecimal calculateSubtotal(OrderEntity order) {
        return order.getItems().stream()
                .map(OrderItemEntity::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateToppingTotal(OrderItemEntity item) {
        return item.getToppings().stream()
                .map(OrderItemToppingEntity::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validateSellable(ProductEntity product, ProductVariantEntity variant) {
        ensureActive(product.getStatus(), "Product is inactive");
        ensureActive(product.getCategory().getStatus(), "Product category is inactive");
        ensureActive(variant.getStatus(), "Product variant is inactive");
    }

    private boolean hasOrderStockMovements(OrderEntity order) {
        return stockMovementRepository.existsByMovementTypeAndReferenceTypeAndReferenceId(OUT, ORDER, order.getId());
    }

    private OrderEntity getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private StoreEntity getStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));
    }

    private UserEntity getActor(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Set<Long> allowedStoreIds(UserEntity actor, Long requestedStoreId) {
        if (isAdmin(actor)) {
            return requestedStoreId == null ? Set.of() : Set.of(requestedStoreId);
        }
        Set<Long> ids = storeUserRepository.findByUserId(actor.getId()).stream()
                .filter(storeUser -> isActive(storeUser.getStatus()))
                .map(StoreUserEntity::getStore)
                .map(StoreEntity::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (requestedStoreId != null && !ids.contains(requestedStoreId)) {
            throw new AccessDeniedException("Store access denied");
        }
        return ids;
    }

    private void ensureStoreScope(UserEntity actor, Long storeId) {
        if (isAdmin(actor)) {
            return;
        }
        boolean allowed = storeUserRepository.findByUserId(actor.getId()).stream()
                .filter(storeUser -> isActive(storeUser.getStatus()))
                .map(StoreUserEntity::getStore)
                .map(StoreEntity::getId)
                .anyMatch(storeId::equals);
        if (!allowed) {
            throw new AccessDeniedException("Store access denied");
        }
    }

    private boolean isAdmin(UserEntity user) {
        return user.getRole() != null && ROLE_ADMIN.equalsIgnoreCase(user.getRole().getName());
    }

    private boolean isCustomer(UserEntity user) {
        return user.getRole() != null && ROLE_CUSTOMER.equalsIgnoreCase(user.getRole().getName());
    }

    private void ensureActive(String status, String message) {
        if (!isActive(status)) {
            throw new BadRequestException(message);
        }
    }

    private boolean isActive(String status) {
        return ACTIVE.equalsIgnoreCase(status);
    }

    private String normalizeAllowed(String value, Set<String> allowedValues, String message) {
        if (!hasText(value)) {
            throw new BadRequestException(message);
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!allowedValues.contains(normalized)) {
            throw new BadRequestException(message);
        }
        return normalized;
    }

    private boolean sameText(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String appendNote(String oldNote, String extraNote) {
        if (!hasText(oldNote)) {
            return extraNote;
        }
        String combined = oldNote + " | " + extraNote;
        return combined.length() <= 255 ? combined : combined.substring(0, 255);
    }

    private record IngredientRequirement(
            IngredientEntity ingredient,
            BigDecimal quantity,
            String unit
    ) {
    }
}
