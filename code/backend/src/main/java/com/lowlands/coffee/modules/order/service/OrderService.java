package com.lowlands.coffee.modules.order.service;

import com.lowlands.coffee.modules.order.dto.request.OrderCancelRequest;
import com.lowlands.coffee.modules.order.dto.request.OrderCreateRequest;
import com.lowlands.coffee.modules.order.dto.response.OrderResponse;
import org.springframework.data.domain.Page;

public interface OrderService {

    OrderResponse create(OrderCreateRequest request, String actorEmail);

    Page<OrderResponse> findAll(
            Long storeId,
            String status,
            String orderType,
            String search,
            int page,
            int size,
            String actorEmail
    );

    OrderResponse findById(Long id, String actorEmail);

    OrderResponse findByCode(String orderCode, String actorEmail);

    OrderResponse confirm(Long id, String actorEmail);

    OrderResponse prepare(Long id, String actorEmail);

    OrderResponse ready(Long id, String actorEmail);

    OrderResponse cancel(Long id, OrderCancelRequest request, String actorEmail);

    OrderResponse complete(Long id, String actorEmail);
}
