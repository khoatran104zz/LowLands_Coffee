package com.lowlands.coffee.modules.order.mapper;

import com.lowlands.coffee.modules.order.dto.response.OrderItemResponse;
import com.lowlands.coffee.modules.order.dto.response.OrderItemToppingResponse;
import com.lowlands.coffee.modules.order.dto.response.OrderResponse;
import com.lowlands.coffee.modules.order.dto.response.PaymentResponse;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.OrderItemEntity;
import com.lowlands.coffee.modules.order.entity.OrderItemToppingEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(OrderEntity order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setOrderType(order.getOrderType());
        response.setStatus(order.getStatus());
        response.setUserId(order.getUser() == null ? null : order.getUser().getId());
        response.setStoreId(order.getStore().getId());
        response.setStoreName(order.getStore().getName());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setSubtotal(order.getSubtotal());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setTotalAmount(order.getTotalAmount());
        response.setNote(order.getNote());
        response.setPayment(toPaymentResponse(order.getPayment()));
        response.setItems(order.getItems().stream()
                .map(this::toItemResponse)
                .toList());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        return response;
    }

    private OrderItemResponse toItemResponse(OrderItemEntity item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct().getId());
        response.setProductVariantId(item.getProductVariant().getId());
        response.setProductName(item.getProductName());
        response.setSize(item.getSize());
        response.setUnitPrice(item.getUnitPrice());
        response.setQuantity(item.getQuantity());
        response.setTotalPrice(item.getTotalPrice());
        response.setNote(item.getNote());
        response.setToppings(item.getToppings().stream()
                .map(this::toToppingResponse)
                .toList());
        return response;
    }

    private OrderItemToppingResponse toToppingResponse(OrderItemToppingEntity topping) {
        OrderItemToppingResponse response = new OrderItemToppingResponse();
        response.setId(topping.getId());
        response.setToppingId(topping.getTopping().getId());
        response.setToppingName(topping.getToppingName());
        response.setUnitPrice(topping.getUnitPrice());
        response.setQuantity(topping.getQuantity());
        response.setTotalPrice(topping.getTotalPrice());
        return response;
    }

    private PaymentResponse toPaymentResponse(PaymentEntity payment) {
        if (payment == null) {
            return null;
        }
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setAmount(payment.getAmount());
        response.setPaidAt(payment.getPaidAt());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}
