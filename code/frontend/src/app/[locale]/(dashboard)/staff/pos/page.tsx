"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Coffee, History, Printer, CheckCircle, Bell,
  CupSoda, Cake, Salad, Ticket, Users, BarChart2, Settings, Grid, List, ArrowUpDown,
  ClipboardList, Clock, XCircle, ChefHat, PackageCheck,
  User, Truck, CreditCard, Tag, Store
} from "lucide-react";
import { Product, ProductVariant, Topping, CartItem, Order, Promotion } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { ProductCard } from "@/components/pos/ProductCard";
import { POSCart } from "@/components/pos/POSCart";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { getProfile } from "@/services/auth.service";
import { useRouter, useParams } from "next/navigation";
import { AccountDropdown } from "@/components/account/AccountDropdown";
import { AccountModal } from "@/components/account/AccountModal";
import { LanguageSwitcher } from "@/components/features/layout/LanguageSwitcher";
import { cancelOrder, completeOrder, confirmOrder, getOrders, prepareOrder, readyOrder } from "@/services/order.service";
import { getStaffProductAvailability, ProductAvailability } from "@/services/product.service";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { buildOrderTrackingUrl, printOrderAsPdf } from "@/lib/order-print";
import { getActivePromotions } from "@/services/promotion.service";

interface ReceiptData extends Order {
  cashReceived?: number;
  changeReturned?: number;
  vat?: number;
  serviceType?: "dine_in" | "takeaway";
  tableNumber?: string;
}

type ReceiptItem = Order["items"][number];
type ReceiptTopping = ReceiptItem["toppings"][number];
type OnlineOrderAction = "confirm" | "prepare" | "ready" | "complete" | "cancel";

const getOptimisticOnlineOrderStatus = (action: OnlineOrderAction) => {
  if (action === "confirm") return "confirmed";
  if (action === "prepare") return "preparing";
  if (action === "ready") return "ready";
  if (action === "complete") return "completed";
  return "cancelled";
};

const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
    osc.frequency.setValueAtTime(880, context.currentTime + 0.15); // A5 note
    
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.4);
  } catch (e) {
    console.error("Failed to play notification sound", e);
  }
};

