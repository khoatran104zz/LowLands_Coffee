"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Coffee, ReceiptText, History, LayoutDashboard, Printer, CheckCircle } from "lucide-react";
import { Product, ProductVariant, Topping, CartItem } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { ProductCard } from "@/components/pos/ProductCard";
import { POSCart } from "@/components/pos/POSCart";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { UI_TEXT } from "@/constants/ui-text";
import { toast } from "sonner";

export default function StaffPOSPage() {
  const [isMounted, setIsMounted] = useState(false);

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
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

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

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

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
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-2rem)] select-none bg-[#FAF8F5] p-3 rounded-2xl border border-border/40 shadow-xs">
      
      {/* LEFT: Sidebar / Menu Navigation */}
      <div className="w-full lg:w-52 bg-card border border-border/60 rounded-xl p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible shrink-0 text-left">
        
        {/* Brand Logo */}
        <div className="hidden lg:flex items-center justify-center border-b border-border/65 pb-3 mb-2 shrink-0">
          <div className="relative h-10 w-28">
            <img
              src="/logo/logo.svg"
              alt="Lowlands Coffee Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Search Box */}
        <div className="relative mb-2 shrink-0 hidden lg:block">
          <input
            type="text"
            placeholder="Tìm món ăn..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveView("menu"); // Automatically switch back to menu view when searching
            }}
            className="w-full text-[11px] p-2 pl-7 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] transition-all"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground"
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

        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hidden lg:block px-1 mt-1 mb-1">
          Danh mục
        </span>

        {/* Category List */}
        <div className="flex lg:flex-col gap-1.5 w-full">
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.id && activeView === "menu";
            const catProductCount = products.filter((p) => p.categoryId === cat.id).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setActiveView("menu");
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center justify-between ${
                  isActive
                    ? "bg-[#C8510A] text-white shadow-xs"
                    : "bg-muted/10 hover:bg-muted/20 text-foreground"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-muted/30 text-muted-foreground"
                }`}>
                  {catProductCount}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hidden lg:block px-1 mt-3 mb-1">
          Hệ thống
        </span>

        {/* Tab/Button for Today's History */}
        <button
          onClick={() => setActiveView("history")}
          className={`px-3 py-2 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full flex items-center justify-between shrink-0 ${
            activeView === "history"
              ? "bg-[#C8510A] text-white shadow-xs"
              : "bg-muted/10 hover:bg-muted/20 text-foreground"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            <span>Lịch sử đơn</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
            activeView === "history" ? "bg-white/20 text-white" : "bg-muted/30 text-muted-foreground"
          }`}>
            {todayOrders.length}
          </span>
        </button>

        {/* Back to Admin navigation links */}
        <div className="hidden lg:block border-t border-border/60 pt-3 mt-auto space-y-1.5 shrink-0">
          <Link
            href={`/vi/admin/dashboard`}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-all"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Quay lại Admin</span>
          </Link>
        </div>
      </div>

      {/* CENTER: Main Content Grid (Products list or Today's History) */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {activeView === "menu" ? (
          <>
            {/* Header bar displaying active category name + count */}
            <div className="bg-card border border-border/80 rounded-xl px-4 py-3.5 mb-4 flex items-center justify-between shadow-2xs">
              <h2 className="text-sm font-bold text-foreground font-outfit uppercase select-none text-left tracking-wider">
                {activeCategoryName} — {filteredProducts.length} món
              </h2>
              {searchQuery && (
                <span className="text-[10px] bg-muted/40 text-muted-foreground font-semibold px-2 py-0.5 rounded-md">
                  Lọc từ khóa: "{searchQuery}"
                </span>
              )}
            </div>
            
            {/* Products Grid - 4 Columns */}
            <div className="flex-grow overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1 pb-2 content-start items-start">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </>
        ) : (
          /* Today's Orders History View */
          <div className="bg-card border border-border/80 rounded-xl p-4 flex-grow flex flex-col min-h-0 select-none text-left">
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
              <span className="text-xs font-bold">{UI_TEXT.pos.checkoutSuccess}</span>
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
    </div>
  );
}
