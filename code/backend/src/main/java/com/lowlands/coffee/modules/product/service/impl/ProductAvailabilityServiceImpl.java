package com.lowlands.coffee.modules.product.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.order.dto.response.StockShortageResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductAvailabilityResponse;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.product.service.ProductAvailabilityService;
import com.lowlands.coffee.modules.recipe.entity.RecipeEntity;
import com.lowlands.coffee.modules.recipe.entity.RecipeIngredientEntity;
import com.lowlands.coffee.modules.recipe.repository.RecipeRepository;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ProductAvailabilityServiceImpl implements ProductAvailabilityService {

    private static final String ACTIVE = "active";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String MISSING_RECIPE = "MISSING_RECIPE";
    private static final String EMPTY_RECIPE = "EMPTY_RECIPE";
    private static final String INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK";
    private static final String INGREDIENT_INACTIVE = "INGREDIENT_INACTIVE";
    private static final String UNIT_MISMATCH = "UNIT_MISMATCH";

    private final ProductRepository productRepository;
    private final RecipeRepository recipeRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;
    private final StoreUserRepository storeUserRepository;

    public ProductAvailabilityServiceImpl(
            ProductRepository productRepository,
            RecipeRepository recipeRepository,
            StockMovementRepository stockMovementRepository,
            UserRepository userRepository,
            StoreUserRepository storeUserRepository
    ) {
        this.productRepository = productRepository;
        this.recipeRepository = recipeRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.userRepository = userRepository;
        this.storeUserRepository = storeUserRepository;
    }

    @Override
    public List<ProductAvailabilityResponse> findAvailability(Long storeId, String actorEmail) {
        UserEntity actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Long scopedStoreId = resolveStoreId(storeId, actor);
        return productRepository.findAllWithDetails().stream()
                .filter(product -> isActive(product.getStatus()))
                .filter(product -> product.getCategory() != null && isActive(product.getCategory().getStatus()))
                .flatMap(product -> product.getVariants().stream()
                        .filter(variant -> isActive(variant.getStatus()))
                        .sorted(Comparator.comparing(ProductVariantEntity::getId))
                        .map(variant -> toAvailability(product, variant, scopedStoreId)))
                .toList();
    }

    private ProductAvailabilityResponse toAvailability(
            ProductEntity product,
            ProductVariantEntity variant,
            Long storeId
    ) {
        RecipeEntity recipe = recipeRepository.findByProductVariant_IdAndStatus(variant.getId(), ACTIVE).orElse(null);
        if (recipe == null) {
            return unavailable(product, variant, MISSING_RECIPE, List.of());
        }
        if (recipe.getIngredients().isEmpty()) {
            return unavailable(product, variant, EMPTY_RECIPE, List.of());
        }

        for (RecipeIngredientEntity recipeIngredient : recipe.getIngredients()) {
            IngredientEntity ingredient = recipeIngredient.getIngredient();
            if (!isActive(ingredient.getStatus())) {
                return unavailable(product, variant, INGREDIENT_INACTIVE, List.of(shortage(recipeIngredient, BigDecimal.ZERO)));
            }
            if (!sameText(ingredient.getUnit(), recipeIngredient.getUnit())) {
                return unavailable(product, variant, UNIT_MISMATCH, List.of(shortage(recipeIngredient, BigDecimal.ZERO)));
            }
        }

        List<StockShortageResponse> shortages = recipe.getIngredients().stream()
                .map(recipeIngredient -> {
                    BigDecimal currentStock = stockMovementRepository.calculateCurrentStock(
                            storeId,
                            recipeIngredient.getIngredient().getId()
                    );
                    if (currentStock.compareTo(recipeIngredient.getQuantity()) >= 0) {
                        return null;
                    }
                    return shortage(recipeIngredient, currentStock);
                })
                .filter(shortage -> shortage != null)
                .toList();
        if (!shortages.isEmpty()) {
            return unavailable(product, variant, INSUFFICIENT_STOCK, shortages);
        }
        return ProductAvailabilityResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .variantId(variant.getId())
                .size(variant.getSize())
                .available(true)
                .reason(null)
                .shortages(List.of())
                .build();
    }

    private ProductAvailabilityResponse unavailable(
            ProductEntity product,
            ProductVariantEntity variant,
            String reason,
            List<StockShortageResponse> shortages
    ) {
        return ProductAvailabilityResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .variantId(variant.getId())
                .size(variant.getSize())
                .available(false)
                .reason(reason)
                .shortages(shortages)
                .build();
    }

    private StockShortageResponse shortage(RecipeIngredientEntity recipeIngredient, BigDecimal availableQuantity) {
        IngredientEntity ingredient = recipeIngredient.getIngredient();
        return StockShortageResponse.builder()
                .ingredientId(ingredient.getId())
                .ingredientName(ingredient.getName())
                .requiredQuantity(recipeIngredient.getQuantity())
                .availableQuantity(availableQuantity)
                .unit(recipeIngredient.getUnit())
                .build();
    }

    private Long resolveStoreId(Long requestedStoreId, UserEntity actor) {
        if (isAdmin(actor)) {
            if (requestedStoreId != null) {
                return requestedStoreId;
            }
            return firstActiveStore(actor);
        }
        List<Long> storeIds = activeStoreIds(actor);
        if (requestedStoreId != null) {
            if (!storeIds.contains(requestedStoreId)) {
                throw new AccessDeniedException("Store access denied");
            }
            return requestedStoreId;
        }
        if (storeIds.isEmpty()) {
            throw new AccessDeniedException("User has no active store assignment");
        }
        return storeIds.get(0);
    }

    private Long firstActiveStore(UserEntity actor) {
        List<Long> storeIds = activeStoreIds(actor);
        if (storeIds.isEmpty()) {
            throw new BadRequestException("Store id is required");
        }
        return storeIds.get(0);
    }

    private List<Long> activeStoreIds(UserEntity actor) {
        return storeUserRepository.findByUserId(actor.getId()).stream()
                .filter(storeUser -> isActive(storeUser.getStatus()))
                .map(StoreUserEntity::getStore)
                .map(StoreEntity::getId)
                .toList();
    }

    private boolean isAdmin(UserEntity user) {
        return user.getRole() != null && ROLE_ADMIN.equalsIgnoreCase(user.getRole().getName());
    }

    private boolean isActive(String status) {
        return status != null && ACTIVE.equalsIgnoreCase(status);
    }

    private boolean sameText(String left, String right) {
        return left != null && right != null && left.toLowerCase(Locale.ROOT).equals(right.toLowerCase(Locale.ROOT));
    }
}
