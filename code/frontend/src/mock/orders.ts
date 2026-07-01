import { Order } from "@/types";

export interface OrderExtended extends Order {
  id: number;
  orderCode: string;
  storeName: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: string;
}

export const INITIAL_ORDERS: OrderExtended[] = [
  {
    id: 10001,
    storeId: 2,
    storeName: "Lowlands Coffee - Hồ Con Rùa",
    orderCode: "LL-260625-001",
    orderType: "pickup",
    status: "completed",
    receiverName: "Nguyễn Thị Mai",
    receiverPhone: "0912.345.678",
    deliveryAddress: "Tại quầy",
    subtotal: 64000,
    discountAmount: 0,
    totalAmount: 64000,
    paymentMethod: "bank_transfer",
    createdAt: "2026-06-25T08:30:00Z",
    items: [
      {
        productId: 1,
        productVariantId: 102,
        productName: "Phin Sữa Đá",
        size: "M",
        unitPrice: 35000,
        quantity: 1,
        totalPrice: 35000,
        toppings: []
      },
      {
        productId: 2,
        productVariantId: 202,
        productName: "Phin Đen Đá",
        size: "M",
        unitPrice: 29000,
        quantity: 1,
        totalPrice: 29000,
        toppings: []
      }
    ]
  },
  {
    id: 10002,
    storeId: 2,
    storeName: "Lowlands Coffee - Hồ Con Rùa",
    orderCode: "LL-260625-002",
    orderType: "delivery",
    status: "preparing",
    receiverName: "Lê Văn Tiến",
    receiverPhone: "0901.234.567",
    deliveryAddress: "Phòng 1402, Tòa nhà Bitexco, Q1, TP. HCM",
    subtotal: 98000,
    discountAmount: 10000,
    totalAmount: 88000,
    paymentMethod: "e_wallet",
    createdAt: "2026-06-25T09:15:00Z",
    items: [
      {
        productId: 6,
        productVariantId: 602,
        productName: "Trà Sen Vàng",
        size: "M",
        unitPrice: 49000,
        quantity: 2,
        totalPrice: 98000,
        toppings: [
          {
            toppingId: 3,
            toppingName: "Thạch Củ Năng",
            unitPrice: 8000,
            quantity: 1,
            totalPrice: 8000
          }
        ]
      }
    ]
  },
  {
    id: 10003,
    storeId: 3,
    storeName: "Lowlands Coffee - Nhà Thờ Lớn",
    orderCode: "LL-260625-003",
    orderType: "pickup",
    status: "pending",
    receiverName: "Trần Minh Quang",
    receiverPhone: "0983.456.789",
    deliveryAddress: "Tại quầy",
    subtotal: 59000,
    discountAmount: 0,
    totalAmount: 59000,
    paymentMethod: "cod",
    createdAt: "2026-06-25T09:45:00Z",
    items: [
      {
        productId: 9,
        productVariantId: 902,
        productName: "Freeze Trà Xanh",
        size: "M",
        unitPrice: 59000,
        quantity: 1,
        totalPrice: 59000,
        toppings: []
      }
    ]
  },
  {
    id: 10004,
    storeId: 2,
    storeName: "Lowlands Coffee - Hồ Con Rùa",
    orderCode: "LL-260625-004",
    orderType: "pickup",
    status: "completed",
    receiverName: "Khách lẻ tại quầy",
    receiverPhone: "N/A",
    deliveryAddress: "Tại quầy",
    subtotal: 29000,
    discountAmount: 0,
    totalAmount: 29000,
    paymentMethod: "cod",
    createdAt: "2026-06-25T10:00:00Z",
    items: [
      {
        productId: 1,
        productVariantId: 101,
        productName: "Phin Sữa Đá",
        size: "S",
        unitPrice: 29000,
        quantity: 1,
        totalPrice: 29000,
        toppings: []
      }
    ]
  },
  {
    id: 10005,
    storeId: 2,
    storeName: "Lowlands Coffee - Hồ Con Rùa",
    orderCode: "LL-260625-005",
    orderType: "pickup",
    status: "cancelled",
    receiverName: "Trần Ngọc Hùng",
    receiverPhone: "0909.555.444",
    deliveryAddress: "Tại quầy",
    subtotal: 78000,
    discountAmount: 0,
    totalAmount: 78000,
    paymentMethod: "bank_transfer",
    createdAt: "2026-06-25T10:10:00Z",
    items: [
      {
        productId: 7,
        productVariantId: 702,
        productName: "Trà Thạch Đào",
        size: "M",
        unitPrice: 49000,
        quantity: 1,
        totalPrice: 49000,
        toppings: []
      },
      {
        productId: 2,
        productVariantId: 202,
        productName: "Phin Đen Đá",
        size: "M",
        unitPrice: 29000,
        quantity: 1,
        totalPrice: 29000,
        toppings: []
      }
    ]
  }
];
