package com.lowlands.coffee.modules.payment.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.payment.dto.request.PaymentActionRequest;
import com.lowlands.coffee.modules.payment.dto.request.PaymentPayRequest;
import com.lowlands.coffee.modules.payment.dto.response.PaymentDetailResponse;
import com.lowlands.coffee.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/orders/{orderId}/pay")
    @PreAuthorize("hasAuthority('PAYMENT_CREATE')")
    public ApiResponse<PaymentDetailResponse> payOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentPayRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Payment completed", paymentService.payOrder(orderId, request, authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PAYMENT_VIEW')")
    public ApiResponse<PaymentDetailResponse> findById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(paymentService.findById(id, authentication.getName()));
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAuthority('PAYMENT_VIEW')")
    public ApiResponse<PaymentDetailResponse> findByOrderId(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        return ApiResponse.success(paymentService.findByOrderId(orderId, authentication.getName()));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAuthority('PAYMENT_REFUND')")
    public ApiResponse<PaymentDetailResponse> refund(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) PaymentActionRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Payment refunded", paymentService.refund(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/fail")
    @PreAuthorize("hasAuthority('PAYMENT_UPDATE')")
    public ApiResponse<PaymentDetailResponse> fail(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) PaymentActionRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Payment failed", paymentService.fail(id, request, authentication.getName()));
    }
}
