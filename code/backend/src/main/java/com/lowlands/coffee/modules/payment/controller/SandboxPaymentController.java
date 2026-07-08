package com.lowlands.coffee.modules.payment.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.payment.service.SandboxPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
public class SandboxPaymentController {

    private static final Logger log = LoggerFactory.getLogger(SandboxPaymentController.class);

    private final SandboxPaymentService sandboxPaymentService;

    public SandboxPaymentController(SandboxPaymentService sandboxPaymentService) {
        this.sandboxPaymentService = sandboxPaymentService;
    }

    @PostMapping("/momo/create")
    public ApiResponse<Map<String, String>> createMomoPayment(@RequestBody Map<String, Long> request) {
        Long orderId = request.get("orderId");
        if (orderId == null) {
            throw new BadRequestException("orderId is required");
        }
        String redirectUrl = sandboxPaymentService.createMomoPayment(orderId);
        return ApiResponse.success("MoMo payment URL created successfully", Map.of(
                "payUrl", redirectUrl,
                "paymentUrl", redirectUrl,
                "redirectUrl", redirectUrl
        ));
    }

    @PostMapping("/vnpay/create")
    public ApiResponse<Map<String, String>> createVnpayPayment(@RequestBody Map<String, Long> request, HttpServletRequest httpRequest) {
        Long orderId = request.get("orderId");
        if (orderId == null) {
            throw new BadRequestException("orderId is required");
        }
        String ipAddress = getClientIp(httpRequest);
        String redirectUrl = sandboxPaymentService.createVnpayPayment(orderId, ipAddress);
        return ApiResponse.success("VNPay payment URL created successfully", Map.of(
                "payUrl", redirectUrl,
                "paymentUrl", redirectUrl,
                "redirectUrl", redirectUrl
        ));
    }

    @GetMapping("/momo/return")
    public ResponseEntity<Void> handleMomoReturn(@RequestParam Map<String, String> params) {
        String redirectUrl = sandboxPaymentService.handleMomoReturn(params);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, redirectUrl)
                .build();
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, Object>> handleMomoIpn(@RequestBody Map<String, Object> body) {
        sandboxPaymentService.handleMomoIpn(body);
        return ResponseEntity.ok(Map.of("resultCode", 0, "message", "IPN received successfully"));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> handleVnpayReturn(@RequestParam Map<String, String> params) {
        String redirectUrl = sandboxPaymentService.handleVnpayReturn(params);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, redirectUrl)
                .build();
    }

    @RequestMapping(value = "/vnpay/ipn", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, String>> handleVnpayIpn(@RequestParam Map<String, String> params) {
        try {
            sandboxPaymentService.handleVnpayIpn(params);
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (BadRequestException e) {
            log.warn("VNPay IPN rejected: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Signature"));
        } catch (ResourceNotFoundException e) {
            log.warn("VNPay IPN rejected: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
        } catch (Exception e) {
            log.error("VNPay IPN processing failed", e);
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Input data required"));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
