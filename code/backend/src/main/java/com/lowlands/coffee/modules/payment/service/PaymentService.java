package com.lowlands.coffee.modules.payment.service;

import com.lowlands.coffee.modules.payment.dto.request.PaymentActionRequest;
import com.lowlands.coffee.modules.payment.dto.request.PaymentPayRequest;
import com.lowlands.coffee.modules.payment.dto.response.PaymentDetailResponse;

public interface PaymentService {

    PaymentDetailResponse payOrder(Long orderId, PaymentPayRequest request, String actorEmail);

    PaymentDetailResponse findById(Long id, String actorEmail);

    PaymentDetailResponse findByOrderId(Long orderId, String actorEmail);

    PaymentDetailResponse refund(Long id, PaymentActionRequest request, String actorEmail);

    PaymentDetailResponse fail(Long id, PaymentActionRequest request, String actorEmail);
}
