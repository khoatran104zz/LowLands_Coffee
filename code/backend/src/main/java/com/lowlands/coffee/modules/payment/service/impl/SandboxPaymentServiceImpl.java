package com.lowlands.coffee.modules.payment.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.order.repository.PaymentRepository;
import com.lowlands.coffee.modules.payment.service.SandboxPaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class SandboxPaymentServiceImpl implements SandboxPaymentService {

    private static final Logger log = LoggerFactory.getLogger(SandboxPaymentServiceImpl.class);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;

    @Value("${MOMO_PARTNER_CODE}")
    private String momoPartnerCode;

    @Value("${MOMO_ACCESS_KEY}")
    private String momoAccessKey;

    @Value("${MOMO_SECRET_KEY}")
    private String momoSecretKey;

    @Value("${MOMO_ENDPOINT}")
    private String momoEndpoint;

    @Value("${MOMO_RETURN_URL}")
    private String momoReturnUrl;

    @Value("${MOMO_NOTIFY_URL}")
    private String momoNotifyUrl;

    @Value("${VNP_TMNCODE}")
    private String vnpTmnCode;

    @Value("${VNP_HASH_SECRET}")
    private String vnpHashSecret;

    @Value("${VNP_URL}")
    private String vnpUrl;

    @Value("${VNP_RETURN_URL}")
    private String vnpReturnUrl;

    public SandboxPaymentServiceImpl(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String createMomoPayment(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if ("CANCELLED".equals(order.getStatus())) {
            throw new BadRequestException("Cannot pay for cancelled order");
        }

        PaymentEntity payment = paymentRepository.findByOrder_Id(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order"));

        if ("PAID".equals(payment.getPaymentStatus())) {
            throw new BadRequestException("Order is already paid");
        }

        String requestId = UUID.randomUUID().toString();
        String orderCode = order.getOrderCode();
        long amount = order.getTotalAmount().setScale(0, BigDecimal.ROUND_HALF_UP).longValue();
        String orderInfo = "Thanh toan don hang Lowlands Coffee " + orderCode;
        String extraData = "";
        String requestType = "captureWallet";

        // Signature format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        String rawSignature = String.format(
                "accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                momoAccessKey, amount, extraData, momoNotifyUrl, orderCode, orderInfo, momoPartnerCode, momoReturnUrl, requestId, requestType
        );

        String signature = hmacSha256(rawSignature, momoSecretKey);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("partnerCode", momoPartnerCode);
        requestBody.put("accessKey", momoAccessKey);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderCode);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", momoReturnUrl);
        requestBody.put("ipnUrl", momoNotifyUrl);
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", requestType);
        requestBody.put("signature", signature);

        log.info("MoMo Config: partnerCode='{}', accessKey='{}', endpoint='{}'", momoPartnerCode, momoAccessKey, momoEndpoint);
        log.info("MoMo Raw Signature String: '{}'", rawSignature);
        log.info("MoMo Computed Signature: '{}'", signature);
        log.info("MoMo Request Body: {}", requestBody);

        log.info("Sending payment request to MoMo Sandbox for Order: {}, amount: {}", orderCode, amount);

        try {
            Map<?, ?> response = restTemplate.postForObject(momoEndpoint, requestBody, Map.class);
            if (response == null) {
                throw new BadRequestException("Empty response from MoMo Gateway");
            }

            Integer resultCode = (Integer) response.get("resultCode");
            String message = (String) response.get("message");
            String payUrl = (String) response.get("payUrl");

            log.info("MoMo Sandbox Response for Order: {} - resultCode: {}, message: {}", orderCode, resultCode, message);

            if (resultCode != null && resultCode == 0 && payUrl != null) {
                payment.setPaymentGateway("MOMO");
                payment.setTransactionId((String) response.get("transId"));
                paymentRepository.save(payment);
                return payUrl;
            } else {
                throw new BadRequestException("MoMo payment creation failed: " + message);
            }
        } catch (Exception e) {
            log.error("Error calling MoMo Sandbox API for Order {}: {}", orderCode, e.getMessage());
            throw new BadRequestException("Gateway timeout or connection error: " + e.getMessage());
        }
    }

    @Override
    public String createVnpayPayment(Long orderId, String ipAddress) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if ("CANCELLED".equals(order.getStatus())) {
            throw new BadRequestException("Cannot pay for cancelled order");
        }

        PaymentEntity payment = paymentRepository.findByOrder_Id(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order"));

        if ("PAID".equals(payment.getPaymentStatus())) {
            throw new BadRequestException("Order is already paid");
        }

        String orderCode = order.getOrderCode();
        long amount = order.getTotalAmount().multiply(new BigDecimal(100)).setScale(0, BigDecimal.ROUND_HALF_UP).longValue();
        String orderInfo = "Thanh toan don hang Lowlands Coffee " + orderCode;
        String clientIp = (ipAddress == null || ipAddress.isBlank()) ? "127.0.0.1" : ipAddress;

        String createDate = ZonedDateTime.now(ZoneId.of("Etc/GMT-7"))
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", orderCode);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", clientIp);
        vnpParams.put("vnp_CreateDate", createDate);

        // Build query string and hash data
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = vnpParams.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isEmpty()) {
                // Hashing uses alphabetical ordering of URL-encoded fields
                String encodedKey = URLEncoder.encode(key, StandardCharsets.US_ASCII);
                String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII).replace("+", "%20");
                
                hashData.append(key).append("=").append(encodedValue);
                query.append(encodedKey).append("=").append(encodedValue);
                if (itr.hasNext()) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String secureHash = hmacSha512(vnpHashSecret, hashData.toString());
        String paymentUrl = vnpUrl + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;

        payment.setPaymentGateway("VNPAY");
        paymentRepository.save(payment);

        log.info("Generated VNPay Sandbox URL for Order: {}, amount: {}", orderCode, order.getTotalAmount());
        return paymentUrl;
    }

    @Override
    public String handleMomoReturn(Map<String, String> params) {
        log.info("Processing MoMo return callback with params: {}", params);
        boolean isValid = verifyMomoSignature(params);
        String orderCode = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        log.info("MoMo Return validation for Order Code: {}, Signature Verified: {}, resultCode: {}", orderCode, isValid, resultCode);

        if (!isValid) {
            log.error("Invalid MoMo signature for Order Code: {}", orderCode);
            return "http://localhost:3000/payment/result?success=false&orderCode=" + orderCode + "&message=Chữ%20ký%20không%20hợp%20lệ";
        }

        boolean success = "0".equals(resultCode);
        updateOrderAndPayment(orderCode, success, transId, "MOMO");

        return "http://localhost:3000/payment/result?success=" + success + "&orderCode=" + orderCode;
    }

    @Override
    public void handleMomoIpn(Map<String, Object> body) {
        log.info("Processing MoMo IPN callback with body: {}", body);
        
        // Convert Map<String, Object> to Map<String, String> for signature verification
        Map<String, String> params = new HashMap<>();
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            if (entry.getValue() != null) {
                params.put(entry.getKey(), entry.getValue().toString());
            }
        }

        boolean isValid = verifyMomoSignature(params);
        String orderCode = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        log.info("MoMo IPN validation for Order Code: {}, Signature Verified: {}, resultCode: {}", orderCode, isValid, resultCode);

        if (!isValid) {
            log.error("Invalid MoMo IPN signature for Order Code: {}", orderCode);
            throw new BadRequestException("Signature verification failed");
        }

        boolean success = "0".equals(resultCode);
        updateOrderAndPayment(orderCode, success, transId, "MOMO");
    }

    @Override
    public String handleVnpayReturn(Map<String, String> params) {
        log.info("Processing VNPay return callback with params: {}", params);
        boolean isValid = verifyVnpaySignature(params);
        String orderCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        log.info("VNPay Return validation for Order Code: {}, Signature Verified: {}, responseCode: {}", orderCode, isValid, responseCode);

        if (!isValid) {
            log.error("Invalid VNPay signature for Order Code: {}", orderCode);
            return "http://localhost:3000/payment/result?success=false&orderCode=" + orderCode + "&message=Mã%20băm%20bảo%20mật%20không%20hợp%20lệ";
        }

        boolean success = "00".equals(responseCode);
        updateOrderAndPayment(orderCode, success, transactionNo, "VNPAY");

        return "http://localhost:3000/payment/result?success=" + success + "&orderCode=" + orderCode;
    }

    @Override
    public void handleVnpayIpn(Map<String, String> params) {
        log.info("Processing VNPay IPN callback with params: {}", params);
        boolean isValid = verifyVnpaySignature(params);
        String orderCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        log.info("VNPay IPN validation for Order Code: {}, Signature Verified: {}, responseCode: {}", orderCode, isValid, responseCode);

        if (!isValid) {
            log.error("Invalid VNPay IPN signature for Order Code: {}", orderCode);
            throw new BadRequestException("Signature verification failed");
        }

        boolean success = "00".equals(responseCode);
        updateOrderAndPayment(orderCode, success, transactionNo, "VNPAY");
    }

    private void updateOrderAndPayment(String orderCode, boolean success, String transactionId, String gateway) {
        OrderEntity order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderCode));

        PaymentEntity payment = paymentRepository.findByOrder_Id(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order"));

        // Idempotency check: if status is already finalized, skip updates
        if ("PAID".equals(payment.getPaymentStatus())) {
            log.info("Order {} is already Paid, skipping update", orderCode);
            return;
        }

        if (success) {
            payment.setPaymentStatus("PAID");
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId(transactionId);
            payment.setPaymentGateway(gateway);
            
            // Set order status to CONFIRMED
            order.setStatus("CONFIRMED");
            
            log.info("Payment SUCCESS for OrderCode: {}, gateway transaction ID: {}", orderCode, transactionId);
        } else {
            payment.setPaymentStatus("FAILED");
            payment.setPaymentGateway(gateway);
            
            // Cancel order if payment fails
            order.setStatus("CANCELLED");
            
            log.info("Payment FAILED for OrderCode: {}, gateway: {}", orderCode, gateway);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    private boolean verifyMomoSignature(Map<String, String> params) {
        String signature = params.get("signature");
        if (signature == null) return false;

        String amount = params.get("amount");
        String extraData = params.get("extraData");
        if (extraData == null) extraData = "";
        String message = params.get("message");
        String orderId = params.get("orderId");
        String orderInfo = params.get("orderInfo");
        String partnerCode = params.get("partnerCode");
        String requestId = params.get("requestId");
        String responseTime = params.get("responseTime");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        // Format: accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&partnerCode=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                momoAccessKey, amount, extraData, message, orderId, orderInfo, partnerCode, requestId, responseTime, resultCode, transId
        );

        String computed = hmacSha256(rawSignature, momoSecretKey);
        return computed.equalsIgnoreCase(signature);
    }

    private boolean verifyVnpaySignature(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null) return false;

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = sortedParams.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isEmpty()) {
                hashData.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.US_ASCII).replace("+", "%20"));
                if (itr.hasNext()) {
                    hashData.append("&");
                }
            }
        }

        String computed = hmacSha512(vnpHashSecret, hashData.toString());
        return computed.equalsIgnoreCase(secureHash);
    }

    private String hmacSha256(String data, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to compute HmacSHA256 signature", e);
            throw new RuntimeException("HMAC computation error", e);
        }
    }

    private String hmacSha512(String key, String data) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to compute HmacSHA512 signature", e);
            throw new RuntimeException("HMAC computation error", e);
        }
    }
}
