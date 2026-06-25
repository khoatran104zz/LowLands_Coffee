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
  const addOrder = useDashboardStore((state) => state.addOrder);

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout success modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  // Filter products by selected category
  const activeProducts = products.filter(
    (p) => p.status === "active" && (selectedCategoryId === null || p.categoryId === selectedCategoryId)
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
        return updated;
      }

      const toppingsInput = selectedToppings.map((t) => ({
        topping: t,
        quantity: 1
      }));

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
      changeReturned: orderInput.changeReturned
    });

    setIsReceiptOpen(true);
    setCart([]); // Clear cart
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-2rem)] select-none">
      {/* LEFT: Category Column */}
      <div className="w-full lg:w-48 bg-card border border-border/80 rounded-xl p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible shrink-0 text-left">
        <div className="hidden lg:flex items-center space-x-2 border-b border-border/60 pb-3 mb-2">
          <Coffee className="h-5 w-5 text-amber-800" />
          <span className="font-bold text-sm font-outfit uppercase">Thực đơn</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-all w-full ${
              selectedCategoryId === cat.id
                ? "bg-amber-800 text-white shadow-xs"
                : "bg-muted/10 hover:bg-muted/30 text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
        
        {/* Navigation links for staff */}
        <div className="hidden lg:block border-t border-border/60 pt-4 mt-auto space-y-2">
          <Link
            href={`/vi/staff/history`}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-all"
          >
            <History className="h-4 w-4" />
            <span>Lịch sử đơn hàng</span>
          </Link>
          <Link
            href={`/vi/admin/dashboard`}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Quay lại Admin</span>
          </Link>
        </div>
      </div>

      {/* CENTER: Products Grid */}
      <div className="flex-grow flex flex-col min-w-0">
        <div className="bg-card border border-border/80 rounded-xl p-4 mb-4 flex items-center justify-between shadow-2xs">
          <h2 className="text-sm font-bold text-foreground font-outfit uppercase select-none text-left">
            Danh sách đồ uống &amp; bánh ngọt ({activeProducts.length})
          </h2>
          <Link href="/vi/staff/history" className="lg:hidden text-xs font-bold text-amber-850 flex items-center gap-1">
            <History className="h-3.5 w-3.5" /> Lịch sử đơn
          </Link>
        </div>
        
        <div className="flex-grow overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-1 pb-4">
          {activeProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
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
            <div className="flex flex-col items-center justify-center text-center space-y-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-900 select-none">
              <CheckCircle className="h-8 w-8 text-emerald-700" />
              <span className="text-sm font-bold">{UI_TEXT.pos.checkoutSuccess}</span>
              <span className="text-xs font-semibold">Mã đơn hàng: {receiptData.orderCode}</span>
            </div>

            {/* Receipt Preview box */}
            <div className="border border-border/80 p-5 rounded-xl bg-amber-500/[0.01] shadow-inner font-mono text-[11px] leading-relaxed text-zinc-800 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-outfit font-black text-sm uppercase text-zinc-950">Lowlands Coffee</h3>
                <p className="text-[10px]">Hồ Con Rùa, Q.3, TP. Hồ Chí Minh</p>
                <p className="text-[10px]">Hotline: 028.3822.4466</p>
                <div className="border-t border-dashed border-zinc-300 my-2" />
                <h4 className="font-bold text-xs uppercase text-zinc-950">HÓA ĐƠN BÁN LẺ</h4>
                <p className="text-[10px]">Số HĐ: {receiptData.orderCode}</p>
              </div>

              <div className="space-y-0.5">
                <div>Ngày: <span className="font-bold">{new Date(receiptData.createdAt).toLocaleString("vi-VN")}</span></div>
                <div>Khách hàng: <span className="font-bold">{receiptData.receiverName}</span></div>
                <div>Số điện thoại: <span className="font-bold">{receiptData.receiverPhone}</span></div>
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
                    <div className="flex justify-between text-[10px] text-zinc-650 pl-2">
                      <span>Đơn giá: {item.unitPrice.toLocaleString()}đ x{item.quantity}</span>
                    </div>
                    
                    {/* Toppings list */}
                    {item.toppings && item.toppings.map((top: any, tIdx: number) => (
                      <div key={tIdx} className="flex justify-between text-[10px] text-zinc-600 pl-4 italic">
                        <span>+ {top.toppingName} (x{top.quantity})</span>
                        <span>{((top.unitPrice * top.quantity) * item.quantity).toLocaleString()}đ</span>
                      </div>
                    ))}
                    
                    {item.note && (
                      <div className="text-[10px] text-amber-800 italic pl-2">
                        Ghi chú: {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-zinc-300 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{receiptData.subtotal.toLocaleString()}đ</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Khuyến mãi:</span>
                    <span>-{receiptData.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-zinc-950 pt-1">
                  <span>TỔNG CỘNG:</span>
                  <span>{receiptData.totalAmount.toLocaleString()}đ</span>
                </div>
                
                {receiptData.paymentMethod === "cod" && (
                  <>
                    <div className="flex justify-between text-[10px] pt-1">
                      <span>Tiền khách đưa:</span>
                      <span>{receiptData.cashReceived.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Tiền thối lại:</span>
                      <span>{receiptData.changeReturned.toLocaleString()}đ</span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-zinc-300 my-2" />
              <p className="text-center text-[9px] italic">Cảm ơn quý khách! Hẹn gặp lại!</p>
            </div>

            {/* Print & Close */}
            <div className="flex space-x-2 border-t border-border/40 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  toast.info("Yêu cầu in hóa đơn đã gửi đến máy in...");
                }}
                className="w-1/2 rounded-lg h-10 text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>{UI_TEXT.pos.printReceipt}</span>
              </Button>
              <Button
                onClick={() => setIsReceiptOpen(false)}
                className="w-1/2 bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold"
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
