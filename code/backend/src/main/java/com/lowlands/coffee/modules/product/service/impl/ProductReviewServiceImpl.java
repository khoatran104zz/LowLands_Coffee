package com.lowlands.coffee.modules.product.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.product.dto.request.ProductReviewRequest;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewEligibilityResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewResponse;
import com.lowlands.coffee.modules.product.dto.response.ProductReviewSummaryResponse;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.entity.ProductReviewEntity;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.product.repository.ProductReviewRepository;
import com.lowlands.coffee.modules.product.service.ProductReviewService;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class ProductReviewServiceImpl implements ProductReviewService {

    private static final String ACTIVE = "active";
    private static final String VISIBLE = "VISIBLE";
    private static final String PURCHASE_REQUIRED_MESSAGE = "Bạn cần hoàn tất đơn hàng có sản phẩm này trước khi đánh giá.";

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ProductReviewServiceImpl(
            ProductReviewRepository productReviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderRepository orderRepository
    ) {
        this.productReviewRepository = productReviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewSummaryResponse findByProductId(Long productId) {
        getPublicProduct(productId);
        List<ProductReviewResponse> reviews = productReviewRepository
                .findByProductIdAndStatusOrderByCreatedAtDesc(productId, VISIBLE)
                .stream()
                .map(this::toResponse)
                .toList();
        double averageRating = reviews.stream()
                .mapToInt(ProductReviewResponse::getRating)
                .average()
                .orElse(0);
        return ProductReviewSummaryResponse.builder()
                .averageRating(roundOneDecimal(averageRating))
                .reviewCount(reviews.size())
                .reviews(reviews)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewEligibilityResponse getEligibility(Long productId, String actorEmail) {
        getPublicProduct(productId);
        UserEntity user = getUser(actorEmail);
        ProductReviewResponse existingReview = productReviewRepository.findByProductIdAndUserId(productId, user.getId())
                .map(this::toResponse)
                .orElse(null);
        boolean purchased = orderRepository.existsCompletedPurchaseByUserAndProduct(user.getId(), productId);
        boolean canReview = purchased || existingReview != null;
        String message = canReview
                ? (existingReview == null ? "Bạn có thể đánh giá sản phẩm này." : "Bạn đã đánh giá sản phẩm này và có thể cập nhật lại.")
                : PURCHASE_REQUIRED_MESSAGE;
        return ProductReviewEligibilityResponse.builder()
                .canReview(canReview)
                .hasReviewed(existingReview != null)
                .message(message)
                .review(existingReview)
                .build();
    }

    @Override
    public ProductReviewResponse submit(Long productId, ProductReviewRequest request, String actorEmail) {
        ProductEntity product = getPublicProduct(productId);
        UserEntity user = getUser(actorEmail);
        boolean purchased = orderRepository.existsCompletedPurchaseByUserAndProduct(user.getId(), productId);
        if (!purchased) {
            throw new BadRequestException(PURCHASE_REQUIRED_MESSAGE);
        }

        ProductReviewEntity review = productReviewRepository.findByProductIdAndUserId(productId, user.getId())
                .orElseGet(ProductReviewEntity::new);
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(cleanComment(request.getComment()));
        review.setStatus(VISIBLE);
        return toResponse(productReviewRepository.save(review));
    }

    private ProductEntity getPublicProduct(Long productId) {
        return productRepository.findById(productId)
                .filter(product -> ACTIVE.equals(product.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private UserEntity getUser(String actorEmail) {
        if (actorEmail == null || actorEmail.isBlank()) {
            throw new BadRequestException("Bạn cần đăng nhập để đánh giá sản phẩm.");
        }
        return userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProductReviewResponse toResponse(ProductReviewEntity review) {
        return ProductReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .reviewerName(displayName(review.getUser()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    private String displayName(UserEntity user) {
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        return user.getEmail();
    }

    private String cleanComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        return comment.trim();
    }

    private double roundOneDecimal(double value) {
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
