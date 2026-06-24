import { useCartStore } from "@/store/cart.store";
import { Product, ProductVariant, Topping, Promotion } from "@/types";

const mockProduct: Product = {
  id: 1,
  categoryId: 10,
  name: "Cà phê Sữa Đá",
  status: "active",
};

const mockVariantS: ProductVariant = {
  id: 101,
  productId: 1,
  size: "S",
  price: 29000,
  status: "active",
};

const mockToppingPearl: Topping = {
  id: 501,
  name: "Trân châu",
  price: 6000,
  status: "active",
};

describe("Cart Zustand Store", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("should initialize with an empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getSubtotal()).toBe(0);
  });

  it("should add a new product variant to cart", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariantS, 2, []);

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].quantity).toBe(2);
    expect(updatedState.items[0].variant.id).toBe(101);
    expect(updatedState.getSubtotal()).toBe(58000); // 29000 * 2
  });

  it("should increase quantity when adding same variant and toppings", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariantS, 1, []);
    store.addItem(mockProduct, mockVariantS, 2, []);

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].quantity).toBe(3);
    expect(updatedState.getSubtotal()).toBe(87000); // 29000 * 3
  });

  it("should calculate correctly with toppings included", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariantS, 1, [{ topping: mockToppingPearl, quantity: 2 }]);

    const updatedState = useCartStore.getState();
    // 29000 (base S) + 6000 * 2 (toppings) = 41000
    expect(updatedState.getSubtotal()).toBe(41000);
  });

  it("should remove item from cart", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariantS, 1, []);
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().removeItem(itemId);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it("should apply promotion discount correctly", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariantS, 2, []); // Subtotal = 58000

    const mockPromo: Promotion = {
      id: 1,
      code: "DEMO10",
      name: "10% Off",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 40000,
      status: "active",
    };

    store.applyPromotion(mockPromo);
    const updatedState = useCartStore.getState();
    expect(updatedState.getSubtotal()).toBe(58000);
    expect(updatedState.getDiscountAmount()).toBe(5800); // 10% of 58000
    expect(updatedState.getTotalAmount()).toBe(52200); // 58000 - 5800
  });
});
