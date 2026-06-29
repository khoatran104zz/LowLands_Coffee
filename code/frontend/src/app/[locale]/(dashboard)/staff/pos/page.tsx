"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Coffee, ReceiptText, History, LayoutDashboard, Printer, CheckCircle, 
  CupSoda, Cake, Salad, Ticket, Users, BarChart2, Settings, Grid, List, ArrowUpDown 
} from "lucide-react";
import { Product, ProductVariant, Topping, CartItem } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { ProductCard } from "@/components/pos/ProductCard";
import { POSCart } from "@/components/pos/POSCart";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, useParams } from "next/navigation";
import { AccountDropdown } from "@/components/account/AccountDropdown";
import { AccountModal } from "@/components/account/AccountModal";

export default function StaffPOSPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  // Account settings states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [defaultAccountTab, setDefaultAccountTab] = useState("profile");
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

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
  const orders = useDashboardStore((state) => state.orders);
  const addOrder = useDashboardStore((state) => state.addOrder);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"menu" | "history">("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout success modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    void hydrateProductCatalog("public");
  }, [hydrateProductCatalog]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push(`/${locale}/portal/login`);
      return;
    }
    const roleUpper = user.roleName?.toUpperCase();
    if (roleUpper !== "STAFF" && roleUpper !== "ADMIN" && roleUpper !== "MANAGER") {
      toast.error("Tài khoản không có quyền truy cập màn hình POS!");
      router.push(`/${locale}/portal/login`);
    }
  }, [isMounted, isAuthenticated, user, router, locale]);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show full screen loading state before layout mounts or if user is unauthorized
  const userRole = user?.roleName?.toUpperCase();
  const hasAccess = isAuthenticated && user && (userRole === "STAFF" || userRole === "ADMIN" || userRole === "MANAGER");

  if (!isMounted || !hasAccess) {
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

  // Filter products by selected category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate today's orders count
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(
    (ord) => ord.createdAt && ord.createdAt.startsWith(todayStr)
  );

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

  const handleCheckoutSuccess = (orderInput: any) => {
    // Add to global Zustand store! It calculates orderCode, storeName, dates
    const savedOrder = addOrder(orderInput);
    
    // Attach cash returned values for receipt
    setReceiptData({
      ...savedOrder,
      cashReceived: orderInput.cashReceived,
      changeReturned: orderInput.changeReturned,
      vat: orderInput.vat,
      serviceType: orderInput.serviceType,
      tableNumber: orderInput.tableNumber
    });

    setIsReceiptOpen(true);
    setCart([]); // Clear cart
  };

  const activeCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || "Thực đơn";

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-2rem)] select-none bg-[#FAF8F5] p-3 rounded-2xl border border-border/40 shadow-xs">
      
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-1 shrink-0">
        {/* Search Input on the Left */}
        <div className="relative w-80 shrink-0">
          <input
            type="text"
            placeholder="Tìm món (vd: cà phê, latte...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveView("menu");
            }}
            className="w-full text-xs p-2 pl-8 border border-border bg-white text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] transition-all font-semibold"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
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
        </div>

        {/* User Account Settings Dropdown on the Right */}
        <AccountDropdown
          onOpenSettings={handleOpenAccountSettings}
          onLogout={handleLogout}
        />
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
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 ${
                selectedCategoryId === null && activeView === "menu"
                  ? "bg-[#F5EBE1] text-[#C8510A] shadow-2xs font-extrabold"
                  : "bg-transparent hover:bg-muted/10 text-foreground"
              }`}
            >
              <Coffee className="h-4 w-4" />
              <span>Tất cả</span>
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
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 ${
                    isActive
                      ? "bg-[#F5EBE1] text-[#C8510A] shadow-2xs font-extrabold"
                      : "bg-transparent hover:bg-muted/10 text-foreground"
                  }`}
                >
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border/40 my-2" />

          {/* System items */}
          <button
            onClick={() => toast.info("Tính năng Khuyến mãi đang phát triển...")}
            className="px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 bg-transparent hover:bg-muted/10 text-foreground"
          >
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <span>Khuyến mãi</span>
          </button>

          <button
            onClick={() => toast.info("Tính năng Khách hàng đang phát triển...")}
            className="px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 bg-transparent hover:bg-muted/10 text-foreground"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Khách hàng</span>
          </button>

          <button
            onClick={() => setActiveView("history")}
            className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 ${
              activeView === "history"
                ? "bg-[#F5EBE1] text-[#C8510A] shadow-2xs font-extrabold"
                : "bg-transparent hover:bg-muted/10 text-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Lịch sử đơn</span>
          </button>

          <button
            onClick={() => toast.info("Tính năng Báo cáo đang phát triển...")}
            className="px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 bg-transparent hover:bg-muted/10 text-foreground"
          >
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <span>Báo cáo</span>
          </button>

          <button
            onClick={() => handleOpenAccountSettings("profile")}
            className="px-3 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center gap-2.5 bg-transparent hover:bg-muted/10 text-foreground"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Cài đặt</span>
          </button>

          {/* Back to Admin navigation links */}
          <div className="hidden lg:block border-t border-border/60 pt-3 mt-auto space-y-1.5 shrink-0">
            <Link
              href={`/vi/admin/dashboard`}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-[#F5EBE1] hover:text-[#C8510A] transition-all"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Quay lại Admin</span>
            </Link>

            {/* User profile at the bottom */}
            <div className="flex items-center space-x-2 pt-2 border-t border-border/40 px-1">
              <div className="h-7 w-7 rounded-full bg-[#C8510A] text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || "N"}
              </div>
              <div className="text-left min-w-0">
                <div className="text-[10px] font-bold text-foreground truncate max-w-[90px]">
                  {user?.fullName || "Nguyễn Văn A"}
                </div>
                <div className="text-[8px] text-muted-foreground font-semibold uppercase">
                  {user?.roleName || "Quản lý"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Main Content Grid (Products list or Today's History) */}
        <div className="flex-grow flex flex-col min-w-0">
          
          {activeView === "menu" ? (
            <>
              {/* Header bar displaying active category name + count */}
              <div className="bg-card border border-border/80 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between shadow-2xs bg-white">
                <h2 className="text-xs font-black text-foreground font-outfit uppercase select-none text-left tracking-wider">
                  {selectedCategoryId === null ? "TẤT CẢ DANH MỤC" : activeCategoryName.toUpperCase()}
                </h2>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <button className="flex items-center space-x-1 py-1.5 px-2.5 bg-[#F5EBE1] text-[#C8510A] rounded-lg text-[10px] font-bold shadow-2xs border border-[#C8510A]/10">
                    <Grid className="h-3 w-3" />
                    <span>Lưới</span>
                  </button>
                  <button className="flex items-center space-x-1 py-1.5 px-2.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground">
                    <List className="h-3 w-3" />
                    <span>Danh sách</span>
                  </button>
                  <button className="flex items-center space-x-1 py-1.5 px-2.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground">
                    <ArrowUpDown className="h-3 w-3" />
                    <span>Sắp xếp</span>
                  </button>
                </div>
              </div>
              
              {/* Products Grid - 4 Columns */}
              <div className="flex-grow overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1 pb-2 content-start items-start">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>

              {/* KHUYẾN MÃI & PHÍ DỊCH VỤ */}
              <div className="bg-card border border-border/80 rounded-xl p-3.5 mt-3 select-none text-left bg-white shrink-0">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-2">
                  Khuyến mãi & phí dịch vụ
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => toast.success("Áp dụng mã giảm giá 10%")}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold transition-all text-[#C8510A] border-[#C8510A]/20"
                  >
                    <span>Giảm 10%</span>
                  </button>
                  <button 
                    onClick={() => toast.success("Áp dụng mã giảm giá 20%")}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold transition-all text-[#C8510A] border-[#C8510A]/20"
                  >
                    <span>Giảm 20%</span>
                  </button>
                  <button 
                    onClick={() => toast.success("Áp dụng khuyến mãi Mua 1 Tặng 1")}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold transition-all text-[#C8510A] border-[#C8510A]/20"
                  >
                    <span>Mua 1 tặng 1</span>
                  </button>
                  <button 
                    onClick={() => toast.success("Áp dụng khuyến mãi Freeship")}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold transition-all text-[#C8510A] border-[#C8510A]/20"
                  >
                    <span>Freeship</span>
                  </button>
                  <button 
                    onClick={() => toast.success("Áp dụng Phí phục vụ")}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold transition-all text-[#C8510A] border-[#C8510A]/20"
                  >
                    <span>Phí phục vụ</span>
                  </button>
                </div>
              </div>

              {/* Cashier Quick Actions Footer */}
              <div className="grid grid-cols-6 gap-2 mt-3 bg-card border border-border/80 rounded-xl p-2 shadow-2xs bg-white shrink-0">
                <button 
                  onClick={() => toast.success("Đã gửi tín hiệu mở két đựng tiền!")}
                  className="flex items-center justify-center py-2 px-1 border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground transition-all"
                >
                  <span>Mở két</span>
                </button>
                <button 
                  onClick={() => toast.info("Tính năng Tìm khách hàng đang phát triển...")}
                  className="flex items-center justify-center py-2 px-1 border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground transition-all"
                >
                  <span>Tìm khách hàng</span>
                </button>
                <button 
                  onClick={() => toast.info("Ghi chú hóa đơn...")}
                  className="flex items-center justify-center py-2 px-1 border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground transition-all"
                >
                  <span>Ghi chú</span>
                </button>
                <button 
                  onClick={() => toast.info("Tính năng Chia hóa đơn đang phát triển...")}
                  className="flex items-center justify-center py-2 px-1 border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground transition-all"
                >
                  <span>Chia đơn</span>
                </button>
                <button 
                  onClick={() => toast.success("Đã in tạm tính hóa đơn cho khách!")}
                  className="flex items-center justify-center py-2 px-1 border border-border hover:bg-muted/10 rounded-lg text-[10px] font-bold text-muted-foreground transition-all"
                >
                  <span>In tạm tính</span>
                </button>
                <button 
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                  className="flex items-center justify-center py-2 px-1 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed text-rose-700 rounded-lg text-[10px] font-bold transition-all"
                >
                  <span>Hủy đơn</span>
                </button>
              </div>
            </>
          ) : (
            /* Today's Orders History View */
            <div className="bg-card border border-border/80 rounded-xl p-4 flex-grow flex flex-col min-h-0 select-none text-left bg-white">
              <h3 className="text-xs font-black text-foreground font-outfit uppercase border-b border-border/60 pb-3 mb-3.5 flex items-center justify-between tracking-wider">
                <span>Lịch sử đơn hàng hôm nay ({todayOrders.length})</span>
                <button
                  onClick={() => setActiveView("menu")}
                  className="text-[11px] text-[#C8510A] hover:underline font-bold"
                >
                  Quay lại thực đơn
                </button>
              </h3>
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 pb-2">
                {todayOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 py-24">
                    <History className="h-10 w-10 mb-2 stroke-[1.2] text-muted-foreground/45" />
                    <span className="text-xs font-bold">Chưa có đơn hàng nào được tạo hôm nay.</span>
                  </div>
                ) : (
                  todayOrders.map((ord) => (
                    <div key={ord.id} className="border border-border/60 rounded-xl p-3.5 bg-[#FAF8F5] hover:shadow-xs transition-all space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-foreground">{ord.orderCode}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {new Date(ord.createdAt).toLocaleTimeString("vi-VN")} - {new Date(ord.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black uppercase tracking-wider">
                            Thành công
                          </span>
                          <span className="text-[9px] px-2 py-0.5 bg-muted/40 text-muted-foreground rounded font-bold uppercase tracking-wider">
                            {ord.paymentMethod === "cod" ? "Tiền mặt" : ord.paymentMethod === "bank_transfer" ? "Chuyển khoản" : "Quẹt thẻ"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Khách hàng:</div>
                          <div className="font-bold text-foreground">{ord.receiverName} ({ord.receiverPhone})</div>
                          <div className="text-[10px] text-muted-foreground leading-normal font-medium">{ord.deliveryAddress}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tổng tiền:</div>
                          <div className="font-black text-[#C8510A] text-sm leading-none">{ord.totalAmount.toLocaleString()}đ</div>
                          <div className="text-[9px] text-muted-foreground font-medium mt-0.5">
                            Tạm: {ord.subtotal.toLocaleString()}đ - giảm: {ord.discountAmount.toLocaleString()}đ
                          </div>
                        </div>
                      </div>
  
                      <div className="border-t border-border/40 pt-2 flex items-center justify-between gap-4">
                        <div className="text-[10px] text-muted-foreground truncate font-medium flex-grow">
                          Đồ uống: {ord.items.map(item => `${item.productName} (x${item.quantity})`).join(", ")}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setReceiptData(ord);
                            setIsReceiptOpen(true);
                          }}
                          className="h-7 text-[10px] font-bold border border-[#C8510A] text-[#C8510A] bg-transparent hover:bg-[#C8510A] hover:text-white rounded-lg transition-colors px-2.5 flex items-center gap-1 shrink-0"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          In lại hóa đơn
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
  
        {/* RIGHT: POS Cart & Payments */}
        <div className="w-full lg:w-80 shrink-0">
          <POSCart
            items={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        </div>
      </div>

      {/* Receipt Success Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Thanh toán thành công!"
        size="md"
      >
        {receiptData && (
          <div className="space-y-4 text-left">
            <div className="flex flex-col items-center justify-center text-center space-y-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-950 select-none">
              <CheckCircle className="h-7 w-7 text-emerald-700 animate-pulse" />
              <span className="text-xs font-bold">{t("staff.pos.checkoutSuccess")}</span>
              <span className="text-[10px] font-black uppercase text-emerald-850">Mã đơn: {receiptData.orderCode}</span>
            </div>

            {/* Receipt Preview box */}
            <div className="border border-border/80 p-5 rounded-xl bg-amber-500/[0.01] shadow-inner font-mono text-[10px] leading-relaxed text-zinc-800 space-y-3.5 select-none">
              <div className="text-center space-y-1">
                <h3 className="font-outfit font-black text-sm uppercase text-zinc-950 tracking-wider">Lowlands Coffee</h3>
                <p className="text-[9px] text-zinc-650">Hồ Con Rùa, Q.3, TP. Hồ Chí Minh</p>
                <p className="text-[9px] text-zinc-650">Hotline: 028.3822.4466</p>
                <div className="border-t border-dashed border-zinc-300 my-2" />
                <h4 className="font-bold text-xs uppercase text-zinc-950 tracking-wider">HÓA ĐƠN BÁN LẺ</h4>
                <p className="text-[9px]">Mã HĐ: {receiptData.orderCode}</p>
              </div>

              <div className="space-y-0.5 text-zinc-700">
                <div>Ngày lập: <span className="font-bold">{new Date(receiptData.createdAt).toLocaleString("vi-VN")}</span></div>
                <div>Khách hàng: <span className="font-bold">{receiptData.receiverName}</span></div>
                {receiptData.receiverPhone !== "N/A" && (
                  <div>SĐT thành viên: <span className="font-bold">{receiptData.receiverPhone}</span></div>
                )}
                <div>Hình thức phục vụ: <span className="font-bold">
                  {receiptData.serviceType === "dine_in" 
                    ? `Ăn tại bàn (${receiptData.tableNumber || "Chưa chọn bàn"})` 
                    : "Mang về"}
                </span></div>
                <div>Thu ngân: <span className="font-bold">Trần Thị Lan</span></div>
              </div>

              <div className="border-t border-dashed border-zinc-300 my-2" />

              {/* Items List */}
              <div className="space-y-2">
                {receiptData.items.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-zinc-950">
                      <span>{item.productName} (Size {item.size})</span>
                      <span>{(item.unitPrice * item.quantity).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-550 pl-2">
                      <span>Đơn giá: {item.unitPrice.toLocaleString()}đ x{item.quantity}</span>
                    </div>
                    
                    {/* Toppings list */}
                    {item.toppings && item.toppings.map((top: any, tIdx: number) => (
                      <div key={tIdx} className="flex justify-between text-[9px] text-zinc-600 pl-4 italic">
                        <span>+ {top.toppingName} (x{top.quantity})</span>
                        <span>{((top.unitPrice * top.quantity) * item.quantity).toLocaleString()}đ</span>
                      </div>
                    ))}
                    
                    {item.note && (
                      <div className="text-[9px] text-[#C8510A] italic pl-2">
                        Ghi chú món: {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {receiptData.note && (
                <>
                  <div className="border-t border-dashed border-zinc-300 my-2" />
                  <div className="text-[9px] text-[#C8510A] italic">
                    Ghi chú đơn hàng: {receiptData.note}
                  </div>
                </>
              )}

              <div className="border-t border-dashed border-zinc-300 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-[11px] text-zinc-900">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{receiptData.subtotal.toLocaleString()}đ</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Khuyến mãi:</span>
                    <span>-{receiptData.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                {receiptData.vat > 0 && (
                  <div className="flex justify-between">
                    <span>Thuế VAT (10%):</span>
                    <span>{receiptData.vat.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-zinc-950 pt-1.5 border-t border-dashed border-zinc-350 mt-1">
                  <span>TỔNG CỘNG:</span>
                  <span>{receiptData.totalAmount.toLocaleString()}đ</span>
                </div>
                
                {receiptData.paymentMethod === "cod" ? (
                  <>
                    <div className="flex justify-between text-[9px] pt-1 text-zinc-600">
                      <span>Tiền mặt nhận:</span>
                      <span>{receiptData.cashReceived.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-600">
                      <span>Tiền thối lại:</span>
                      <span>{receiptData.changeReturned.toLocaleString()}đ</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-[9px] pt-1 text-zinc-600 italic">
                    <span>Thanh toán:</span>
                    <span>{receiptData.paymentMethod === "bank_transfer" ? "Chuyển khoản" : "Quẹt thẻ"}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-zinc-300 my-2" />
              <p className="text-center text-[9px] italic text-zinc-500">Cảm ơn quý khách! Hẹn gặp lại!</p>
            </div>

            {/* Print & Close */}
            <div className="flex space-x-2 border-t border-border/40 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Yêu cầu in hóa đơn đã được gửi đến máy in...");
                }}
                className="w-1/2 rounded-lg h-10 text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>In lại hóa đơn</span>
              </Button>
              <Button
                onClick={() => setIsReceiptOpen(false)}
                className="w-1/2 bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg h-10 text-xs font-bold"
              >
                Tạo đơn hàng mới
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
