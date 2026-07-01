import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Store, Product, Category, Promotion, Topping, Order, User } from "@/types";
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
  getAdminToppings,
  createAdminTopping,
  updateAdminTopping,
  deleteAdminTopping,
} from "@/services/product.service";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/user.service";

export interface Employee {
  id: number;
  employeeCode?: string | null;
  fullName: string;
  role: "manager" | "staff";
  branchId?: number;
  branchName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  workingShift?: string;
  performance?: string;
}

export interface CustomerExtended extends User {
  orderCount: number;
  totalSpent: number;
}

export interface OrderExtended extends Order {
  id: number;
  orderCode: string;
  storeName: string;
  status: "pending" | "preparing" | "completed" | "cancelled";
  createdAt: string;
}

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
  toppings: Topping[];
  productCatalogError: string | null;
  employees: Employee[];
  customers: CustomerExtended[];
  orders: OrderExtended[];
  promotions: Promotion[];
  ingredients: Ingredient[];

  hydrateProductCatalog: (source?: "admin" | "public") => Promise<void>;
  hydrateToppings: () => Promise<void>;
  hydrateUsers: () => Promise<void>;

  addBranch: (branch: Omit<Store, "id">) => void;
  updateBranch: (branch: Store) => void;
  deleteBranch: (id: number) => void;

  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  addTopping: (topping: Omit<Topping, "id">) => Promise<void>;
  updateTopping: (topping: Topping) => Promise<void>;
  deleteTopping: (id: number) => Promise<void>;

  addEmployee: (employee: Omit<Employee, "id"> & { password?: string }) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;

  addOrder: (order: Omit<OrderExtended, "id" | "orderCode" | "createdAt">) => OrderExtended;
  updateOrderStatus: (id: number, status: OrderExtended["status"]) => void;

  addPromotion: (promo: Omit<Promotion, "id">) => void;
  updatePromotion: (promo: Promotion) => void;
  deletePromotion: (id: number) => void;

  updateIngredientQty: (id: number, amount: number) => void;
  importStock: (id: number, quantityToAdd: number) => void;
}

const toProductRequest = (product: Omit<Product, "id"> | Product, includeToppings: boolean): ProductRequest => {
  const isUpdate = "id" in product;

  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    status: product.status,
    variants: product.variants?.map((variant) => ({
      id: isUpdate ? variant.id : undefined,
      size: variant.size,
      price: variant.price,
      status: variant.status,
    })) ?? [],
    toppingIds: includeToppings ? product.toppings?.map((topping) => topping.id) : [],
  };
};

