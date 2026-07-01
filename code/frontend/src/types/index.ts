export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  roleId?: number;
  roleName?: string;
  role?: "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER" | string;
  employeeCode?: string | null;
  permissions?: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
  branchId?: number;
  branchName?: string;
}


export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
  toppings?: Topping[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: "S" | "M" | "L";
  price: number;
  status: string;
}

export interface Topping {
  id: number;
  name: string;
  price: number;
  status: string;
}

export interface Promotion {
  id: number;
  code: string;
  name: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minOrderAmount: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  status: string;
}

export interface CartItem {
  id: string; // unique local client-side ID (variantId + sorted toppings IDs)
  product: Product;
  variant: ProductVariant;
  quantity: number;
  note?: string;
  toppings: {
    topping: Topping;
    quantity: number;
  }[];
}

export interface Order {
  id?: number;
  userId?: number;
  storeId: number;
  addressId?: number;
  orderCode?: string;
  orderType: "delivery" | "pickup" | "dine_in" | "takeaway";
  status?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  note?: string;
  items: OrderItemInput[];
  paymentMethod: "cod" | "bank_transfer" | "e_wallet";
  createdAt?: string;
  updatedAt?: string;
  storeName?: string;
  payment?: {
    id: number;
    paymentMethod: string;
    paymentStatus: string;
    amount: number;
    paidAt?: string | null;
    createdAt?: string;
  };
}

export interface OrderItemInput {
  productId: number;
  productVariantId: number;
  productName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  note?: string;
  toppings: OrderItemToppingInput[];
}

export interface OrderItemToppingInput {
  toppingId: number;
  toppingName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}
