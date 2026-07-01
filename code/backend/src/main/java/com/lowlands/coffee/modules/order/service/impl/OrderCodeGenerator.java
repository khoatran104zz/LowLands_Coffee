package com.lowlands.coffee.modules.order.service.impl;

import com.lowlands.coffee.modules.order.repository.OrderRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class OrderCodeGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd");

    private final OrderRepository orderRepository;

    public OrderCodeGenerator(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public synchronized String generate() {
        String prefix = "LL-" + LocalDate.now().format(DATE_FORMAT) + "-";
        long sequence = orderRepository.countByOrderCodeStartingWith(prefix) + 1;
        String orderCode = format(prefix, sequence);
        while (orderRepository.existsByOrderCode(orderCode)) {
            sequence++;
            orderCode = format(prefix, sequence);
        }
        return orderCode;
    }

    private String format(String prefix, long sequence) {
        return prefix + String.format("%04d", sequence);
    }
}
