package com.lowlands.coffee.modules.order.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.order.dto.request.OrderCancelRequest;
import com.lowlands.coffee.modules.order.dto.request.OrderCreateRequest;
import com.lowlands.coffee.modules.order.dto.response.OrderResponse;
import com.lowlands.coffee.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ORDER_CREATE')")
    public ApiResponse<OrderResponse> create(
            @Valid @RequestBody OrderCreateRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Order created", orderService.create(request, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ApiResponse<Page<OrderResponse>> findAll(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.findAll(
                storeId,
                status,
                orderType,
                search,
                page,
                size,
                authentication.getName()
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ApiResponse<OrderResponse> findById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.findById(id, authentication.getName()));
    }

    @GetMapping("/code/{orderCode}")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ApiResponse<OrderResponse> findByCode(
            @PathVariable String orderCode,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.findByCode(orderCode, authentication.getName()));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ApiResponse<OrderResponse> confirm(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.confirm(id, authentication.getName()));
    }

    @PostMapping("/{id}/prepare")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ApiResponse<OrderResponse> prepare(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.prepare(id, authentication.getName()));
    }

    @PostMapping("/{id}/ready")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ApiResponse<OrderResponse> ready(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.ready(id, authentication.getName()));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ORDER_CANCEL')")
    public ApiResponse<OrderResponse> cancel(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) OrderCancelRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.cancel(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('ORDER_COMPLETE')")
    public ApiResponse<OrderResponse> complete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(orderService.complete(id, authentication.getName()));
    }
}
