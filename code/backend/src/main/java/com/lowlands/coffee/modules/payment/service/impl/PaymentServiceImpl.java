package com.lowlands.coffee.modules.payment.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.order.repository.PaymentRepository;
import com.lowlands.coffee.modules.payment.dto.request.PaymentActionRequest;
import com.lowlands.coffee.modules.payment.dto.request.PaymentPayRequest;
import com.lowlands.coffee.modules.payment.dto.response.PaymentDetailResponse;
import com.lowlands.coffee.modules.payment.mapper.PaymentMapper;
import com.lowlands.coffee.modules.payment.service.PaymentService;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final String ACTIVE = "active";
    private static final String ADMIN = "ADMIN";
    private static final String CANCELLED = "CANCELLED";
    private static final String UNPAID = "UNPAID";
    private static final String PAID = "PAID";
    private static final String FAILED = "FAILED";
    private static final String REFUNDED = "REFUNDED";

    private static final Set<String> PAYMENT_METHODS = Set.of("CASH", "BANKING", "MOMO", "CARD");

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final StoreUserRepository storeUserRepository;
    private final PaymentMapper paymentMapper;

    public PaymentServiceImpl(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            StoreUserRepository storeUserRepository,
            PaymentMapper paymentMapper
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.storeUserRepository = storeUserRepository;
        this.paymentMapper = paymentMapper;
    }

    @Override
    public PaymentDetailResponse payOrder(Long orderId, PaymentPayRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        OrderEntity order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        ensureStoreScope(actor, order.getStore().getId());
        if (CANCELLED.equals(order.getStatus())) {
            throw new BadRequestException("Cancelled order cannot be paid");
        }

        String method = normalizeAllowed(request.getMethod(), PAYMENT_METHODS, "Unsupported payment method");
        PaymentEntity payment = paymentRepository.findByOrderIdForUpdate(order.getId())
                .orElseGet(() -> createPayment(order, method));
        if (PAID.equals(payment.getPaymentStatus())) {
            return paymentMapper.toDetailResponse(payment);
        }
        if (REFUNDED.equals(payment.getPaymentStatus())) {
            throw new BadRequestException("Refunded payment cannot be paid again");
        }

        payment.setPaymentMethod(method);
        payment.setPaymentStatus(PAID);
        payment.setAmount(order.getTotalAmount());
        payment.setPaidAt(LocalDateTime.now());
        order.setPayment(payment);
        return paymentMapper.toDetailResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDetailResponse findById(Long id, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        PaymentEntity payment = getPayment(id);
        ensureStoreScope(actor, payment.getOrder().getStore().getId());
        return paymentMapper.toDetailResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDetailResponse findByOrderId(Long orderId, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        PaymentEntity payment = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        ensureStoreScope(actor, payment.getOrder().getStore().getId());
        return paymentMapper.toDetailResponse(payment);
    }

    @Override
    public PaymentDetailResponse refund(Long id, PaymentActionRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        PaymentEntity payment = getPayment(id);
        ensureStoreScope(actor, payment.getOrder().getStore().getId());
        if (REFUNDED.equals(payment.getPaymentStatus())) {
            return paymentMapper.toDetailResponse(payment);
        }
        if (!PAID.equals(payment.getPaymentStatus())) {
            throw new BadRequestException("Only paid payment can be refunded");
        }
        payment.setPaymentStatus(REFUNDED);
        return paymentMapper.toDetailResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentDetailResponse fail(Long id, PaymentActionRequest request, String actorEmail) {
        UserEntity actor = getActor(actorEmail);
        PaymentEntity payment = getPayment(id);
        ensureStoreScope(actor, payment.getOrder().getStore().getId());
        if (FAILED.equals(payment.getPaymentStatus())) {
            return paymentMapper.toDetailResponse(payment);
        }
        if (!UNPAID.equals(payment.getPaymentStatus())) {
            throw new BadRequestException("Only unpaid payment can be marked as failed");
        }
        payment.setPaymentStatus(FAILED);
        payment.setPaidAt(null);
        return paymentMapper.toDetailResponse(paymentRepository.save(payment));
    }

    private PaymentEntity createPayment(OrderEntity order, String method) {
        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setPaymentMethod(method);
        payment.setPaymentStatus(UNPAID);
        payment.setAmount(order.getTotalAmount());
        return payment;
    }

    private PaymentEntity getPayment(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    private UserEntity getActor(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureStoreScope(UserEntity actor, Long storeId) {
        if (isAdmin(actor)) {
            return;
        }
        boolean allowed = storeUserRepository.findByUserId(actor.getId()).stream()
                .filter(storeUser -> ACTIVE.equalsIgnoreCase(storeUser.getStatus()))
                .map(StoreUserEntity::getStore)
                .map(StoreEntity::getId)
                .anyMatch(storeId::equals);
        if (!allowed) {
            throw new AccessDeniedException("Store access denied");
        }
    }

    private boolean isAdmin(UserEntity user) {
        return user.getRole() != null && ADMIN.equalsIgnoreCase(user.getRole().getName());
    }

    private String normalizeAllowed(String value, Set<String> allowedValues, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!allowedValues.contains(normalized)) {
            throw new BadRequestException(message);
        }
        return normalized;
    }
}
