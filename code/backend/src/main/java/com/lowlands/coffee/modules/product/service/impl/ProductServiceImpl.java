package com.lowlands.coffee.modules.product.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.product.dto.request.ProductCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductUpdateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductVariantCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductVariantUpdateRequest;
import com.lowlands.coffee.modules.product.dto.response.MenuResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductResponse;
import com.lowlands.coffee.modules.product.entity.CategoryEntity;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.entity.ProductToppingEntity;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import com.lowlands.coffee.modules.product.mapper.CategoryMapper;
import com.lowlands.coffee.modules.product.mapper.ProductMapper;
import com.lowlands.coffee.modules.product.repository.CategoryRepository;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.product.repository.ToppingRepository;
import com.lowlands.coffee.modules.product.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private static final String ACTIVE = "active";
    private static final String INACTIVE = "inactive";

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ToppingRepository toppingRepository;
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ToppingRepository toppingRepository,
            ProductMapper productMapper,
            CategoryMapper categoryMapper
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.toppingRepository = toppingRepository;
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public MenuResponse getMenu() {
        return MenuResponse.builder()
                .categories(categoryRepository.findByStatusOrderByIdAsc(ACTIVE).stream()
                        .map(categoryMapper::toResponse)
                        .toList())
                .products(findPublicProducts(null, null, null, null))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> findPublicProducts(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        String normalizedSearch = normalizeSearch(search);
        return productRepository.findAllWithDetails().stream()
                .filter(this::isPublicProduct)
                .filter(product -> categoryId == null || product.getCategory().getId().equals(categoryId))
                .filter(product -> matchesSearch(product, normalizedSearch))
                .filter(product -> matchesPrice(product, minPrice, maxPrice))
                .map(productMapper::toPublicResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse findPublicById(Long id) {
        ProductEntity product = productRepository.findByIdWithDetails(id)
                .filter(this::isPublicProduct)
                .filter(this::hasActiveVariant)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toPublicResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAllWithDetails().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse create(ProductCreateRequest request) {
        validateCreateVariants(request.getVariants());
        CategoryEntity category = getCategory(request.getCategoryId());
        List<ToppingEntity> toppings = getToppings(request.getToppingIds());
        String status = defaultStatus(request.getStatus());
        validateCategoryCanBeUsed(status, category);
        validateToppingsCanBeUsed(status, toppings);
        ProductEntity product = new ProductEntity();
        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setDescription(clean(request.getDescription()));
        product.setImageUrl(clean(request.getImageUrl()));
        product.setStatus(status);
        request.getVariants().forEach(variant -> addVariant(product, variant));
        toppings.forEach(topping -> addTopping(product, topping));
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse update(Long id, ProductUpdateRequest request) {
        validateUpdateVariants(request.getVariants());
        ProductEntity product = getProduct(id);
        CategoryEntity category = getCategory(request.getCategoryId());
        List<ToppingEntity> toppings = getToppings(request.getToppingIds());
        validateCategoryCanBeUsed(request.getStatus(), category);
        validateToppingsCanBeUsed(request.getStatus(), toppings);
        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setDescription(clean(request.getDescription()));
        product.setImageUrl(clean(request.getImageUrl()));
        product.setStatus(request.getStatus());

        syncVariants(product, request.getVariants());
        syncToppings(product, toppings);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        ProductEntity product = getProduct(id);
        product.setStatus(INACTIVE);
        productRepository.save(product);
    }

    private ProductEntity getProduct(Long id) {
        return productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private CategoryEntity getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private List<ToppingEntity> getToppings(List<Long> toppingIds) {
        List<Long> ids = toppingIds == null ? List.of() : List.copyOf(new LinkedHashSet<>(toppingIds));
        if (ids.isEmpty()) {
            return List.of();
        }
        List<ToppingEntity> toppings = toppingRepository.findAllById(ids);
        if (toppings.size() != ids.size()) {
            throw new ResourceNotFoundException("Topping not found");
        }
        return toppings;
    }

    private void validateCreateVariants(List<ProductVariantCreateRequest> variants) {
        Set<String> sizes = new HashSet<>();
        for (ProductVariantCreateRequest variant : variants) {
            if (!sizes.add(variant.getSize())) {
                throw new BadRequestException("Variant size must be unique per product");
            }
        }
    }

    private void validateUpdateVariants(List<ProductVariantUpdateRequest> variants) {
        Set<String> sizes = new HashSet<>();
        Set<Long> ids = new HashSet<>();
        for (ProductVariantUpdateRequest variant : variants) {
            if (!sizes.add(variant.getSize())) {
                throw new BadRequestException("Variant size must be unique per product");
            }
            if (variant.getId() != null && !ids.add(variant.getId())) {
                throw new BadRequestException("Variant id must be unique per product");
            }
        }
    }

    private void syncVariants(ProductEntity product, List<ProductVariantUpdateRequest> requests) {
        List<ProductVariantEntity> existingVariants = List.copyOf(product.getVariants());
        Map<Long, ProductVariantEntity> variantsById = existingVariants.stream()
                .collect(Collectors.toMap(ProductVariantEntity::getId, Function.identity()));
        Set<Long> requestedIds = new HashSet<>();

        for (ProductVariantUpdateRequest request : requests) {
            Long variantId = request.getId();
            ensureSizeCanBeUsed(product, variantId, request.getSize());

            if (variantId == null) {
                addVariant(product, request);
                continue;
            }

            ProductVariantEntity variant = variantsById.get(variantId);
            if (variant == null) {
                throw new BadRequestException("Variant does not belong to product");
            }
            requestedIds.add(variantId);
            variant.setSize(request.getSize());
            variant.setPrice(request.getPrice());
            variant.setStatus(request.getStatus());
        }

        existingVariants.forEach(variant -> {
            if (!requestedIds.contains(variant.getId())) {
                variant.setStatus(INACTIVE);
            }
        });
    }

    private void ensureSizeCanBeUsed(ProductEntity product, Long currentVariantId, String size) {
        boolean sizeUsedByAnotherVariant = product.getVariants().stream()
                .anyMatch(variant -> variant.getSize().equals(size)
                        && (currentVariantId == null || !variant.getId().equals(currentVariantId)));
        if (sizeUsedByAnotherVariant) {
            throw new BadRequestException("Variant size already exists; update the existing variant id instead");
        }
    }

    private void addVariant(ProductEntity product, ProductVariantCreateRequest request) {
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setProduct(product);
        variant.setSize(request.getSize());
        variant.setPrice(request.getPrice());
        variant.setStatus(defaultStatus(request.getStatus()));
        product.getVariants().add(variant);
    }

    private void addVariant(ProductEntity product, ProductVariantUpdateRequest request) {
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setProduct(product);
        variant.setSize(request.getSize());
        variant.setPrice(request.getPrice());
        variant.setStatus(request.getStatus());
        product.getVariants().add(variant);
    }

    private void addTopping(ProductEntity product, ToppingEntity topping) {
        ProductToppingEntity productTopping = new ProductToppingEntity();
        productTopping.setProduct(product);
        productTopping.setTopping(topping);
        product.getProductToppings().add(productTopping);
    }

    private void syncToppings(ProductEntity product, List<ToppingEntity> toppings) {
        Set<Long> requestedToppingIds = toppings.stream()
                .map(ToppingEntity::getId)
                .collect(Collectors.toSet());
        Set<Long> existingToppingIds = product.getProductToppings().stream()
                .map(productTopping -> productTopping.getTopping().getId())
                .collect(Collectors.toSet());

        toppings.stream()
                .filter(topping -> !existingToppingIds.contains(topping.getId()))
                .forEach(topping -> addTopping(product, topping));

        product.getProductToppings().removeIf(productTopping ->
                !requestedToppingIds.contains(productTopping.getTopping().getId()));
    }

    private void validateCategoryCanBeUsed(String productStatus, CategoryEntity category) {
        if (ACTIVE.equals(productStatus) && !ACTIVE.equals(category.getStatus())) {
            throw new BadRequestException("Active product cannot be assigned to inactive category");
        }
    }

    private void validateToppingsCanBeUsed(String productStatus, List<ToppingEntity> toppings) {
        if (!ACTIVE.equals(productStatus)) {
            return;
        }
        boolean hasInactiveTopping = toppings.stream()
                .anyMatch(topping -> !ACTIVE.equals(topping.getStatus()));
        if (hasInactiveTopping) {
            throw new BadRequestException("Active product cannot be assigned inactive topping");
        }
    }

    private boolean isPublicProduct(ProductEntity product) {
        return ACTIVE.equals(product.getStatus())
                && ACTIVE.equals(product.getCategory().getStatus())
                && hasActiveVariant(product);
    }

    private boolean hasActiveVariant(ProductEntity product) {
        return product.getVariants().stream().anyMatch(variant -> ACTIVE.equals(variant.getStatus()));
    }

    private boolean matchesSearch(ProductEntity product, String search) {
        if (search == null) {
            return true;
        }
        return product.getName().toLowerCase(Locale.ROOT).contains(search)
                || Optional.ofNullable(product.getDescription())
                .map(description -> description.toLowerCase(Locale.ROOT).contains(search))
                .orElse(false);
    }

    private boolean matchesPrice(ProductEntity product, BigDecimal minPrice, BigDecimal maxPrice) {
        Optional<BigDecimal> minVariantPrice = product.getVariants().stream()
                .filter(variant -> ACTIVE.equals(variant.getStatus()))
                .map(ProductVariantEntity::getPrice)
                .min(BigDecimal::compareTo);
        return minVariantPrice
                .map(price -> (minPrice == null || price.compareTo(minPrice) >= 0)
                        && (maxPrice == null || price.compareTo(maxPrice) <= 0))
                .orElse(false);
    }

    private String defaultStatus(String status) {
        return status == null ? ACTIVE : status;
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim().toLowerCase(Locale.ROOT);
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
