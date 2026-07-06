package com.lowlands.coffee.modules.payment.mapper;

import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import com.lowlands.coffee.modules.payment.dto.response.PaymentDetailResponse;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentDetailResponse toDetailResponse(PaymentEntity payment) {
        OrderEntity order = payment.getOrder();
        return PaymentDetailResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .storeId(order.getStore().getId())
                .storeName(order.getStore().getName())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .paymentGateway(payment.getPaymentGateway())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
