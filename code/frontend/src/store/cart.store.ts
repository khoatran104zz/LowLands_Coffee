import { create } from "zustand";
import { CartItem, Product, ProductVariant, Topping, Promotion } from "@/types";

interface CartState {
  items: CartItem[];
  appliedPromotion: Promotion | null;
  appliedDiscountAmount: number;
  orderType: "delivery" | "pickup";
  selectedStoreId: number | null;
  
  // Actions
  addItem: (
    product: Product,
    variant: ProductVariant,
    quantity: number,
    toppings: { topping: Topping; quantity: number }[],
    note?: string
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  applyPromotion: (promo: Promotion | null, discountAmount?: number) => void;
  setAppliedDiscountAmount: (amount: number) => void;
  setOrderType: (type: "delivery" | "pickup") => void;
  setSelectedStoreId: (storeId: number | null) => void;
  clearCart: () => void;

  // Calculators
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotalAmount: () => number;
}

// Helper to generate a unique ID for cart items based on product variant and toppings selection
const generateCartItemId = (
  variantId: number,
  toppings: { topping: Topping; quantity: number }[]
): string => {
  const toppingParts = toppings
    .filter((t) => t.quantity > 0)
    .sort((a, b) => a.topping.id - b.topping.id)
    .map((t) => `${t.topping.id}_${t.quantity}`)
    .join("-");
  return `${variantId}-${toppingParts}`;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  appliedPromotion: null,
  appliedDiscountAmount: 0,
  orderType: "delivery",
  selectedStoreId: null,

  addItem: (product, variant, quantity, toppings, note) => {
    const itemId = generateCartItemId(variant.id, toppings);
    
    set((state) => {
      const existingItemIndex = state.items.findIndex((item) => item.id === itemId);
      
      const newItems = [...state.items];
      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          note: note !== undefined ? note : newItems[existingItemIndex].note,
        };
      } else {
        // Add new item
        newItems.push({
          id: itemId,
          product,
          variant,
          quantity,
          toppings,
          note,
        });
      }
      return { items: newItems };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  applyPromotion: (promo, discountAmount) => {
    if (!promo) {
      set({ appliedPromotion: null, appliedDiscountAmount: 0 });
      return;
    }
    
    if (discountAmount !== undefined) {
      set({ appliedPromotion: promo, appliedDiscountAmount: discountAmount });
      return;
    }
    
    // Fallback client-side calculation if discountAmount is not provided
    const subtotal = get().getSubtotal();
    let calculatedDiscount = 0;
    if (subtotal >= Number(promo.minimumOrderValue || 0)) {
      if (promo.discountType === "Percentage") {
        const discount = (subtotal * Number(promo.discountValue)) / 100;
        calculatedDiscount = promo.maximumDiscount 
          ? Math.min(discount, Number(promo.maximumDiscount), subtotal)
          : Math.min(discount, subtotal);
      } else {
        calculatedDiscount = Math.min(Number(promo.discountValue), subtotal);
      }
    }
    set({ appliedPromotion: promo, appliedDiscountAmount: calculatedDiscount });
  },

  setAppliedDiscountAmount: (amount) => {
    set({ appliedDiscountAmount: amount });
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  setSelectedStoreId: (storeId) => {
    set({ selectedStoreId: storeId });
  },

  clearCart: () => {
    set({ items: [], appliedPromotion: null, appliedDiscountAmount: 0 });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const variantPrice = Number(item.variant.price);
      const toppingsPrice = item.toppings.reduce(
        (sum, t) => sum + Number(t.topping.price) * t.quantity,
        0
      );
      return total + (variantPrice + toppingsPrice) * item.quantity;
    }, 0);
  },

  getDiscountAmount: () => {
    return get().appliedDiscountAmount;
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal - discount);
  },
}));
