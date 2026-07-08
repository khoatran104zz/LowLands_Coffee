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
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SandboxPaymentServiceImpl implements SandboxPaymentService {

    private static final Logger log = LoggerFactory.getLogger(SandboxPaymentServiceImpl.class);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;
    private final Environment environment;

    @Value("${MOMO_PARTNER_CODE:}")
    private String momoPartnerCode;

    @Value("${MOMO_ACCESS_KEY:}")
    private String momoAccessKey;

    @Value("${MOMO_SECRET_KEY:}")
    private String momoSecretKey;

    @Value("${MOMO_ENDPOINT:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String momoEndpoint;

    @Value("${MOMO_RETURN_URL:http://localhost:8080/api/v1/payment/momo/return}")
    private String momoReturnUrl;

    @Value("${MOMO_NOTIFY_URL:http://localhost:8080/api/v1/payment/momo/ipn}")
    private String momoNotifyUrl;

    public SandboxPaymentServiceImpl(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            Environment environment
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.environment = environment;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String createMomoPayment(Long orderId) {
        requireMomoConfigured();

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
        long amount = order.getTotalAmount().setScale(0, RoundingMode.HALF_UP).longValue();
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
        requireVnpayConfigured();

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
        long amount = order.getTotalAmount()
                .multiply(new BigDecimal(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
        String orderInfo = "Thanh toan don hang Lowlands Coffee " + orderCode;
        String clientIp = (ipAddress == null || ipAddress.isBlank()) ? "127.0.0.1" : ipAddress.trim();
        if (clientIp.contains(",")) {
            clientIp = clientIp.split(",")[0].trim();
        }
        if (clientIp.equals("0:0:0:0:0:0:0:1") || clientIp.equals("::1")) {
            clientIp = "127.0.0.1";
        }

        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        String createDate = formatVnpayDate(now);
        String expireDate = formatVnpayDate(now.plusMinutes(15));

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", orderCode);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", vnpayLocale());
        vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl());
        vnpParams.put("vnp_IpAddr", clientIp);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        String signedData = buildVnpaySignedData(vnpParams);
        String secureHash = hmacSha512(vnpayHashSecret(), signedData);
        String paymentUrl = vnpayPaymentUrl() + "?" + signedData + "&vnp_SecureHash=" + secureHash;

        payment.setPaymentMethod("BANKING");
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
            return paymentResultUrl(false, orderCode, "Chu ky khong hop le");
        }

        boolean success = "0".equals(resultCode);
        updateOrderAndPayment(orderCode, success, transId, "MOMO");

        return paymentResultUrl(success, orderCode, null);
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
            return paymentResultUrl(false, orderCode, "Ma bam bao mat khong hop le");
        }

        boolean success = "00".equals(responseCode);
        updateOrderAndPayment(orderCode, success, transactionNo, "VNPAY");

        return paymentResultUrl(success, orderCode, null);
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
        requireMomoConfigured();

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
        requireVnpayConfigured();

        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null) return false;

        String signedData = buildVnpaySignedData(params);
        String computed = hmacSha512(vnpayHashSecret(), signedData);
        return computed.equalsIgnoreCase(secureHash);
    }

    String buildVnpaySignedData(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getKey() != null && entry.getKey().startsWith("vnp_"))
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()))
                .filter(entry -> !"vnp_SecureHashType".equals(entry.getKey()))
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> encodeVnpay(entry.getKey()) + "=" + encodeVnpay(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encodeVnpay(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String formatVnpayDate(ZonedDateTime value) {
        return value.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
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

    private void requireMomoConfigured() {
        if (isBlank(momoPartnerCode) || isBlank(momoAccessKey) || isBlank(momoSecretKey)) {
            throw new BadRequestException("MoMo sandbox payment is not configured");
        }
    }

    private void requireVnpayConfigured() {
        if (isBlank(vnpayTmnCode()) || isBlank(vnpayHashSecret())) {
            throw new BadRequestException("VNPay sandbox payment is not configured. Please set VNPAY_TMN_CODE and VNPAY_HASH_SECRET.");
        }
    }

    private String vnpayTmnCode() {
        return firstNonBlank("VNPAY_TMN_CODE", "VNP_TMNCODE");
    }

    private String vnpayHashSecret() {
        return firstNonBlank("VNPAY_HASH_SECRET", "VNP_HASH_SECRET");
    }

    private String vnpayPaymentUrl() {
        return firstNonBlank(
                "VNPAY_PAYMENT_URL",
                "VNP_URL",
                "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
        );
    }

    private String vnpayReturnUrl() {
        return firstNonBlank(
                "VNPAY_RETURN_URL",
                "VNP_RETURN_URL",
                "http://localhost:8080/api/v1/payment/vnpay/return"
        );
    }

    private String vnpayLocale() {
        return firstNonBlank("VNPAY_LOCALE", "vn");
    }

    private String paymentResultUrl(boolean success, String orderCode, String message) {
        String baseUrl = firstNonBlank(
                "FRONTEND_PAYMENT_RESULT_URL",
                "http://localhost:3000/vi/payment/result"
        );
        StringBuilder redirect = new StringBuilder(baseUrl)
                .append(baseUrl.contains("?") ? "&" : "?")
                .append("success=")
                .append(success);
        if (!isBlank(orderCode)) {
            redirect.append("&orderCode=").append(encodeVnpay(orderCode));
        }
        if (!isBlank(message)) {
            redirect.append("&message=").append(encodeVnpay(message));
        }
        return redirect.toString();
    }

    private String firstNonBlank(String... keysOrFallback) {
        for (int i = 0; i < keysOrFallback.length; i++) {
            String key = keysOrFallback[i];
            String value = environment.getProperty(key);
            if (!isBlank(value) && !isPlaceholder(value)) {
                return value.trim();
            }
            if (i == keysOrFallback.length - 1 && !key.contains("_") && !key.contains(".")) {
                return key;
            }
            if (i == keysOrFallback.length - 1 && key.startsWith("http")) {
                return key;
            }
        }
        return "";
    }

    private boolean isPlaceholder(String value) {
        String trimmed = value.trim();
        return trimmed.startsWith("<") && trimmed.endsWith(">");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
