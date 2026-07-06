package com.lowlands.coffee.modules.promotion.service.impl;

import com.lowlands.coffee.modules.product.entity.CategoryEntity;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.repository.CategoryRepository;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.promotion.dto.request.*;
import com.lowlands.coffee.modules.promotion.dto.response.*;
import com.lowlands.coffee.modules.promotion.entity.PromotionEntity;
import com.lowlands.coffee.modules.promotion.mapper.PromotionMapper;
import com.lowlands.coffee.modules.promotion.repository.PromotionRepository;
import com.lowlands.coffee.modules.promotion.service.PromotionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PromotionMapper promotionMapper;

    public PromotionServiceImpl(
            PromotionRepository promotionRepository,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            PromotionMapper promotionMapper
    ) {
        this.promotionRepository = promotionRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.promotionMapper = promotionMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PromotionResponse> findAll(String status, String applicableType, String search, Pageable pageable) {
        return promotionRepository.findAllFiltered(status, applicableType, search, pageable)
                .map(promotionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> findActive() {
        return promotionRepository.findAllByStatusIgnoreCase("Active").stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse findById(Long id) {
        PromotionEntity entity = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found with ID: " + id));
        return promotionMapper.toResponse(entity);
    }

    @Override
    public PromotionResponse create(PromotionCreateRequest request) {
        if (promotionRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Promotion code already exists: " + request.getCode());
        }

        PromotionEntity entity = new PromotionEntity();
        mapRequestToEntity(request, entity);
        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    @Override
    public PromotionResponse update(Long id, PromotionUpdateRequest request) {
        PromotionEntity entity = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found with ID: " + id));

        Optional<PromotionEntity> existing = promotionRepository.findByCodeIgnoreCase(request.getCode());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new IllegalArgumentException("Promotion code already exists: " + request.getCode());
        }

        // Clear existing associations
        entity.getProducts().clear();
        entity.getCategories().clear();

        mapUpdateRequestToEntity(request, entity);
        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    @Override
    public void delete(Long id) {
        PromotionEntity entity = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found with ID: " + id));
        promotionRepository.delete(entity);
    }

    @Override
    public PromotionResponse updateStatus(Long id, String status) {
        PromotionEntity entity = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found with ID: " + id));
        entity.setStatus(status);
        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAvailablePromotions(PromotionAvailableRequest request) {
        List<PromotionEntity> activePromos = promotionRepository.findAllByStatusIgnoreCase("Active");
        List<PromotionResponse> available = new ArrayList<>();

        for (PromotionEntity promo : activePromos) {
            PromotionValidateRequest validateReq = new PromotionValidateRequest();
            validateReq.setPromotionCode(promo.getCode());
            validateReq.setItems(request.getItems());
            validateReq.setOrderTotal(request.getOrderTotal());

            PromotionValidateResponse valRes = validatePromotion(validateReq);
            if (valRes.isValid()) {
                available.add(promotionMapper.toResponse(promo));
            }
        }
        return available;
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionValidateResponse validatePromotion(PromotionValidateRequest request) {
        PromotionEntity promo = promotionRepository.findByCodeIgnoreCase(request.getPromotionCode()).orElse(null);
        if (promo == null) {
            return new PromotionValidateResponse(false, BigDecimal.ZERO, "Mã khuyến mãi không tồn tại.");
        }

        // 1. Status Check
        if (!"Active".equalsIgnoreCase(promo.getStatus())) {
            return new PromotionValidateResponse(false, BigDecimal.ZERO, "Khuyến mãi không hoạt động.");
        }

        // 2. Date Check
        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            return new PromotionValidateResponse(false, BigDecimal.ZERO, "Chương trình khuyến mãi chưa bắt đầu.");
        }
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            return new PromotionValidateResponse(false, BigDecimal.ZERO, "Chương trình khuyến mãi đã hết hạn.");
        }

        // 3. Usage Limit Check
        if (promo.getUsageLimit() != null && promo.getUsedCount() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            return new PromotionValidateResponse(false, BigDecimal.ZERO, "Khuyến mãi đã hết lượt sử dụng.");
        }

        // 4. Minimum Order Value Check
        BigDecimal minOrderVal = promo.getMinimumOrderValue() != null ? promo.getMinimumOrderValue() : BigDecimal.ZERO;
        if (request.getOrderTotal().compareTo(minOrderVal) < 0) {
            return new PromotionValidateResponse(false, BigDecimal.ZERO,
                    String.format("Đơn hàng chưa đạt giá trị tối thiểu %sđ để áp dụng khuyến mãi.", minOrderVal.setScale(0, RoundingMode.HALF_UP)));
        }

        // 5. Product & Category Applicability Check & Discount Calculation
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal eligibleSubtotal = calculateEligibleSubtotal(promo, request.getItems());

        if (eligibleSubtotal != null) {
            // Means it's item-specific (Product or Category)
            if (eligibleSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
                return new PromotionValidateResponse(false, BigDecimal.ZERO,
                        "Đơn hàng không chứa sản phẩm được áp dụng mã khuyến mãi này.");
            }

            if ("Percentage".equalsIgnoreCase(promo.getDiscountType())) {
                discount = eligibleSubtotal.multiply(promo.getDiscountValue()).divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP);
                if (promo.getMaximumDiscount() != null && discount.compareTo(promo.getMaximumDiscount()) > 0) {
                    discount = promo.getMaximumDiscount();
                }
            } else if ("Fixed Amount".equalsIgnoreCase(promo.getDiscountType())) {
                discount = promo.getDiscountValue();
                if (discount.compareTo(eligibleSubtotal) > 0) {
                    discount = eligibleSubtotal;
                }
            }
        } else {
            // Entire Order
            if ("Percentage".equalsIgnoreCase(promo.getDiscountType())) {
                discount = request.getOrderTotal().multiply(promo.getDiscountValue()).divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP);
                if (promo.getMaximumDiscount() != null && discount.compareTo(promo.getMaximumDiscount()) > 0) {
                    discount = promo.getMaximumDiscount();
                }
            } else if ("Fixed Amount".equalsIgnoreCase(promo.getDiscountType())) {
                discount = promo.getDiscountValue();
            }
        }

        // Cap discount to orderTotal
        if (discount.compareTo(request.getOrderTotal()) > 0) {
            discount = request.getOrderTotal();
        }

        return new PromotionValidateResponse(true, discount.setScale(2, RoundingMode.HALF_UP), "Áp dụng khuyến mãi thành công.");
    }

    private BigDecimal calculateEligibleSubtotal(PromotionEntity promo, List<PromotionItemRequest> items) {
        if ("Entire Order".equalsIgnoreCase(promo.getApplicableType())) {
            return null;
        }

        BigDecimal eligibleSubtotal = BigDecimal.ZERO;
        for (PromotionItemRequest item : items) {
            ProductEntity product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) continue;

            boolean isEligible = false;
            if ("Product".equalsIgnoreCase(promo.getApplicableType())) {
                isEligible = promo.getProducts().stream()
                        .anyMatch(p -> p.getId().equals(product.getId()));
            } else if ("Category".equalsIgnoreCase(promo.getApplicableType())) {
                isEligible = promo.getCategories().stream()
                        .anyMatch(c -> c.getId().equals(product.getCategory().getId()));
            }

            if (isEligible) {
                // Find variant price, fallback to size M or first variant
                BigDecimal itemPrice = product.getVariants().stream()
                        .filter(v -> "M".equalsIgnoreCase(v.getSize()))
                        .findFirst()
                        .map(com.lowlands.coffee.modules.product.entity.ProductVariantEntity::getPrice)
                        .orElse(
                            product.getVariants().isEmpty() ? BigDecimal.ZERO : product.getVariants().iterator().next().getPrice()
                        );
                eligibleSubtotal = eligibleSubtotal.add(itemPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        return eligibleSubtotal;
    }

    private void mapRequestToEntity(PromotionCreateRequest req, PromotionEntity entity) {
        entity.setCode(req.getCode());
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setDiscountType(req.getDiscountType());
        entity.setDiscountValue(req.getDiscountValue());
        entity.setMinimumOrderValue(req.getMinimumOrderValue() != null ? req.getMinimumOrderValue() : BigDecimal.ZERO);
        entity.setMaximumDiscount(req.getMaximumDiscount());
        entity.setStartDate(req.getStartDate());
        entity.setEndDate(req.getEndDate());
        entity.setUsageLimit(req.getUsageLimit());
        entity.setStatus(req.getStatus());
        entity.setApplicableType(req.getApplicableType());

        if (req.getApplicableProductIds() != null) {
            entity.setProducts(new HashSet<>(productRepository.findAllById(req.getApplicableProductIds())));
        }
        if (req.getApplicableCategoryIds() != null) {
            entity.setCategories(new HashSet<>(categoryRepository.findAllById(req.getApplicableCategoryIds())));
        }
    }

    private void mapUpdateRequestToEntity(PromotionUpdateRequest req, PromotionEntity entity) {
        entity.setCode(req.getCode());
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setDiscountType(req.getDiscountType());
        entity.setDiscountValue(req.getDiscountValue());
        entity.setMinimumOrderValue(req.getMinimumOrderValue() != null ? req.getMinimumOrderValue() : BigDecimal.ZERO);
        entity.setMaximumDiscount(req.getMaximumDiscount());
        entity.setStartDate(req.getStartDate());
        entity.setEndDate(req.getEndDate());
        entity.setUsageLimit(req.getUsageLimit());
        entity.setStatus(req.getStatus());
        entity.setApplicableType(req.getApplicableType());

        if (req.getApplicableProductIds() != null) {
            entity.setProducts(new HashSet<>(productRepository.findAllById(req.getApplicableProductIds())));
        }
        if (req.getApplicableCategoryIds() != null) {
            entity.setCategories(new HashSet<>(categoryRepository.findAllById(req.getApplicableCategoryIds())));
        }
    }
}