export default function StaffPOSPage() {
  const { t } = useTranslation();
  const getCategoryName = useCallback((name: string) => {
    switch (name.toLowerCase()) {
      case "coffee":
      case "cà phê":
        return t("common.coffee");
      case "tea":
      case "trà":
        return t("common.tea");
      case "freeze":
        return t("common.freeze");
      case "other":
      case "khác":
        return t("common.other");
      default:
        return name;
    }
  }, [t]);

  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  // Account settings states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [defaultAccountTab, setDefaultAccountTab] = useState("profile");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const branchId = user?.branchId;

  const handleOpenAccountSettings = (tab: string = "profile") => {
    setDefaultAccountTab(tab);
    setIsAccountOpen(true);
  };

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: t("common.confirmLogoutTitle"),
      message: t("common.confirmLogoutMessage"),
      confirmText: t("common.logout"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      logout();
      router.push(`/${locale}/portal/login`);
    }
  };

  // Store data
  const products = useDashboardStore((state) => state.products);
  const categories = useDashboardStore((state) => state.categories);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [hasInitializedCategory, setHasInitializedCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"menu" | "history">("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [isLoadingTodayOrders, setIsLoadingTodayOrders] = useState(false);
  const [selectedIncomingOrder, setSelectedIncomingOrder] = useState<Order | null>(null);
  const [updatingOnlineOrderIds, setUpdatingOnlineOrderIds] = useState<Set<number>>(new Set());
  
  // Active promotions state for POS
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);

  // Checkout success modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"default" | "name" | "price-asc" | "price-desc">("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [availabilityByVariantId, setAvailabilityByVariantId] = useState<Record<number, ProductAvailability>>({});
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const prevPendingRef = useRef<number | null>(null);

  // Fetch promotions
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const data = await getActivePromotions();
        setActivePromotions(data || []);
      } catch (err) {
        console.error("Failed to load promotions for POS", err);
      }
    };
    void fetchPromos();
  }, []);

  const loadTodayOrders = useCallback(async (silent = false) => {
    if (!branchId) return;
    if (!silent) {
      setIsLoadingTodayOrders(true);
    }
    try {
      const fetched = await getOrders({ storeId: branchId, page: 0, size: 100 });
      const todayStr = new Date().toISOString().slice(0, 10);
      const filtered = fetched.filter(
        (ord) => ord.createdAt && ord.createdAt.startsWith(todayStr)
      );
      setTodayOrders(filtered);

      const pendingCount = filtered.filter(
        (ord) =>
          ord.status === "pending" &&
          (ord.orderType === "delivery" || ord.orderType === "pickup")
      ).length;

      if (prevPendingRef.current !== null && pendingCount > prevPendingRef.current) {
        toast.info("Có đơn hàng trực tuyến mới cần xử lý!", {
          description: `Bạn có ${pendingCount} đơn hàng chờ xác nhận.`,
          duration: 8000,
        });
        playNotificationSound();
      }
      prevPendingRef.current = pendingCount;
    } catch (error) {
      console.error("Failed to load today's orders", error);
    } finally {
      if (!silent) {
        setIsLoadingTodayOrders(false);
      }
    }
  }, [branchId]);

  const loadProductAvailability = useCallback(async () => {
    if (!branchId) return;
    const availability = await getStaffProductAvailability(branchId);
    setAvailabilityByVariantId(
      availability.reduce<Record<number, ProductAvailability>>((acc, item) => {
        acc[item.variantId] = item;
        return acc;
      }, {})
    );
  }, [branchId]);

  useEffect(() => {
    if (isMounted && branchId) {
      const initialLoadId = window.setTimeout(() => {
        void loadTodayOrders();
      }, 0);
      const intervalId = window.setInterval(() => {
        void loadTodayOrders(true);
      }, 5000);
      return () => {
        window.clearTimeout(initialLoadId);
        window.clearInterval(intervalId);
      };
    }
  }, [branchId, isMounted, loadTodayOrders]);

  useEffect(() => {
    if (!isMounted || !hasHydrated || !isAuthenticated || !branchId) {
      return;
    }

    void loadProductAvailability()
      .catch((error) => {
        console.error("Failed to load product availability", error);
        toast.error("Không thể tải trạng thái nguyên liệu sản phẩm.");
      });
  }, [branchId, hasHydrated, isAuthenticated, isMounted, loadProductAvailability]);

  useEffect(() => {
    hydrateFromStorage();
    if (!useDashboardStore.persist.hasHydrated()) {
      void useDashboardStore.persist.rehydrate();
    }
    const mountedTimer = window.setTimeout(() => setIsMounted(true), 0);
    void hydrateProductCatalog("public");
    return () => window.clearTimeout(mountedTimer);
  }, [hydrateFromStorage, hydrateProductCatalog]);

  useEffect(() => {
    if (!isMounted || !hasHydrated) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.push(`/${locale}/portal/login`);
      return;
    }
    const roleUpper = user.roleName?.toUpperCase();
    if (roleUpper !== "STAFF" && roleUpper !== "ADMIN" && roleUpper !== "MANAGER") {
      toast.error("Tài khoản không có quyền truy cập màn hình POS!");
      router.push(`/${locale}/portal/login`);
    }
  }, [isMounted, hasHydrated, isAuthenticated, user, router, locale]);

  useEffect(() => {
    if (!isMounted || !hasHydrated || !isAuthenticated) {
      return;
    }

    void getProfile()
      .then((profile) => {
        updateUser(profile);
      })
      .catch((error) => {
        console.warn("Failed to refresh POS user profile", error);
      });
  }, [isMounted, hasHydrated, isAuthenticated, updateUser]);

  useEffect(() => {
    if (categories.length > 0 && !hasInitializedCategory) {
      const initializeId = window.setTimeout(() => {
        setSelectedCategoryId(null);
        setHasInitializedCategory(true);
      }, 0);
      return () => window.clearTimeout(initializeId);
    }
  }, [categories, hasInitializedCategory]);

  // Keyboard listeners for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Prevent default browser escape behavior if needed
        window.dispatchEvent(new CustomEvent("pos-escape-pressed"));
        // Close local receipt modal as well
        setIsReceiptOpen(false);
      }
      
      if (e.key === "Enter") {
        // Only trigger Enter shortcut when not focused on an input or textarea
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("pos-enter-pressed"));
      }

      // Ctrl + K shortcut to focus search input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close notifications dropdown & sort dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

  const getStatusLabel = (status?: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "pending") return "Chờ xác nhận";
    if (normalized === "confirmed") return "Đã xác nhận";
    if (normalized === "preparing") return "Đang pha chế";
    if (normalized === "ready") return "Sẵn sàng";
    if (normalized === "completed") return "Hoàn tất";
    if (normalized === "cancelled") return "Đã hủy";
    return status || "Chờ xác nhận";
  };

  const getOrderTypeLabel = (orderType: Order["orderType"]) => {
    if (orderType === "delivery") return "Giao hàng";
    if (orderType === "pickup") return "Khách đến nhận";
    if (orderType === "dine_in") return "Ăn tại bàn";
    return "Mang đi";
  };

  const pendingOnlineOrders = useMemo(
    () =>
      todayOrders.filter(
        (order) =>
          order.status === "pending" &&
          (order.orderType === "delivery" || order.orderType === "pickup")
      ),
    [todayOrders]
  );

  const notifications = useMemo(
    () =>
      pendingOnlineOrders.slice(0, 8).map((order) => ({
        id: order.id ?? order.orderCode,
        title: `Đơn mới ${order.orderCode || `#${order.id}`}`,
        time: order.createdAt
          ? new Date(order.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        desc: `${order.receiverName || "Khách"} - ${getOrderTypeLabel(order.orderType)} - ${formatCurrency(order.totalAmount)}`,
        order,
      })),
    [pendingOnlineOrders]
  );

  useEffect(() => {
    if (!selectedIncomingOrder?.id) return;
    const syncId = window.setTimeout(() => {
      const latest = todayOrders.find((order) => order.id === selectedIncomingOrder.id);
      if (latest) {
        setSelectedIncomingOrder(latest);
      }
    }, 0);
    return () => window.clearTimeout(syncId);
  }, [selectedIncomingOrder?.id, todayOrders]);

  const updateOnlineOrderStatus = async (order: Order, action: OnlineOrderAction) => {
    if (!order.id) return;

    if (action === "cancel") {
      const accepted = await confirm({
        title: "Hủy đơn online",
        message: `Bạn có chắc chắn muốn hủy đơn ${order.orderCode || `#${order.id}`}?`,
        confirmText: "Hủy đơn",
        cancelText: t("common.cancel"),
        variant: "danger",
      });
      if (!accepted) return;
    }

    const optimisticOrder: Order = {
      ...order,
      status: getOptimisticOnlineOrderStatus(action),
      updatedAt: new Date().toISOString(),
    };

    setUpdatingOnlineOrderIds((current) => {
      const next = new Set(current);
      next.add(order.id as number);
      return next;
    });
    setTodayOrders((current) =>
      current.map((item) => (item.id === order.id ? optimisticOrder : item))
    );
    setSelectedIncomingOrder((current) => (current?.id === order.id ? optimisticOrder : current));

    try {
      let updatedOrder: Order = order;
      if (action === "confirm") updatedOrder = await confirmOrder(order.id);
      if (action === "prepare") updatedOrder = await prepareOrder(order.id);
      if (action === "ready") updatedOrder = await readyOrder(order.id);
      if (action === "complete") updatedOrder = await completeOrder(order.id);
      if (action === "cancel") updatedOrder = await cancelOrder(order.id, "Staff cancelled online order");

      setTodayOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
      );
      setSelectedIncomingOrder(updatedOrder);
      toast.success(`Đơn ${updatedOrder.orderCode || `#${updatedOrder.id}`} đã chuyển sang: ${getStatusLabel(updatedOrder.status)}`);
      void loadTodayOrders(true);
      if (action === "complete") {
        void loadProductAvailability();
      }
    } catch (error) {
      console.error("Failed to update online order status", error);
      setTodayOrders((current) =>
        current.map((item) => (item.id === order.id ? order : item))
      );
      setSelectedIncomingOrder((current) => (current?.id === order.id ? order : current));
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingOnlineOrderIds((current) => {
        const next = new Set(current);
        next.delete(order.id as number);
        return next;
      });
    }
  };

  const renderOrderActions = (order: Order, compact = false) => {
    const sizeClass = compact ? "h-7 px-2 text-[10px]" : "h-9 px-3 text-xs";
    const isOrderUpdating = order.id ? updatingOnlineOrderIds.has(order.id) : false;
    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {order.status === "pending" && (
          <Button
            type="button"
            disabled={isOrderUpdating}
            onClick={() => updateOnlineOrderStatus(order, "confirm")}
            className={`${sizeClass} bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold`}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Xác nhận
          </Button>
        )}
        {order.status === "confirmed" && (
          <Button
            type="button"
            disabled={isOrderUpdating}
            onClick={() => updateOnlineOrderStatus(order, "prepare")}
            className={`${sizeClass} bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold`}
          >
            <ChefHat className="h-3.5 w-3.5 mr-1" />
            Pha chế
          </Button>
        )}
        {order.status === "preparing" && (
          <Button
            type="button"
            disabled={isOrderUpdating}
            onClick={() => updateOnlineOrderStatus(order, "ready")}
            className={`${sizeClass} bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold`}
          >
            <PackageCheck className="h-3.5 w-3.5 mr-1" />
            Sẵn sàng
          </Button>
        )}
        {order.status === "ready" && (
          <Button
            type="button"
            disabled={isOrderUpdating}
            onClick={() => updateOnlineOrderStatus(order, "complete")}
            className={`${sizeClass} bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold`}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Hoàn tất
          </Button>
        )}
        {order.status && !["completed", "cancelled"].includes(order.status) && (
          <Button
            type="button"
            disabled={isOrderUpdating}
            variant="outline"
            onClick={() => updateOnlineOrderStatus(order, "cancel")}
            className={`${sizeClass} border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-bold`}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Hủy
          </Button>
        )}
      </div>
    );
  };

  // Show full screen loading state before layout mounts or if user is unauthorized
  const userRole = user?.roleName?.toUpperCase();
  const hasAccess = isAuthenticated && user && (userRole === "STAFF" || userRole === "ADMIN" || userRole === "MANAGER");

  if (!isMounted || !hasHydrated || !hasAccess) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-amber-500 font-sans select-none">
        <svg className="h-8 w-8 animate-spin text-amber-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Đang xác thực quyền truy cập POS...</span>
      </div>
    );
  }

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  // Filter products by selected category and search query, then sort
  const sortedAndFilteredProducts = [...products]
    .filter((p) => {
      const matchesCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.trim().toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "vi");
      }
      if (sortBy === "price-asc") {
        const priceA = a.variants?.[0]?.price || 0;
        const priceB = b.variants?.[0]?.price || 0;
        return priceA - priceB;
      }
      if (sortBy === "price-desc") {
        const priceA = a.variants?.[0]?.price || 0;
        const priceB = b.variants?.[0]?.price || 0;
        return priceB - priceA;
      }
      return 0; // Default sorting (no change)
    });


  // Cart operations
  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    selectedToppings: Topping[],
    note: string
  ) => {
    // Generate unique ID based on variant + toppings sorted IDs
    const toppingIds = selectedToppings.map(t => t.id).sort().join(",");
    const cartItemId = `${variant.id}-${toppingIds}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        toast.success(`Đã thêm tiếp 1 ${product.name} vào giỏ hàng!`);
        return updated;
      }

      const toppingsInput = selectedToppings.map((t) => ({
        topping: t,
        quantity: 1
      }));

      toast.success(`Đã thêm ${product.name} (Size ${variant.size}) vào giỏ hàng!`);
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          variant,
          quantity: 1,
          note,
          toppings: toppingsInput
        }
      ];
    });
  };

  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckoutSuccess = (savedOrder: ReceiptData) => {
    setReceiptData(savedOrder);
    setIsReceiptOpen(true);
    setCart([]);
    void loadTodayOrders();
    void loadProductAvailability();
  };

  const handlePrintOrder = (order: Order) => {
    const opened = printOrderAsPdf(order, {
      cashierName: user?.fullName,
      storeName: user?.branchName || order.storeName,
      trackingUrl: buildOrderTrackingUrl(order, locale),
    });

    if (opened) {
      toast.success("Đã mở mẫu in. Chọn Save as PDF để lưu hóa đơn.");
      return;
    }

    toast.error("Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  };

  const activeCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || t("common.menu");

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-2rem)] select-none bg-[#FAF8F5] p-3 rounded-2xl border border-border/40 shadow-xs">
      
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-1 shrink-0">
        {/* Branch Name Tag on the Left */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 text-[#8C5E3C] rounded-xl font-outfit select-none animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8510A]/10 text-[#C8510A]">
              <Store className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-800/60 dark:text-amber-400/60 leading-none mb-1">Cửa hàng làm việc</span>
              <span className="text-sm font-black text-[#3A1D14] dark:text-amber-100 flex items-center gap-1.5 leading-none">
                {user?.branchName || "Chi nhánh chính"}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3.5">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notification dropdown */}
          <div className="relative animate-fade-in" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white ring-2 ring-white text-[9px] font-black flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-lg py-2 z-50 animate-slide-in-down text-left">
                <div className="px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {t("pos.notifications") || "Thông báo"} ({pendingOnlineOrders.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);
                      router.push(`/${locale}/staff/orders`);
                    }}
                    className="text-[10px] text-amber-850 font-bold cursor-pointer hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-850 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-zinc-400 select-none font-semibold">
                      Không có đơn online chờ xác nhận.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSelectedIncomingOrder(n.order);
                          setIsNotifOpen(false);
                        }}
                        className="p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{n.title}</span>
                          <span className="text-[9px] text-zinc-400 whitespace-nowrap ml-2">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <AccountDropdown
            onOpenSettings={handleOpenAccountSettings}
            onLogout={handleLogout}
          />
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        
        {/* LEFT: Sidebar / Menu Navigation */}
        <div className="w-full lg:w-52 bg-white border border-border/60 rounded-xl p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible shrink-0 text-left">
          {/* Logo at the top of the Sidebar */}
          <div className="flex items-center justify-center py-2.5 mb-3 border-b border-border/40 shrink-0">
            <div className="relative h-12 w-32 select-none">
              <img
                src="/logo/logo.svg"
                alt="Lowlands Coffee Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Category List */}
          <div className="flex lg:flex-col gap-1 w-full">
            {/* Tất cả button */}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setActiveView("menu");
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2 ${
                selectedCategoryId === null && activeView === "menu"
                  ? "bg-[#F5EBE1] text-[#C8510A] shadow-2xs font-extrabold"
                  : "bg-transparent hover:bg-muted/10 text-foreground"
              }`}
            >
              <Coffee className="h-3.5 w-3.5 shrink-0" />
              <span>{t("pos.all")}</span>
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategoryId === cat.id && activeView === "menu";
              
              // Map icons based on category name
              let IconComponent = Coffee;
              const catNameLower = cat.name.toLowerCase();
              if (catNameLower.includes("cà phê") || catNameLower.includes("coffee")) IconComponent = Coffee;
              else if (catNameLower.includes("trà") || catNameLower.includes("tea")) IconComponent = CupSoda;
              else if (catNameLower.includes("freeze") || catNameLower.includes("đá")) IconComponent = CupSoda;
              else if (catNameLower.includes("bánh") || catNameLower.includes("ngọt") || catNameLower.includes("cake")) IconComponent = Cake;
              else if (catNameLower.includes("ăn") || catNameLower.includes("thực") || catNameLower.includes("food")) IconComponent = Salad;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setActiveView("menu");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2 ${
                    isActive
                      ? "bg-[#F5EBE1] text-[#C8510A] shadow-2xs font-extrabold"
                      : "bg-transparent hover:bg-muted/10 text-foreground"
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{getCategoryName(cat.name)}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border/40 my-1.5" />

          <button
            onClick={() => toast.info(t("pos.customersDev"))}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2 bg-transparent hover:bg-muted/10 text-foreground"
          >
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>{t("pos.customers")}</span>
          </button>

          <button
            onClick={() => router.push(`/${locale}/staff/orders`)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2 ${
              activeView === "history"
                ? "bg-[#F5EBE1] text-[#C8510A] shadow-2xs font-extrabold"
                : "bg-transparent hover:bg-muted/10 text-foreground"
            }`}
          >
            <History className="h-3.5 w-3.5 shrink-0" />
            <span>{t("pos.orderHistory")}</span>
          </button>

          <button
            onClick={() => handleOpenAccountSettings("profile")}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2 bg-transparent hover:bg-muted/10 text-foreground"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>{t("pos.settings")}</span>
          </button>

          {/* Bottom spacer wrapper */}
          <div className="mt-auto shrink-0 pb-1" />
        </div>

        {/* CENTER: Main Content Grid (Products list or Today's History) */}
        <div className="flex-grow flex flex-col min-w-0">
          
          {activeView === "menu" ? (
            <>
              {/* Header bar displaying active category name + count */}
              <div className="bg-card border border-border/80 rounded-xl px-3.5 py-2 mb-2.5 flex items-center justify-between shadow-2xs bg-white shrink-0">
                <h2 className="text-xs font-black text-foreground font-outfit uppercase select-none text-left tracking-wider">
                  {selectedCategoryId === null ? t("pos.allCategories") : getCategoryName(activeCategoryName).toUpperCase()}
                </h2>
                
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all border ${
                      viewMode === "grid"
                        ? "bg-[#F5EBE1] text-[#C8510A] border-[#C8510A]/10 shadow-2xs"
                        : "bg-background border-border hover:bg-muted/10 text-zinc-500"
                    }`}
                  >
                    <Grid className="h-3 w-3" />
                    <span>{t("pos.viewGrid")}</span>
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all border ${
                      viewMode === "list"
                        ? "bg-[#F5EBE1] text-[#C8510A] border-[#C8510A]/10 shadow-2xs"
                        : "bg-background border-border hover:bg-muted/10 text-zinc-500"
                    }`}
                  >
                    <List className="h-3 w-3" />
                    <span>{t("pos.viewList")}</span>
                  </button>
                  
                  <div className="relative" ref={sortDropdownRef}>
                    <button 
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all border ${
                        sortBy !== "default" || showSortDropdown
                          ? "bg-[#F5EBE1] text-[#C8510A] border-[#C8510A]/10 shadow-2xs"
                          : "bg-background border-border hover:bg-muted/10 text-zinc-500"
                      }`}
                    >
                      <ArrowUpDown className="h-3 w-3" />
                      <span>
                        {sortBy === "default" 
                          ? t("pos.sort") 
                          : (sortBy === "name" 
                            ? t("pos.sortNameAsc") 
                            : (sortBy === "price-asc" 
                              ? t("pos.sortPriceAsc") 
                              : t("pos.sortPriceDesc")))}
                      </span>
                    </button>
                    
                    {showSortDropdown && (
                      <div className="absolute right-0 mt-1.5 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-50 animate-slide-in-down text-left">
                        <div className="px-3 py-1 border-b border-zinc-100 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("pos.sortLabel")}</span>
                        </div>
                        <div className="flex flex-col py-1">
                          <button
                            onClick={() => {
                              setSortBy("default");
                              setShowSortDropdown(false);
                            }}
                            className={`px-3 py-1.5 text-[11px] font-bold text-left hover:bg-zinc-50 transition-colors ${
                              sortBy === "default" ? "text-[#C8510A] bg-zinc-50/50" : "text-zinc-650"
                            }`}
                          >
                            {t("pos.sortDefault")}
                          </button>
                          <button
                            onClick={() => {
                              setSortBy("name");
                              setShowSortDropdown(false);
                            }}
                            className={`px-3 py-1.5 text-[11px] font-bold text-left hover:bg-zinc-50 transition-colors ${
                              sortBy === "name" ? "text-[#C8510A] bg-zinc-50/50" : "text-zinc-650"
                            }`}
                          >
                            {t("pos.sortNameAsc")}
                          </button>
                          <button
                            onClick={() => {
                              setSortBy("price-asc");
                              setShowSortDropdown(false);
                            }}
                            className={`px-3 py-1.5 text-[11px] font-bold text-left hover:bg-zinc-50 transition-colors ${
                              sortBy === "price-asc" ? "text-[#C8510A] bg-zinc-50/50" : "text-zinc-650"
                            }`}
                          >
                            {t("pos.sortPriceAsc")}
                          </button>
                          <button
                            onClick={() => {
                              setSortBy("price-desc");
                              setShowSortDropdown(false);
                            }}
                            className={`px-3 py-1.5 text-[11px] font-bold text-left hover:bg-zinc-50 transition-colors ${
                              sortBy === "price-desc" ? "text-[#C8510A] bg-zinc-50/50" : "text-zinc-650"
                            }`}
                          >
                            {t("pos.sortPriceDesc")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Bar - Positioned below the Category header bar */}
              <div className="mb-2.5 shrink-0 relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("pos.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveView("menu");
                  }}
                  className="w-full text-xs h-9 p-2.5 pl-9 pr-12 border border-zinc-200 bg-white text-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8510A]/20 focus:border-[#C8510A] transition-all font-semibold shadow-2xs"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden sm:flex items-center gap-0.5 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9px] font-medium text-zinc-400">
                  <span className="text-[8px]">Ctrl</span>K
                </div>
              </div>
              
              {/* Products Container */}
              <div className={`flex-grow overflow-y-auto pr-1 pb-1.5 content-start ${
                viewMode === "grid" 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 items-start" 
                  : "flex flex-col gap-2 items-stretch"
              }`}>
                {sortedAndFilteredProducts.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onAddToCart={handleAddToCart} 
                    viewMode={viewMode}
                    availabilityByVariantId={availabilityByVariantId}
                  />
                ))}
              </div>

              {/* KHUYẾN MÃI & PHÍ DỊCH VỤ */}
              <div className="bg-card border border-border/80 rounded-xl p-2.5 px-3 mt-2.5 select-none text-left bg-white shrink-0">
                <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-wider mb-1.5">
                  {t("pos.promotionsAndServices")}
                </h3>
                <div className="flex items-center overflow-x-auto gap-2 scrollbar-none pb-0.5">
                  {activePromotions.map((promo) => (
                    <button 
                      key={promo.id}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("pos-apply-external-promo", { detail: promo.code }));
                      }}
                      className="flex items-center shrink-0 space-x-1 px-2.5 py-1 bg-background border border-border hover:bg-[#FAF8F5] rounded-lg text-[11px] font-bold transition-all text-[#C8510A] border-[#C8510A]/20"
                    >
                      <span>{promo.code}</span>
                    </button>
                  ))}
                  {activePromotions.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic font-semibold">Không có mã giảm giá nào đang hoạt động.</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Today's Orders History View */
            <div className="bg-card border border-border/80 rounded-xl p-4 flex-grow flex flex-col min-h-0 select-none text-left bg-white">
              <h3 className="text-xs font-black text-foreground font-outfit uppercase border-b border-border/60 pb-3 mb-3.5 flex items-center justify-between tracking-wider">
                <span className="flex items-center gap-2">
                  {t("pos.todayOrderHistory", { count: todayOrders.length })}
                  {isLoadingTodayOrders && (
                    <span className="text-[9px] font-bold text-[#C8510A] normal-case tracking-normal">
                      Đang cập nhật...
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setActiveView("menu")}
                  className="text-[11px] text-[#C8510A] hover:underline font-bold"
                >
                  {t("pos.backToMenu")}
                </button>
              </h3>
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 pb-2">
                {todayOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 py-24">
                    <History className="h-10 w-10 mb-2 stroke-[1.2] text-muted-foreground/45" />
                    <span className="text-xs font-bold">{t("pos.noOrdersToday")}</span>
                  </div>
                ) : (
                  todayOrders.map((ord) => (
                    <div key={ord.id} className="border border-border/60 rounded-xl p-3.5 bg-[#FAF8F5] hover:shadow-xs transition-all space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-foreground">{ord.orderCode}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {ord.createdAt ? `${new Date(ord.createdAt).toLocaleTimeString("vi-VN")} - ${new Date(ord.createdAt).toLocaleDateString("vi-VN")}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <StatusBadge status={ord.status || "pending"} customLabel={getStatusLabel(ord.status)} />
                          <span className="text-[9px] px-2 py-0.5 bg-muted/40 text-muted-foreground rounded font-bold uppercase tracking-wider">
                            {ord.paymentMethod === "cod" ? t("pos.cash") : ord.paymentMethod === "bank_transfer" ? t("pos.bankTransfer") : t("pos.card")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t("pos.customer")}</div>
                          <div className="font-bold text-foreground">{ord.receiverName} ({ord.receiverPhone})</div>
                          <div className="text-[10px] text-muted-foreground leading-normal font-medium">{ord.deliveryAddress}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t("pos.totalAmountLabel")}</div>
                          <div className="font-black text-[#C8510A] text-sm leading-none">{ord.totalAmount.toLocaleString("vi-VN")}đ</div>
                          <div className="text-[9px] text-muted-foreground font-medium mt-0.5">
                            {t("pos.subtotalShort", { subtotal: ord.subtotal.toLocaleString("vi-VN"), discount: ord.discountAmount.toLocaleString("vi-VN") })}
                          </div>
                        </div>
                      </div>
  
                      <div className="border-t border-border/40 pt-2 flex items-center justify-between gap-4">
                        <div className="text-[10px] text-muted-foreground truncate font-medium flex-grow">
                          {t("pos.drinks")} {ord.items.map(item => `${item.productName} (x${item.quantity})`).join(", ")}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {renderOrderActions(ord, true)}
                          <Button
                            size="sm"
                            onClick={() => handlePrintOrder(ord)}
                            className="h-7 text-[10px] font-bold border border-[#C8510A] text-[#C8510A] bg-transparent hover:bg-[#C8510A] hover:text-white rounded-lg transition-colors px-2.5 flex items-center gap-1 shrink-0"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            {t("pos.printReceipt")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
  
        {/* RIGHT: POS Cart & Payments */}
        <div className="w-full lg:w-80 shrink-0 lg:h-full flex flex-col">
          <POSCart
            items={cart}
            storeId={user?.branchId ?? null}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        </div>
      </div>

      {/* Incoming Online Order Modal */}
      <Modal
        isOpen={Boolean(selectedIncomingOrder)}
        onClose={() => setSelectedIncomingOrder(null)}
        title={selectedIncomingOrder ? `Đơn online ${selectedIncomingOrder.orderCode || `#${selectedIncomingOrder.id}`}` : "Đơn online"}
        size="lg"
      >
        {selectedIncomingOrder && (() => {
          const paymentMethodLabel = selectedIncomingOrder.paymentMethod === "cod" 
            ? "Tiền mặt (COD)" 
            : selectedIncomingOrder.paymentMethod === "bank_transfer" 
              ? "Chuyển khoản" 
              : "Ví điện tử (Ví MoMo/VNPay)";

          const paymentStatus = selectedIncomingOrder.payment?.paymentStatus || "PENDING";
          
          const getPaymentStatusBadge = (status: string) => {
            const s = status.toUpperCase();
            switch (s) {
              case "PAID":
                return <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full select-none">Đã thanh toán</span>;
              case "FAILED":
                return <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full select-none">Thanh toán lỗi</span>;
              default:
                return <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full select-none">Chờ thanh toán</span>;
            }
          };

          return (
            <div className="space-y-4 text-left">
              {/* Order Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 select-none">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-950">
                    <ClipboardList className="h-4 w-4 text-[#C8510A]" />
                    <span className="text-sm font-black">{selectedIncomingOrder.orderCode || `#${selectedIncomingOrder.id}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {selectedIncomingOrder.createdAt
                        ? new Date(selectedIncomingOrder.createdAt).toLocaleString("vi-VN")
                        : "Chưa có thời gian"}
                    </span>
                  </div>
                </div>
                <StatusBadge status={selectedIncomingOrder.status || "pending"} customLabel={getStatusLabel(selectedIncomingOrder.status)} />
              </div>

              {/* Order Info Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Customer Info Card */}
                <div className="rounded-xl border border-border bg-white p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground select-none">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      Khách hàng
                    </div>
                    <div className="mt-1.5 font-extrabold text-zinc-900 truncate" title={selectedIncomingOrder.receiverName}>
                      {selectedIncomingOrder.receiverName || "Khách"}
                    </div>
                  </div>
                  <div className="font-semibold text-zinc-500">{selectedIncomingOrder.receiverPhone || "-"}</div>
                </div>

                {/* Delivery Info Card */}
                <div className="rounded-xl border border-border bg-white p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground select-none">
                      <Truck className="h-3.5 w-3.5 text-zinc-400" />
                      Giao nhận
                    </div>
                    <div className="mt-1.5 font-extrabold text-[#C8510A]">
                      {getOrderTypeLabel(selectedIncomingOrder.orderType)}
                    </div>
                  </div>
                  <div className="font-semibold text-zinc-500 line-clamp-1" title={selectedIncomingOrder.deliveryAddress || "-"}>
                    {selectedIncomingOrder.deliveryAddress || "-"}
                  </div>
                </div>

                {/* Payment Info Card */}
                <div className="rounded-xl border border-border bg-white p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground select-none">
                      <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                      Thanh toán
                    </div>
                    <div className="mt-1.5 font-extrabold text-zinc-900">
                      {paymentMethodLabel}
                    </div>
                  </div>
                  <div className="mt-1 self-start">
                    {getPaymentStatusBadge(paymentStatus)}
                  </div>
                </div>

                {/* Promotion Info Card */}
                <div className="rounded-xl border border-border bg-white p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground select-none">
                      <Tag className="h-3.5 w-3.5 text-zinc-400" />
                      Khuyến mãi
                    </div>
                    <div className="mt-1.5 font-extrabold text-emerald-700 truncate" title={selectedIncomingOrder.promotionCode || "Không áp dụng"}>
                      {selectedIncomingOrder.promotionCode ? (
                        <span className="bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-extrabold select-none">
                          {selectedIncomingOrder.promotionCode}
                        </span>
                      ) : (
                        "Không áp dụng"
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-zinc-500">
                    {selectedIncomingOrder.discountAmount > 0 ? `Giảm: ${formatCurrency(selectedIncomingOrder.discountAmount)}` : "-"}
                  </div>
                </div>
              </div>

              {selectedIncomingOrder.note && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2.5 text-xs font-semibold text-amber-950 flex items-start gap-2 select-none">
                  <span className="text-amber-600 font-extrabold shrink-0">Ghi chú:</span>
                  <span>{selectedIncomingOrder.note}</span>
                </div>
              )}

              {/* Items List */}
              <div className="rounded-xl border border-border overflow-hidden bg-background">
                <div className="bg-muted/80 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border select-none">
                  Chi tiết món trong đơn hàng
                </div>
                <div className="divide-y divide-border/60 max-h-[220px] overflow-y-auto pr-1">
                  {selectedIncomingOrder.items.map((item, index) => (
                    <div key={`${item.productVariantId}-${index}`} className="p-3.5 text-xs hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-zinc-900">
                            {item.productName} <span className="text-[#C8510A] ml-1">Size {item.size}</span>
                          </div>
                          <div className="mt-1 text-zinc-500 font-semibold flex items-center gap-1.5">
                            <span>Số lượng: <strong className="text-zinc-800">{item.quantity}</strong></span>
                            <span className="text-zinc-300">|</span>
                            <span>Đơn giá: {formatCurrency(item.unitPrice)}</span>
                          </div>
                        </div>
                        <div className="font-black text-zinc-950 text-right">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                      {item.toppings.length > 0 && (
                        <div className="mt-2.5 space-y-1 pl-3 border-l border-zinc-200">
                          {item.toppings.map((topping) => (
                            <div key={topping.toppingId} className="flex justify-between gap-2 text-[11px] text-zinc-500 font-medium">
                              <span>+ {topping.toppingName} <span className="text-zinc-400">x{topping.quantity}</span></span>
                              <span className="font-semibold text-zinc-700">{formatCurrency(topping.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.note && (
                        <div className="mt-2 text-[11px] font-medium text-amber-800 bg-amber-50/50 px-2 py-1 rounded border border-amber-100/50 italic inline-block">
                          Ghi chú món: {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdowns & Footer Summary */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-t border-border pt-4">
                <div className="w-full md:max-w-xs space-y-1.5 text-xs text-zinc-500 pr-4">
                  <div className="flex justify-between font-semibold">
                    <span>Tạm tính:</span>
                    <span className="text-zinc-800 font-extrabold">
                      {formatCurrency(selectedIncomingOrder.subtotal || (selectedIncomingOrder.totalAmount + selectedIncomingOrder.discountAmount))}
                    </span>
                  </div>
                  {selectedIncomingOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Khấu trừ giảm giá:</span>
                      <span>-{formatCurrency(selectedIncomingOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-t border-dashed border-zinc-200 pt-2 mt-1">
                    <span className="font-black text-zinc-900 select-none">Tổng thanh toán:</span>
                    <span className="text-lg font-black text-[#C8510A]">{formatCurrency(selectedIncomingOrder.totalAmount)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePrintOrder(selectedIncomingOrder)}
                    className="h-10 rounded-xl border-[#C8510A]/25 px-4 text-xs font-bold text-[#C8510A] hover:bg-[#F5EBE1] hover:border-[#C8510A]/50 transition-colors"
                  >
                    <Printer className="h-4 w-4 mr-1.5" />
                    In Hóa Đơn (PDF)
                  </Button>
                  {renderOrderActions(selectedIncomingOrder)}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Receipt Success Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title={t("pos.checkoutSuccess")}
        size="md"
      >
        {receiptData && (
          <div className="space-y-4 text-left">
            <div className="flex flex-col items-center justify-center text-center space-y-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-950 select-none">
              <CheckCircle className="h-7 w-7 text-emerald-700 animate-pulse" />
              <span className="text-xs font-bold">{t("pos.checkoutSuccess")}</span>
              <span className="text-[10px] font-black uppercase text-emerald-850">{t("pos.orderCode", { code: receiptData.orderCode ?? "" })}</span>
            </div>

            {/* Receipt Preview box */}
            <div className="border border-border/80 p-5 rounded-xl bg-amber-500/[0.01] shadow-inner font-mono text-[10px] leading-relaxed text-zinc-800 space-y-3.5 select-none">
              <div className="text-center space-y-1">
                <h3 className="font-outfit font-black text-sm uppercase text-zinc-950 tracking-wider">Lowlands Coffee</h3>
                <p className="text-[9px] text-zinc-650">{t("pos.branchAddress") || "Hồ Con Rùa, Q.3, TP. Hồ Chí Minh"}</p>
                <p className="text-[9px] text-zinc-650">{t("pos.branchPhone") || "Hotline: 028.3822.4466"}</p>
                <div className="border-t border-dashed border-zinc-300 my-2" />
                <h4 className="font-bold text-xs uppercase text-zinc-950 tracking-wider">{t("pos.retailReceipt")}</h4>
                <p className="text-[9px]">{t("pos.receiptCode", { code: receiptData.orderCode ?? "" })}</p>
              </div>

              <div className="space-y-0.5 text-zinc-700">
                <div>{t("pos.createdDate")} <span className="font-bold">{receiptData.createdAt ? new Date(receiptData.createdAt).toLocaleString("vi-VN") : ""}</span></div>
                <div>{t("pos.customer")} <span className="font-bold">{receiptData.receiverName}</span></div>
                {receiptData.receiverPhone !== "N/A" && (
                  <div>{t("pos.memberPhone")} <span className="font-bold">{receiptData.receiverPhone}</span></div>
                )}
                <div>{t("pos.serviceType")} <span className="font-bold">
                  {receiptData.serviceType === "dine_in" 
                    ? t("pos.dineInTable", { table: receiptData.tableNumber || "Chưa chọn bàn" }) 
                    : t("pos.takeaway")}
                </span></div>
                <div>{t("pos.cashier")} <span className="font-bold">{user?.fullName || "Thu ngân"}</span></div>
              </div>

              <div className="border-t border-dashed border-zinc-300 my-2" />

              {/* Items List */}
              <div className="space-y-2">
                {receiptData.items.map((item: ReceiptItem, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-zinc-950">
                      <span>{item.productName} (Size {item.size})</span>
                      <span>{(item.unitPrice * item.quantity).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-550 pl-2">
                      <span>{t("pos.unitPrice", { price: item.unitPrice.toLocaleString("vi-VN"), quantity: item.quantity })}</span>
                    </div>
                    
                    {/* Toppings list */}
                    {item.toppings && item.toppings.map((top: ReceiptTopping, tIdx: number) => (
                      <div key={tIdx} className="flex justify-between text-[9px] text-zinc-600 pl-4 italic">
                        <span>{t("pos.toppingName", { name: top.toppingName, quantity: top.quantity })}</span>
                        <span>{(top.totalPrice ?? top.unitPrice * top.quantity).toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))}
                    
                    {item.note && (
                      <div className="text-[9px] text-[#C8510A] italic pl-2">
                        {t("pos.itemNote", { note: item.note })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {receiptData.note && (
                <>
                  <div className="border-t border-dashed border-zinc-300 my-2" />
                  <div className="text-[9px] text-[#C8510A] italic">
                    {t("pos.orderNote", { note: receiptData.note })}
                  </div>
                </>
              )}

              <div className="border-t border-dashed border-zinc-300 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-[11px] text-zinc-900">
                <div className="flex justify-between">
                  <span>{t("pos.subtotal")}</span>
                  <span>{receiptData.subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>{t("pos.discount")}</span>
                    <span>-{receiptData.discountAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                {(receiptData.vat ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span>{t("pos.vat")}</span>
                    <span>{(receiptData.vat ?? 0).toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-zinc-950 pt-1.5 border-t border-dashed border-zinc-350 mt-1">
                  <span>{t("pos.total")}</span>
                  <span>{receiptData.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
                
                {receiptData.paymentMethod === "cod" ? (
                  <>
                    <div className="flex justify-between text-[9px] pt-1 text-zinc-650">
                      <span>{t("pos.cashReceived")}</span>
                      <span>{(receiptData.cashReceived ?? receiptData.totalAmount).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-650">
                      <span>{t("pos.changeReturned")}</span>
                      <span>{(receiptData.changeReturned ?? 0).toLocaleString("vi-VN")}đ</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-[9px] pt-1 text-zinc-650 italic">
                    <span>{t("pos.payment")}</span>
                    <span>{receiptData.paymentMethod === "bank_transfer" ? t("pos.bankTransfer") : t("pos.card")}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-zinc-300 my-2" />
              <p className="text-center text-[9px] italic text-zinc-500">{t("pos.thankYou")}</p>
            </div>

            {/* Print & Close */}
            <div className="flex space-x-2 border-t border-border/40 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => handlePrintOrder(receiptData)}
                className="w-1/2 rounded-lg h-10 text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>{t("pos.printReceipt")}</span>
              </Button>
              <Button
                onClick={() => setIsReceiptOpen(false)}
                className="w-1/2 bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg h-10 text-xs font-bold"
              >
                {t("pos.newOrder")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Account Settings Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        defaultTab={defaultAccountTab}
      />
    </div>
  );
}
