import { buildOrderPrintHtml } from "@/lib/order-print";
import { Order } from "@/types";

const mockOrder: Order = {
  id: 12,
  storeId: 1,
  storeName: "Lowlands Coffee - Default Store",
  orderCode: "LL-260705-0012",
  orderType: "delivery",
  status: "confirmed",
  receiverName: "Nhat Nam",
  receiverPhone: "0900000000",
  deliveryAddress: "1 Nguyen Du, TP. Ho Chi Minh",
  subtotal: 48000,
  discountAmount: 0,
  totalAmount: 48000,
  note: "<script>alert('xss')</script>",
  paymentMethod: "bank_transfer",
  payment: {
    id: 9,
    paymentMethod: "BANKING",
    paymentStatus: "PAID",
    amount: 48000,
    paidAt: "2026-07-05T10:00:00",
  },
  createdAt: "2026-07-05T09:30:00",
  items: [
    {
      productId: 1,
      productVariantId: 10,
      productName: "Bạc Xỉu",
      size: "S",
      unitPrice: 32000,
      quantity: 1,
      totalPrice: 48000,
      toppings: [
        {
          toppingId: 5,
          toppingName: "Cheese Foam",
          unitPrice: 16000,
          quantity: 1,
          totalPrice: 16000,
        },
      ],
    },
  ],
};

describe("order print template", () => {
  it("renders a printable Lowlands invoice with escaped customer content", () => {
    const html = buildOrderPrintHtml(mockOrder, {
      cashierName: "nhatnam26",
      trackingUrl: "http://localhost:3000/vi/track-order?code=LL-260705-0012&phone=0900000000",
      generatedAt: new Date("2026-07-05T10:15:00"),
    });

    expect(html).toContain("Lowlands Coffee &amp; Tea");
    expect(html).toContain("LL-260705-0012");
    expect(html).toContain("Bạc Xỉu");
    expect(html).toContain("48.000 đ");
    expect(html).toContain("Đã xác nhận");
    expect(html).toContain("Đã thanh toán");
    expect(html).toContain("nhatnam26");
    expect(html).toContain("track-order?code=LL-260705-0012&amp;phone=0900000000");
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert");
  });
});
