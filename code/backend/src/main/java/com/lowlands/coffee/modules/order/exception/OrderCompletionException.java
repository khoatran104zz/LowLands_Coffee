package com.lowlands.coffee.modules.order.exception;

import com.lowlands.coffee.modules.order.dto.response.OrderCompletionFailureResponse;
import lombok.Getter;

@Getter
public class OrderCompletionException extends RuntimeException {

    private final OrderCompletionFailureResponse details;

    public OrderCompletionException(String message, OrderCompletionFailureResponse details) {
        super(message);
        this.details = details;
    }
}
