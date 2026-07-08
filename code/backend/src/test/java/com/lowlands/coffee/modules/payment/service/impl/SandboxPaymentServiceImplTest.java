package com.lowlands.coffee.modules.payment.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.entity.PaymentEntity;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.order.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SandboxPaymentServiceImplTest {

    @Test
    void createVnpayPaymentGeneratesSignedUrlAndMarksPaymentGateway() {
        MockEnvironment environment = vnpayEnvironment();
        OrderEntity order = order(10L, "ORD202607080001", "28100");
        PaymentEntity payment = payment(order);
        OrderRepository orderRepository = orderRepository(order);
        PaymentRepository paymentRepository = paymentRepository(payment);
        SandboxPaymentServiceImpl service = new SandboxPaymentServiceImpl(orderRepository, paymentRepository, environment);

        String paymentUrl = service.createVnpayPayment(10L, "::1");
        Map<String, String> query = queryParams(paymentUrl);

        assertThat(paymentUrl).startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?");
        assertThat(query).containsEntry("vnp_TmnCode", "TESTCODE");
        assertThat(query).containsEntry("vnp_Amount", "2810000");
        assertThat(query).containsEntry("vnp_IpAddr", "127.0.0.1");
        assertThat(query).containsEntry("vnp_ReturnUrl", "http://localhost:8080/api/v1/payment/vnpay/return");
        assertThat(query).containsKeys("vnp_CreateDate", "vnp_ExpireDate", "vnp_SecureHash");
        assertThat(payment.getPaymentMethod()).isEqualTo("BANKING");
        assertThat(payment.getPaymentGateway()).isEqualTo("VNPAY");
    }

    @Test
    void createVnpayPaymentRejectsPlaceholderConfiguration() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("VNPAY_TMN_CODE", "<your-vnpay-tmn-code>")
                .withProperty("VNPAY_HASH_SECRET", "<your-vnpay-hash-secret>");
        SandboxPaymentServiceImpl service = new SandboxPaymentServiceImpl(null, null, environment);

        assertThatThrownBy(() -> service.createVnpayPayment(10L, "127.0.0.1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("VNPAY_TMN_CODE")
                .hasMessageContaining("VNPAY_HASH_SECRET");
    }

    @Test
    void buildVnpaySignedDataSortsAndUrlEncodesVnpayParametersOnly() {
        SandboxPaymentServiceImpl service = new SandboxPaymentServiceImpl(null, null, vnpayEnvironment());
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_TxnRef", "ORD 1");
        params.put("ignore", "value");
        params.put("vnp_SecureHash", "hash");
        params.put("vnp_OrderInfo", "Thanh toan don hang ORD 1");
        params.put("vnp_Amount", "2810000");

        String signedData = service.buildVnpaySignedData(params);

        assertThat(signedData)
                .isEqualTo("vnp_Amount=2810000&vnp_OrderInfo=Thanh+toan+don+hang+ORD+1&vnp_TxnRef=ORD+1");
    }

    private MockEnvironment vnpayEnvironment() {
        return new MockEnvironment()
                .withProperty("VNPAY_TMN_CODE", "TESTCODE")
                .withProperty("VNPAY_HASH_SECRET", "test-secret")
                .withProperty("VNPAY_PAYMENT_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
                .withProperty("VNPAY_RETURN_URL", "http://localhost:8080/api/v1/payment/vnpay/return")
                .withProperty("FRONTEND_PAYMENT_RESULT_URL", "http://localhost:3000/vi/payment/result");
    }

    private OrderEntity order(Long id, String orderCode, String totalAmount) {
        OrderEntity order = new OrderEntity();
        order.setId(id);
        order.setOrderCode(orderCode);
        order.setStatus("PENDING");
        order.setTotalAmount(new BigDecimal(totalAmount));
        return order;
    }

    private PaymentEntity payment(OrderEntity order) {
        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setPaymentMethod("BANKING");
        payment.setPaymentStatus("UNPAID");
        payment.setAmount(order.getTotalAmount());
        return payment;
    }

    private OrderRepository orderRepository(OrderEntity order) {
        return (OrderRepository) Proxy.newProxyInstance(
                OrderRepository.class.getClassLoader(),
                new Class<?>[]{OrderRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.of(order);
                    case "toString" -> "OrderRepositoryProxy";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private PaymentRepository paymentRepository(PaymentEntity payment) {
        return (PaymentRepository) Proxy.newProxyInstance(
                PaymentRepository.class.getClassLoader(),
                new Class<?>[]{PaymentRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByOrder_Id" -> Optional.of(payment);
                    case "save" -> args[0];
                    case "toString" -> "PaymentRepositoryProxy";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private Map<String, String> queryParams(String url) {
        String query = url.substring(url.indexOf('?') + 1);
        Map<String, String> params = new LinkedHashMap<>();
        for (String pair : query.split("&")) {
            String[] keyValue = pair.split("=", 2);
            String value = keyValue.length > 1 ? keyValue[1] : "";
            params.put(
                    URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8),
                    URLDecoder.decode(value, StandardCharsets.UTF_8)
            );
        }
        return params;
    }
}
