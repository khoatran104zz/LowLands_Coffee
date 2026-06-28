import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Store, Product, Category, Promotion } from "@/types";
import { INITIAL_BRANCHES } from "@/mock/branches";
import { INITIAL_EMPLOYEES, Employee } from "@/mock/employees";
import { INITIAL_CUSTOMERS, CustomerExtended } from "@/mock/customers";
import { INITIAL_ORDERS, OrderExtended } from "@/mock/orders";
import {
  ProductRequest,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  getCategories,
  getProducts,
  updateAdminCategory,
  updateAdminProduct,
} from "@/services/product.service";

export interface Ingredient {
  id: number;
  storeId?: number;
  name: string;
  quantity: number;
  unit: string;
  minAlertLevel: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface DashboardState {
  branches: Store[];
  products: Product[];
  categories: Category[];
  productCatalogError: string | null;
  employees: Employee[];
  customers: CustomerExtended[];
  orders: OrderExtended[];
  promotions: Promotion[];
  ingredients: Ingredient[];
  
  // Actions
  hydrateProductCatalog: (source?: "admin" | "public") => Promise<void>;

  // Branches
  addBranch: (branch: Omit<Store, "id">) => void;
  updateBranch: (branch: Store) => void;
  deleteBranch: (id: number) => void;
  
  // Products
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  
  // Categories
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  
  // Employees
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: number) => void;
  
  // Orders
  addOrder: (order: Omit<OrderExtended, "id" | "orderCode" | "createdAt">) => OrderExtended;
  updateOrderStatus: (id: number, status: OrderExtended["status"]) => void;
  
  // Promotions
  addPromotion: (promo: Omit<Promotion, "id">) => void;
  updatePromotion: (promo: Promotion) => void;
  deletePromotion: (id: number) => void;
  
  // Inventory
  updateIngredientQty: (id: number, amount: number) => void;
  importStock: (id: number, quantityToAdd: number) => void;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 1, name: "Hạt cà phê Robusta", quantity: 4.5, unit: "kg", minAlertLevel: 5.0, status: "low_stock" },
  { id: 2, name: "Hạt cà phê Arabica", quantity: 12.0, unit: "kg", minAlertLevel: 4.0, status: "in_stock" },
  { id: 3, name: "Sữa đặc Vinamilk Ngôi Sao Phương Nam", quantity: 3, unit: "lon", minAlertLevel: 10, status: "low_stock" },
  { id: 4, name: "Sữa tươi Đà Lạt Milk 950ml", quantity: 15, unit: "hộp", minAlertLevel: 5, status: "in_stock" },
  { id: 5, name: "Trà Ô Long Cao Nguyên", quantity: 8.5, unit: "kg", minAlertLevel: 3.0, status: "in_stock" },
  { id: 6, name: "Hạt sen ngâm syrup", quantity: 0, unit: "lon", minAlertLevel: 4, status: "out_of_stock" },
  { id: 7, name: "Đào miếng ngâm xốt", quantity: 18, unit: "lon", minAlertLevel: 6, status: "in_stock" },
  { id: 8, name: "Bột Trà Xanh Uji Matcha", quantity: 0.8, unit: "kg", minAlertLevel: 1.0, status: "low_stock" },
  { id: 9, name: "Kem béo thực vật Rich's lùn", quantity: 7, unit: "hộp", minAlertLevel: 4, status: "in_stock" },
  { id: 10, name: "Bánh mì que đông lạnh", quantity: 45, unit: "cái", minAlertLevel: 20, status: "in_stock" }
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    code: "LOWLANDS50",
    name: "Giảm 50% cho đơn hàng đầu tiên",
    discountType: "percentage",
    discountValue: 50,
    minOrderAmount: 0,
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-12-31"
  },
  {
    id: 2,
    code: "COFFEELOVER",
    name: "Giảm 20.000đ cho đơn hàng từ 100.000đ",
    discountType: "fixed_amount",
    discountValue: 20000,
    minOrderAmount: 100000,
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-08-30"
  },
  {
    id: 3,
    code: "FREETOPPING",
    name: "Tặng topping miễn phí",
    discountType: "fixed_amount",
    discountValue: 8000,
    minOrderAmount: 50000,
    status: "inactive",
    startDate: "2026-01-01",
    endDate: "2026-05-01"
  }
];

