package com.lowlands.coffee.modules.payment.service;

import java.util.Map;

public interface SandboxPaymentService {

    /**
     * Creates a MoMo Sandbox payment request for the given order ID.
     *
     * @param orderId the order ID
     * @return the MoMo payUrl to redirect the user to
     */
    String createMomoPayment(Long orderId);

    /**
     * Creates a VNPay Sandbox payment request for the given order ID.
     *
     * @param orderId the order ID
     * @param ipAddress the client's IP address
     * @return the VNPay payment URL to redirect the user to
     */
    String createVnpayPayment(Long orderId, String ipAddress);

    /**
     * Processes MoMo return callback, updates order status, and returns the frontend result page URL.
     *
     * @param params query parameters sent by MoMo
     * @return the frontend result redirect URL
     */
    String handleMomoReturn(Map<String, String> params);

    /**
     * Processes MoMo IPN callback, verifies signature, and updates order status.
     *
     * @param params body parameters sent by MoMo
     */
    void handleMomoIpn(Map<String, Object> params);

    /**
     * Processes VNPay return callback, updates order status, and returns the frontend result page URL.
     *
     * @param params query parameters sent by VNPay
     * @return the frontend result redirect URL
     */
    String handleVnpayReturn(Map<String, String> params);

    /**
     * Processes VNPay IPN callback, verifies secure hash, and updates order status.
     *
     * @param params query parameters sent by VNPay
     */
    void handleVnpayIpn(Map<String, String> params);
}