const unsupported = (message: string): never => {
  throw new Error(message);
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      branches: [],
      products: [],
      categories: [],
      toppings: [],
      productCatalogError: null,
      employees: [],
      customers: [],
      orders: [],
      promotions: [],
      ingredients: [],

      hydrateProductCatalog: async (source = "public") => {
        if (source === "admin") {
          if (typeof window === "undefined" || !localStorage.getItem("lowlands_token")) {
            return;
          }

          const userStr = localStorage.getItem("lowlands_user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              const userRole = (user.roleName || user.role || "").toUpperCase();
              const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];
              if (!allowedRoles.includes(userRole)) {
                return;
              }
            } catch (error) {
              console.error("Failed to parse user details for catalog validation", error);
            }
          }
        }

        try {
          const userStr = typeof window !== "undefined" ? localStorage.getItem("lowlands_user") : null;
          const userRole = userStr ? (() => {
            try {
              const user = JSON.parse(userStr);
              return (user.roleName || user.role || "").toUpperCase();
            } catch {
              return "";
            }
          })() : "";

          const canReadAdminToppings = ["ADMIN", "MANAGER", "STAFF"].includes(userRole);

          const [products, categories, toppings] = source === "admin"
            ? await Promise.all([getAdminProducts(), getAdminCategories(), getAdminToppings()])
            : await Promise.all([
                getProducts(),
                getCategories(),
                canReadAdminToppings
                  ? getAdminToppings().catch(() => [] as Topping[])
                  : Promise.resolve([] as Topping[])
              ]);
          set({ products, categories, toppings, productCatalogError: null });
        } catch (error) {
          console.error("Failed to hydrate product catalog", error);
          set({
            products: [],
            categories: [],
            toppings: [],
            productCatalogError: "Khong the tai danh muc san pham tu Backend API.",
          });
        }
      },

      hydrateToppings: async () => {
        if (typeof window === "undefined" || !localStorage.getItem("lowlands_token")) {
          return;
        }

        try {
          const toppings = await getAdminToppings();
          set({ toppings, productCatalogError: null });
        } catch (error) {
          console.error("Failed to hydrate toppings", error);
          set({
            toppings: [],
            productCatalogError: "Khong the tai danh sach topping tu Backend API.",
          });
        }
      },

      hydrateUsers: async () => {
        if (typeof window === "undefined" || !localStorage.getItem("lowlands_token")) {
          return;
        }

        const userStr = localStorage.getItem("lowlands_user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const userRole = (user.roleName || user.role || "").toUpperCase();
            const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];
            if (!allowedRoles.includes(userRole)) {
              return;
            }
          } catch (error) {
            console.error("Failed to parse user details for role validation", error);
          }
        }

        try {
          const users = await getUsers();

          const employees: Employee[] = users
            .filter((user) => {
              const role = (user.roleName || user.role || "").toUpperCase();
              return role === "STAFF" || role === "MANAGER";
            })
            .map((user) => {
              const role = (user.roleName || user.role || "").toUpperCase();
              return {
                id: user.id,
                employeeCode: user.employeeCode,
                fullName: user.fullName,
                role: role === "MANAGER" ? "manager" : "staff",
                branchId: user.branchId || 0,
                branchName: user.branchName || "Chua gan",
                email: user.email,
                phone: user.phone || "",
                status: user.status?.toUpperCase() === "ACTIVE" ? "active" : "inactive",
              };
            });

          const customers: CustomerExtended[] = users
            .filter((user) => (user.roleName || user.role || "").toUpperCase() === "CUSTOMER")
            .map((user) => ({
              ...user,
              phone: user.phone || "",
              status: user.status?.toUpperCase() === "ACTIVE" ? "active" : "inactive",
              orderCount: 0,
              totalSpent: 0,
            }));

          set({ employees, customers });
        } catch (error) {
          console.error("Failed to hydrate users", error);
          set({ employees: [], customers: [] });
        }
      },

      addBranch: () => unsupported("Store API phai duoc goi qua store.service.ts."),
      updateBranch: () => unsupported("Store API phai duoc goi qua store.service.ts."),
      deleteBranch: () => unsupported("Store API phai duoc goi qua store.service.ts."),

      addProduct: async (product) => {
        try {
          const created = await createAdminProduct(toProductRequest(product, true));
          set((state) => ({ products: [...state.products, created], productCatalogError: null }));
        } catch (error) {
          console.error("Failed to create product", error);
          set({ productCatalogError: "Khong the tao san pham qua Backend API." });
          throw error;
        }
      },
      updateProduct: async (updated) => {
        try {
          const saved = await updateAdminProduct(updated.id, toProductRequest(updated, true));
          set((state) => ({
            products: state.products.map((product) => (product.id === saved.id ? saved : product)),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to update product", error);
          set({ productCatalogError: "Khong the cap nhat san pham qua Backend API." });
          throw error;
        }
      },
      deleteProduct: async (id) => {
        try {
          await deleteAdminProduct(id);
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to delete product", error);
          set({ productCatalogError: "Khong the xoa san pham qua Backend API." });
          throw error;
        }
      },

      addCategory: async (category) => {
        try {
          const created = await createAdminCategory(category);
          set((state) => ({ categories: [...state.categories, created], productCatalogError: null }));
        } catch (error) {
          console.error("Failed to create category", error);
          set({ productCatalogError: "Khong the tao danh muc qua Backend API." });
          throw error;
        }
      },
      updateCategory: async (updated) => {
        try {
          const saved = await updateAdminCategory(updated.id, updated);
          set((state) => ({
            categories: state.categories.map((category) => (category.id === saved.id ? saved : category)),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to update category", error);
          set({ productCatalogError: "Khong the cap nhat danh muc qua Backend API." });
          throw error;
        }
      },
      deleteCategory: async (id) => {
        try {
          await deleteAdminCategory(id);
          set((state) => ({
            categories: state.categories.filter((category) => category.id !== id),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to delete category", error);
          set({ productCatalogError: "Khong the xoa danh muc qua Backend API." });
          throw error;
        }
      },

      addTopping: async (topping) => {
        try {
          const created = await createAdminTopping(topping);
          set((state) => ({ toppings: [...state.toppings, created], productCatalogError: null }));
        } catch (error) {
          console.error("Failed to create topping", error);
          set({ productCatalogError: "Khong the tao topping qua Backend API." });
          throw error;
        }
      },
      updateTopping: async (updated) => {
        try {
          const saved = await updateAdminTopping(updated.id, updated);
          set((state) => ({
            toppings: state.toppings.map((topping) => (topping.id === saved.id ? saved : topping)),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to update topping", error);
          set({ productCatalogError: "Khong the cap nhat topping qua Backend API." });
          throw error;
        }
      },
      deleteTopping: async (id) => {
        try {
          await deleteAdminTopping(id);
          set((state) => ({
            toppings: state.toppings.filter((topping) => topping.id !== id),
            productCatalogError: null,
          }));
        } catch (error) {
          console.error("Failed to delete topping", error);
          set({ productCatalogError: "Khong the xoa topping qua Backend API." });
          throw error;
        }
      },

      addEmployee: async (employee) => {
        try {
          const roleIdMap: Record<Employee["role"], number> = {
            manager: 2,
            staff: 3,
          };
          await createUser({
            fullName: employee.fullName,
            email: employee.email,
            phone: employee.phone,
            password: employee.password || "Password@123",
            roleId: roleIdMap[employee.role],
            status: employee.status === "active" ? "ACTIVE" : "INACTIVE",
            branchId: employee.branchId || undefined
          });
          await get().hydrateUsers();
        } catch (error) {
          console.error("Failed to create employee", error);
          throw error;
        }
      },
      updateEmployee: async (updated) => {
        try {
          const roleIdMap: Record<Employee["role"], number> = {
            manager: 2,
            staff: 3,
          };
          await updateUser(updated.id, {
            fullName: updated.fullName,
            email: updated.email,
            phone: updated.phone,
            roleId: roleIdMap[updated.role],
            status: updated.status === "active" ? "ACTIVE" : "INACTIVE",
            branchId: updated.branchId || undefined
          });
          await get().hydrateUsers();
        } catch (error) {
          console.error("Failed to update employee", error);
          throw error;
        }
      },
      deleteEmployee: async (id) => {
        try {
          await deleteUser(id);
          await get().hydrateUsers();
        } catch (error) {
          console.error("Failed to delete employee", error);
          throw error;
        }
      },

      addOrder: () => unsupported("Order backend chua trien khai."),
      updateOrderStatus: () => unsupported("Order backend chua trien khai."),

      addPromotion: () => unsupported("Promotion backend chua trien khai."),
      updatePromotion: () => unsupported("Promotion backend chua trien khai."),
      deletePromotion: () => unsupported("Promotion backend chua trien khai."),

      updateIngredientQty: () => unsupported("Inventory phai cap nhat qua backend ledger."),
      importStock: () => unsupported("Nhap kho phai cap nhat qua Goods Receipt API."),
    }),
    {
      name: "lowlands-dashboard-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<DashboardState>),
        branches: currentState.branches,
        products: currentState.products,
        categories: currentState.categories,
        toppings: currentState.toppings,
        employees: currentState.employees,
        customers: currentState.customers,
        orders: currentState.orders,
        promotions: currentState.promotions,
        ingredients: currentState.ingredients,
        productCatalogError: currentState.productCatalogError,
      }),
      onRehydrateStorage: () => (state) => {
        void state?.hydrateProductCatalog("public");
        void state?.hydrateUsers();
      },
      skipHydration: true,
    }
  )
);