const getIngredientStatus = (qty: number, min: number): Ingredient["status"] => {
  if (qty <= 0) return "out_of_stock";
  if (qty <= min) return "low_stock";
  return "in_stock";
};

const toProductRequest = (product: Omit<Product, "id"> | Product, includeToppings: boolean): ProductRequest => ({
  categoryId: product.categoryId,
  name: product.name,
  description: product.description,
  imageUrl: product.imageUrl,
  status: product.status,
  variants: product.variants?.map((variant) => ({
    id: variant.id,
    size: variant.size,
    price: variant.price,
    status: variant.status,
  })) ?? [],
  toppingIds: includeToppings ? product.toppings?.map((topping) => topping.id) : [],
});

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      branches: INITIAL_BRANCHES,
      products: [],
      categories: [],
      productCatalogError: null,
      employees: INITIAL_EMPLOYEES,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      promotions: INITIAL_PROMOTIONS,
      ingredients: INITIAL_INGREDIENTS,

      hydrateProductCatalog: async (source = "public") => {
        try {
          const [products, categories] = source === "admin"
            ? await Promise.all([getAdminProducts(), getAdminCategories()])
            : await Promise.all([getProducts(), getCategories()]);
          set({ products, categories, productCatalogError: null });
        } catch (error) {
          console.error("Failed to hydrate product catalog", error);
          set({
            products: [],
            categories: [],
            productCatalogError: "Không thể tải danh mục sản phẩm từ Backend API.",
          });
        }
      },

      // Branches CRUD
      addBranch: (branch) => set((state) => ({
        branches: [...state.branches, { ...branch, id: Math.max(...state.branches.map(b => b.id), 0) + 1 }]
      })),
      updateBranch: (updated) => set((state) => ({
        branches: state.branches.map((b) => (b.id === updated.id ? updated : b))
      })),
      deleteBranch: (id) => set((state) => ({
        branches: state.branches.filter((b) => b.id !== id)
      })),

      // Products CRUD
      addProduct: async (product) => {
        try {
          const created = await createAdminProduct(toProductRequest(product, false));
          set((state) => ({ products: [...state.products, created], productCatalogError: null }));
        } catch (error) {
          console.error("Failed to create product", error);
          set({ productCatalogError: "Không thể tạo sản phẩm qua Backend API." });
        }
      },
      updateProduct: async (updated) => {
        try {
          const saved = await updateAdminProduct(updated.id, toProductRequest(updated, true));
          set((state) => ({
            products: state.products.map((p) => (p.id === saved.id ? saved : p)),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to update product", error);
          set({ productCatalogError: "Không thể cập nhật sản phẩm qua Backend API." });
        }
      },
      deleteProduct: async (id) => {
        try {
          await deleteAdminProduct(id);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to delete product", error);
          set({ productCatalogError: "Không thể xóa sản phẩm qua Backend API." });
        }
      },

      // Categories CRUD
      addCategory: async (category) => {
        try {
          const created = await createAdminCategory(category);
          set((state) => ({ categories: [...state.categories, created], productCatalogError: null }));
        } catch (error) {
          console.error("Failed to create category", error);
          set({ productCatalogError: "Không thể tạo danh mục qua Backend API." });
        }
      },
      updateCategory: async (updated) => {
        try {
          const saved = await updateAdminCategory(updated.id, updated);
          set((state) => ({
            categories: state.categories.map((c) => (c.id === saved.id ? saved : c)),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to update category", error);
          set({ productCatalogError: "Không thể cập nhật danh mục qua Backend API." });
        }
      },
      deleteCategory: async (id) => {
        try {
          await deleteAdminCategory(id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to delete category", error);
          set({ productCatalogError: "Không thể xóa danh mục qua Backend API." });
        }
      },

      // Employees CRUD
      addEmployee: (employee) => set((state) => {
        const nextId = Math.max(...state.employees.map(e => e.id), 0) + 1;
        const branchName = state.branches.find(b => b.id === employee.branchId)?.name || "Chi nhánh khác";
        return {
          employees: [...state.employees, { ...employee, id: nextId, branchName }]
        };
      }),
      updateEmployee: (updated) => set((state) => {
        const branchName = state.branches.find(b => b.id === updated.branchId)?.name || updated.branchName;
        return {
          employees: state.employees.map((e) => (e.id === updated.id ? { ...updated, branchName } : e))
        };
      }),
      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter((e) => e.id !== id)
      })),

      // Orders Operations
      addOrder: (orderInput) => {
        const state = get();
        const nextId = Math.max(...state.orders.map(o => o.id), 0) + 1;
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const codeNum = String(nextId % 1000).padStart(3, "0");
        const orderCode = `LL-${dateStr}-${codeNum}`;
        const storeName = state.branches.find(b => b.id === orderInput.storeId)?.name || "Lowlands Coffee";
        const newOrder: OrderExtended = {
          ...orderInput,
          id: nextId,
          orderCode,
          storeName,
          status: "pending",
          createdAt: new Date().toISOString()
        };

        // Update statistics for customers
        let updatedCustomers = [...state.customers];
        if (orderInput.receiverPhone && orderInput.receiverPhone !== "N/A") {
          const custIdx = updatedCustomers.findIndex(c => c.phone === orderInput.receiverPhone);
          if (custIdx !== -1) {
            updatedCustomers[custIdx] = {
              ...updatedCustomers[custIdx],
              orderCount: updatedCustomers[custIdx].orderCount + 1,
              totalSpent: updatedCustomers[custIdx].totalSpent + orderInput.totalAmount
            };
          } else {
            updatedCustomers.push({
              id: Math.max(...updatedCustomers.map(c => c.id), 0) + 1,
              fullName: orderInput.receiverName,
              email: orderInput.receiverName.toLowerCase().replace(/\s+/g, "") + "@gmail.com",
              phone: orderInput.receiverPhone,
              status: "active",
              orderCount: 1,
              totalSpent: orderInput.totalAmount
            });
          }
        }

        set({
          orders: [newOrder, ...state.orders],
          customers: updatedCustomers
        });

        return newOrder;
      },
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o))
      })),

      // Promotions CRUD
      addPromotion: (promo) => set((state) => ({
        promotions: [...state.promotions, { ...promo, id: Math.max(...state.promotions.map(p => p.id), 0) + 1 }]
      })),
      updatePromotion: (updated) => set((state) => ({
        promotions: state.promotions.map((p) => (p.id === updated.id ? updated : p))
      })),
      deletePromotion: (id) => set((state) => ({
        promotions: state.promotions.filter((p) => p.id !== id)
      })),

      // Inventory
      updateIngredientQty: (id, amount) => set((state) => ({
        ingredients: state.ingredients.map((ing) => {
          if (ing.id === id) {
            const nextQty = Math.max(0, ing.quantity + amount);
            return {
              ...ing,
              quantity: parseFloat(nextQty.toFixed(2)),
              status: getIngredientStatus(nextQty, ing.minAlertLevel)
            };
          }
          return ing;
        })
      })),
      importStock: (id, qty) => set((state) => ({
        ingredients: state.ingredients.map((ing) => {
          if (ing.id === id) {
            const nextQty = ing.quantity + qty;
            return {
              ...ing,
              quantity: parseFloat(nextQty.toFixed(2)),
              status: getIngredientStatus(nextQty, ing.minAlertLevel)
            };
          }
          return ing;
        })
      }))
    }),
    {
      name: "lowlands-dashboard-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<DashboardState>),
        products: currentState.products,
        categories: currentState.categories,
        productCatalogError: currentState.productCatalogError,
      }),
      onRehydrateStorage: () => (state) => {
        void state?.hydrateProductCatalog("public");
      },
    }
  )
);
