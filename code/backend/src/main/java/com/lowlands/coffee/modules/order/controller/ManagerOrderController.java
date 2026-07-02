package com.lowlands.coffee.modules.order.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.order.dto.request.OrderCancelRequest;
import com.lowlands.coffee.modules.order.dto.response.OrderResponse;
import com.lowlands.coffee.modules.order.service.OrderService;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/manager/orders")
public class ManagerOrderController {

    private final OrderService orderService;
    private final ManagerStoreContextService managerStoreContextService;

    public ManagerOrderController(
            OrderService orderService,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.orderService = orderService;
        this.managerStoreContextService = managerStoreContextService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ApiResponse<Page<OrderResponse>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long storeId = managerStoreContextService.getCurrentManagerStoreId();
        String email = managerStoreContextService.getCurrentUser().getEmail();
        return ApiResponse.success(orderService.findAll(storeId, status, orderType, search, page, size, email));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ApiResponse<OrderResponse> findById(@PathVariable Long id) {
        String email = managerStoreContextService.getCurrentUser().getEmail();
        return ApiResponse.success(orderService.findById(id, email));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ApiResponse<OrderResponse> confirm(@PathVariable Long id) {
        String email = managerStoreContextService.getCurrentUser().getEmail();
        return ApiResponse.success(orderService.confirm(id, email));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ORDER_CANCEL')")
    public ApiResponse<OrderResponse> cancel(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) OrderCancelRequest request
    ) {
        String email = managerStoreContextService.getCurrentUser().getEmail();
        return ApiResponse.success(orderService.cancel(id, request, email));
    }
}
