import React, { useState } from "react";
import { Trash2, Plus, Minus, ReceiptText, Ticket } from "lucide-react";
import { CartItem, Product, ProductVariant, Topping, Promotion, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";
import { useDashboardStore } from "@/store/dashboardStore";

interface POSCartProps {
  items: CartItem[];
  onUpdateQty: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (order: any) => void;
}

export function POSCart({
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess
}: POSCartProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  
  // Checkout & Receipt Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "e_wallet" | null>(null);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customerName, setCustomerName] = useState("Khách lẻ");
  const [customerPhone, setCustomerPhone] = useState("");

  const promotions = useDashboardStore((state) => state.promotions);

  // Totals calculations
  const subtotal = items.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce((s, t) => s + t.topping.price * t.quantity, 0);
    return sum + (item.variant.price + toppingsTotal) * item.quantity;
  }, 0);

  let discount = 0;
  if (appliedPromo) {
    if (subtotal >= appliedPromo.minOrderAmount) {
      if (appliedPromo.discountType === "percentage") {
        discount = Math.round((subtotal * appliedPromo.discountValue) / 100);
      } else {
        discount = appliedPromo.discountValue;
      }
    }
  }
  const total = Math.max(0, subtotal - discount);
  const changeReturned = Math.max(0, cashReceived - total);

  // Apply promo handler
  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const promo = promotions.find((p) => p.code.toUpperCase() === promoCode.toUpperCase().trim() && p.status === "active");
    
    if (promo) {
      if (subtotal < promo.minOrderAmount) {
        toast.error(`Đơn hàng chưa đạt tối thiểu ${promo.minOrderAmount.toLocaleString()}đ`);
      } else {
        setAppliedPromo(promo);
        toast.success("Áp dụng mã giảm giá thành công!");
      }
    } else {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
    }
  };

  const handleCheckoutClick = (method: "cod" | "bank_transfer" | "e_wallet") => {
    if (items.length === 0) {
      toast.warning("Giỏ hàng của bạn đang trống!");
      return;
    }
    setPaymentMethod(method);
    setCashReceived(method === "cod" ? total : 0);
    setIsCheckoutOpen(true);
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === "cod" && cashReceived < total) {
      toast.error("Số tiền khách đưa không đủ!");
      return;
    }

    // Prepare order input structure
    const orderItems = items.map(item => ({
      productId: item.product.id,
      productVariantId: item.variant.id,
      productName: item.product.name,
      size: item.variant.size,
      unitPrice: item.variant.price,
      quantity: item.quantity,
      totalPrice: item.variant.price * item.quantity,
      note: item.note,
      toppings: item.toppings.map(t => ({
        toppingId: t.topping.id,
        toppingName: t.topping.name,
        unitPrice: t.topping.price,
        quantity: t.quantity,
        totalPrice: t.topping.price * t.quantity
      }))
    }));

    const finalOrder = {
      storeId: 2, // Default store for simulation
      orderType: "pickup" as const,
      receiverName: customerName || "Khách lẻ",
      receiverPhone: customerPhone || "N/A",
      deliveryAddress: "Mua trực tiếp tại quầy",
      subtotal,
      discountAmount: discount,
      totalAmount: total,
      paymentMethod: paymentMethod || "cod",
      items: orderItems
    };

    // Callback to parent to add to Zustand store and trigger modal
    onCheckoutSuccess({
      ...finalOrder,
      cashReceived,
      changeReturned
    });

    // Reset checkout state
    setIsCheckoutOpen(false);
    setPromoCode("");
    setAppliedPromo(null);
    setCustomerName("Khách lẻ");
    setCustomerPhone("");
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="bg-muted/30 px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground font-outfit select-none flex items-center gap-1.5">
          <ReceiptText className="h-4 w-4 text-amber-800" />
          {UI_TEXT.pos.cartTitle} ({items.length})
        </h3>
        {items.length > 0 && (
          <Button
            variant="ghost"
            onClick={onClearCart}
            className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg px-2"
          >
            Hủy đơn
          </Button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2 max-h-[350px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 py-20">
            <ReceiptText className="h-10 w-10 mb-2 stroke-[1.5]" />
            <span className="text-xs font-semibold">{UI_TEXT.pos.emptyCart}</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-3 bg-muted/20 border border-border/40 rounded-lg space-y-2 hover:border-border transition-colors">
              <div className="flex items-start justify-between">
                <div className="text-left max-w-[70%]">
                  <h4 className="text-xs font-bold text-foreground truncate">{item.product.name}</h4>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Size {item.variant.size}
                    {item.toppings.length > 0 &&
                      ` + ${item.toppings.map((t) => `${t.topping.name} (x${t.quantity})`).join(", ")}`}
                  </span>
                  {item.note && (
                    <span className="text-[10px] text-amber-800 italic block mt-1">
                      Ghi chú: {item.note}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-foreground">
                  {((item.variant.price + item.toppings.reduce((sum, t) => sum + t.topping.price * t.quantity, 0)) * item.quantity).toLocaleString()}đ
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1 border border-border rounded-lg bg-background p-0.5">
                  <button
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="h-6 w-6 flex items-center justify-center hover:bg-muted text-muted-foreground rounded-md transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="h-6 w-6 flex items-center justify-center hover:bg-muted text-muted-foreground rounded-md transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculations & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-border/60 p-4 bg-muted/10 space-y-4">
          {/* Promo code */}
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="pl-8 text-xs h-8 border-border bg-background"
              />
            </div>
            <Button
              onClick={handleApplyPromo}
              className="h-8 text-xs font-semibold px-3 bg-amber-800 hover:bg-amber-700 text-white rounded-lg"
            >
              Áp dụng
            </Button>
          </div>

          {/* Pricing labels */}
          <div className="space-y-1.5 text-xs text-muted-foreground font-semibold border-b border-border/40 pb-3">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="text-foreground">{subtotal.toLocaleString()}đ</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Khuyến mãi ({appliedPromo?.code}):</span>
                <span>-{discount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground pt-1.5">
              <span>Tổng thanh toán:</span>
              <span className="text-amber-900 font-outfit text-base">{total.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-left">
              Phương thức thanh toán:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleCheckoutClick("cod")}
                className="h-9 border border-border bg-background hover:bg-amber-800/10 hover:border-amber-800 hover:text-amber-900 rounded-lg text-xs font-bold transition-all"
              >
                {UI_TEXT.pos.payCash}
              </button>
              <button
                onClick={() => handleCheckoutClick("bank_transfer")}
                className="h-9 border border-border bg-background hover:bg-amber-800/10 hover:border-amber-800 hover:text-amber-900 rounded-lg text-xs font-bold transition-all"
              >
                {UI_TEXT.pos.payCard}
              </button>
              <button
                onClick={() => handleCheckoutClick("e_wallet")}
                className="h-9 border border-border bg-background hover:bg-amber-800/10 hover:border-amber-800 hover:text-amber-900 rounded-lg text-xs font-bold transition-all"
              >
                {UI_TEXT.pos.payQR}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout configuration modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Chi tiết thanh toán đơn hàng"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Họ tên khách hàng:</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-xs border-border bg-background"
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại:</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-9 text-xs border-border bg-background"
                placeholder="Số điện thoại thành viên"
              />
            </div>
          </div>

          <div className="bg-muted/20 p-3 rounded-lg border border-border/40 text-left space-y-1">
            <div className="text-xs font-bold text-muted-foreground mb-1 select-none">Tóm tắt thanh toán:</div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>Tổng tiền đơn:</span>
              <span>{total.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>Hình thức:</span>
              <span className="font-bold">
                {paymentMethod === "cod" && UI_TEXT.pos.payCash}
                {paymentMethod === "bank_transfer" && UI_TEXT.pos.payCard}
                {paymentMethod === "e_wallet" && UI_TEXT.pos.payQR}
              </span>
            </div>
          </div>

          {paymentMethod === "cod" && (
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tiền khách đưa:</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={cashReceived || ""}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="h-10 text-sm border-border bg-background font-bold text-amber-900"
                  placeholder="Nhập số tiền mặt nhận..."
                />
                <button
                  type="button"
                  onClick={() => setCashReceived(total)}
                  className="px-3 border border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white transition-colors rounded-lg text-xs font-semibold h-10 shrink-0"
                >
                  Chẵn tiền
                </button>
              </div>
              <div className="flex justify-between items-center text-xs font-bold pt-1.5">
                <span className="text-muted-foreground">Tiền thối lại:</span>
                <span className={changeReturned > 0 ? "text-emerald-700 text-sm font-bold" : "text-foreground text-sm font-bold"}>
                  {changeReturned.toLocaleString()}đ
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="w-1/2 rounded-lg h-10 text-xs font-semibold">
              Quay lại
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={paymentMethod === "cod" && cashReceived < total}
              className="w-1/2 bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold"
            >
              Xác nhận &amp; In hóa đơn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
