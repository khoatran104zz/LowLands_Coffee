import React, { useState, useEffect, useRef } from "react";
import { Trash2, Plus, Minus, ReceiptText, Ticket, Utensils, ShoppingBag } from "lucide-react";
import { CartItem, POSCheckoutDraft } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface POSCartProps {
  items: CartItem[];
  onUpdateQty: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (order: POSCheckoutDraft) => Promise<void> | void;
}

export function POSCart({
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess
}: POSCartProps) {
  const { t } = useTranslation();
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Service configuration
  const [serviceType, setServiceType] = useState<"dine_in" | "takeaway">("takeaway");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [orderNote, setOrderNote] = useState("");

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "e_wallet">("cod");

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customerName, setCustomerName] = useState("Khách lẻ");
  const [customerPhone, setCustomerPhone] = useState("");

  // Totals calculations
  const subtotal = items.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce((s, t) => s + t.topping.price * t.quantity, 0);
    return sum + (item.variant.price + toppingsTotal) * item.quantity;
  }, 0);

  const discount = 0;
  const vat = 0;
  const total = subtotal;
  const changeReturned = Math.max(0, cashReceived - total);

  // Refs for tracking callback state in useEffect
  const stateRef = useRef({
    isCheckoutOpen,
    items,
    paymentMethod,
    total,
    cashReceived,
    customerName,
    customerPhone,
    subtotal,
    discount,
    orderNote,
    serviceType,
    tableNumber,
    isSubmitting
  });

  stateRef.current = {
    isCheckoutOpen,
    items,
    paymentMethod,
    total,
    cashReceived,
    customerName,
    customerPhone,
    subtotal,
    discount,
    orderNote,
    serviceType,
    tableNumber,
    isSubmitting
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleEscapePressed = () => {
      setIsCheckoutOpen(false);
    };

    const handleEnterPressed = () => {
      const state = stateRef.current;
      if (state.items.length === 0 || state.isSubmitting) return;

      if (!state.isCheckoutOpen) {
        // Open checkout modal
        setCashReceived(state.paymentMethod === "cod" ? state.total : 0);
        setIsCheckoutOpen(true);
      } else {
        // In checkout modal, trigger payment
        handleConfirmPayment();
      }
    };

    window.addEventListener("pos-escape-pressed", handleEscapePressed);
    window.addEventListener("pos-enter-pressed", handleEnterPressed);
    
    return () => {
      window.removeEventListener("pos-escape-pressed", handleEscapePressed);
      window.removeEventListener("pos-enter-pressed", handleEnterPressed);
    };
  }, []);

  // Apply promo handler
  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    toast.info("Khuyến mãi sẽ được nối sau khi backend promotion engine sẵn sàng.");
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) {
      toast.warning("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (serviceType === "dine_in" && !tableNumber) {
      toast.warning("Vui lòng chọn số bàn trước khi thanh toán!");
      return;
    }
    setCashReceived(paymentMethod === "cod" ? total : 0);
    setIsCheckoutOpen(true);
  };

  const handleCancelClick = () => {
    if (items.length === 0) return;
    onClearCart();
    setPromoCode("");
    setOrderNote("");
    setServiceType("takeaway");
    setTableNumber("");
    toast.info("Đã hủy đơn hàng hiện tại");
  };

  const handleConfirmPayment = async () => {
    const state = stateRef.current;
    if (state.isSubmitting) {
      return;
    }
    if (state.paymentMethod === "cod" && state.cashReceived < state.total) {
      toast.error("Số tiền khách đưa không đủ!");
      return;
    }

    // Prepare order items structure
    const orderItems = state.items.map(item => ({
      productId: item.product.id,
      productVariantId: item.variant.id,
      productName: item.product.name,
      size: item.variant.size,
      unitPrice: item.variant.price,
      quantity: item.quantity,
      totalPrice: item.variant.price * item.quantity,
      note: item.note || "",
      toppings: item.toppings.map(t => ({
        toppingId: t.topping.id,
        toppingName: t.topping.name,
        unitPrice: t.topping.price,
        quantity: t.quantity,
        totalPrice: t.topping.price * t.quantity
      }))
    }));

    const destinationAddress = state.serviceType === "dine_in" 
      ? `Tại bàn: ${state.tableNumber}` 
      : "Mang đi (Mua tại quầy)";

    const finalOrder: POSCheckoutDraft = {
      storeId: 1,
      orderType: state.serviceType,
      receiverName: state.customerName || "Khách lẻ",
      receiverPhone: state.customerPhone || "N/A",
      deliveryAddress: destinationAddress,
      subtotal: state.subtotal,
      discountAmount: state.discount,
      totalAmount: state.total, // contains subtotal - discount + vat
      paymentMethod: state.paymentMethod,
      note: state.orderNote || undefined,
      items: orderItems,
      cashReceived: state.paymentMethod === "cod" ? state.cashReceived : state.total,
      changeReturned: state.paymentMethod === "cod" ? (state.cashReceived - state.total) : 0,
      vat,
      serviceType: state.serviceType,
      tableNumber: state.tableNumber
    };

    try {
      setIsSubmitting(true);
      await onCheckoutSuccess(finalOrder);
      setIsCheckoutOpen(false);
      setPromoCode("");
      setOrderNote("");
      setCustomerName("Khách lẻ");
      setCustomerPhone("");
      setServiceType("takeaway");
      setTableNumber("");
      toast.success("Đã tạo đơn hàng trên backend!");
    } catch (error) {
      console.error("Failed to create POS order", error);
      toast.error(`Không thể tạo đơn hàng: ${getOrderErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQtyLocal = (itemId: string, newQty: number) => {
    onUpdateQty(itemId, newQty);
    if (newQty <= 0) {
      toast.info("Đã xóa sản phẩm khỏi đơn");
    }
  };

  const handleRemoveItemLocal = (itemId: string) => {
    onRemoveItem(itemId);
    toast.info("Đã xóa sản phẩm khỏi đơn");
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm select-none">
      {/* Panel Title */}
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-background">
        <h3 className="text-xs font-black text-foreground font-outfit uppercase tracking-wider">
          ĐƠN HÀNG {items.length > 0 && <span className="text-[#C8510A] ml-1">({items.length} món)</span>}
        </h3>
        {items.length > 0 && (
          <button 
            onClick={onClearCart} 
            className="text-muted-foreground hover:text-rose-600 transition-colors p-1 hover:bg-muted/40 rounded-md"
            title="Xóa giỏ hàng"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Service Type Selection (At the top of the panel) */}
      <div className="p-3 bg-muted/10 border-b border-border/40 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setServiceType("takeaway"); setTableNumber(""); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
              serviceType === "takeaway"
                ? "bg-[#C8510A] border-[#C8510A] text-white shadow-xs"
                : "bg-background border-border text-foreground hover:bg-muted/10"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Mang về
          </button>
          <button
            type="button"
            onClick={() => { setServiceType("dine_in"); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
              serviceType === "dine_in"
                ? "bg-[#C8510A] border-[#C8510A] text-white shadow-xs"
                : "bg-background border-border text-foreground hover:bg-muted/10"
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            Ăn tại bàn
          </button>
        </div>
        
        {/* Table Selector */}
        {serviceType === "dine_in" && (
          <div className="flex items-center space-x-2 text-left pt-1">
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">Chọn số bàn:</span>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="text-xs font-semibold border border-border rounded-lg bg-background p-1.5 flex-grow focus:ring-1 focus:ring-[#C8510A] focus:outline-none"
            >
              <option value="">-- Chọn bàn --</option>
              {Array.from({ length: 20 }, (_, i) => `Bàn ${i + 1}`).map((table) => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2 max-h-[300px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 py-16">
            <ReceiptText className="h-10 w-10 mb-2 stroke-[1.2] text-muted-foreground/45" />
            <span className="text-xs font-bold">{t("staff.pos.emptyCart")}</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-2 bg-background border border-border/40 rounded-lg flex items-center justify-between hover:border-border transition-colors">
              <div className="flex items-center space-x-2 min-w-0 flex-grow">
                {/* Product Image */}
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted/20 shrink-0">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-bold uppercase">
                      {item.product.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                
                {/* Name and Meta */}
                <div className="text-left min-w-0">
                  <h4 className="text-xs font-black text-foreground truncate leading-tight">{item.product.name}</h4>
                  <span className="text-[9px] text-muted-foreground block mt-0.5 leading-none">
                    Size: {item.variant.size}
                    {item.toppings.length > 0 &&
                      ` | Topping: ${item.toppings.map((t) => `${t.topping.name}`).join(", ")}`}
                  </span>
                  {item.note && (
                    <span className="text-[9px] text-[#C8510A] italic block mt-0.5 leading-none">
                      {item.note}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Qty and Price */}
              <div className="flex items-center space-x-3 shrink-0 ml-2">
                <span className="text-[10px] text-muted-foreground font-black">× {item.quantity}</span>
                <span className="text-xs font-extrabold text-foreground min-w-[50px] text-right">
                  {((item.variant.price + item.toppings.reduce((sum, t) => sum + t.topping.price * t.quantity, 0)) * item.quantity).toLocaleString()}đ
                </span>
                
                <div className="flex flex-col items-center space-y-0.5">
                  <div className="flex items-center border border-border/60 rounded-md bg-background p-0.5">
                    <button
                      onClick={() => handleUpdateQtyLocal(item.id, item.quantity - 1)}
                      className="h-4 w-4 flex items-center justify-center hover:bg-muted text-muted-foreground rounded transition-colors"
                    >
                      <Minus className="h-2 w-2" />
                    </button>
                    <button
                      onClick={() => handleUpdateQtyLocal(item.id, item.quantity + 1)}
                      className="h-4 w-4 flex items-center justify-center hover:bg-muted text-muted-foreground rounded transition-colors"
                    >
                      <Plus className="h-2 w-2" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItemLocal(item.id)}
                  className="text-muted-foreground hover:text-rose-600 p-0.5 rounded transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculations & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-border/60 p-3.5 bg-muted/10 space-y-3.5 shrink-0">
          {/* Promo code */}
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="pl-8 text-xs h-8 border-border bg-background focus-visible:ring-1 focus-visible:ring-[#C8510A]"
              />
            </div>
            <Button
              onClick={handleApplyPromo}
              className="h-8 text-xs font-bold px-3 bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg"
            >
              Áp dụng
            </Button>
          </div>

          {/* Ghi chú đơn hàng */}
          <div className="space-y-1 text-left">
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Ghi chú đơn hàng..."
              className="w-full text-xs p-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] h-10 resize-none leading-snug transition-all"
            />
          </div>

          {/* Pricing labels */}
          <div className="space-y-1.5 text-xs text-muted-foreground font-semibold border-b border-border/40 pb-2.5">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="text-foreground">{subtotal.toLocaleString()}đ</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Giảm giá:</span>
                <span>-{discount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí phục vụ:</span>
              <span className="text-foreground">{vat.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-dashed border-border/40 mt-1">
              <span>Tổng cộng:</span>
              <span className="text-[#C8510A] font-outfit text-base leading-none">{total.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-left">
              Hình thức thanh toán:
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#C8510A] bg-[#C8510A]/10 text-[#C8510A] shadow-2xs font-extrabold"
                    : "border-border bg-background hover:bg-muted/10 text-foreground"
                }`}
              >
                Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "border-[#C8510A] bg-[#C8510A]/10 text-[#C8510A] shadow-2xs font-extrabold"
                    : "border-border bg-background hover:bg-muted/10 text-foreground"
                }`}
              >
                Chuyển khoản
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("e_wallet")}
                className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                  paymentMethod === "e_wallet"
                    ? "border-[#C8510A] bg-[#C8510A]/10 text-[#C8510A] shadow-2xs font-extrabold"
                    : "border-border bg-background hover:bg-muted/10 text-foreground"
                }`}
              >
                Quẹt thẻ
              </button>
            </div>
          </div>

          {/* Big Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
            <Button
              type="button"
              onClick={() => toast.success("Đã lưu đơn hàng vào danh sách đơn tạm!")}
              className="bg-background hover:bg-muted/10 text-foreground border border-border text-xs font-bold h-10 rounded-xl transition-all shadow-2xs shrink-0 flex items-center justify-center gap-1.5"
            >
              <ReceiptText className="h-3.5 w-3.5 text-muted-foreground" />
              Lưu đơn tạm
            </Button>
            <Button
              type="button"
              onClick={handleCheckoutClick}
              className="col-span-2 bg-[#C8510A] hover:bg-[#B04308] text-white text-xs font-extrabold h-10 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center shrink-0 gap-1.5"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Thanh toán
            </Button>
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
                className="h-9 text-xs border-border bg-background focus-visible:ring-1 focus-visible:ring-[#C8510A]"
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại:</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-9 text-xs border-border bg-background focus-visible:ring-1 focus-visible:ring-[#C8510A]"
                placeholder="Số điện thoại thành viên"
              />
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-lg border border-border/50 text-left space-y-1">
            <div className="text-xs font-black text-muted-foreground mb-1 select-none">Tóm tắt thanh toán:</div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>Hình thức phục vụ:</span>
              <span className="font-bold">{serviceType === "dine_in" ? `Ăn tại bàn (${tableNumber})` : "Mang về"}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>Tổng cộng (gồm VAT):</span>
              <span className="font-extrabold text-[#C8510A]">{total.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold">
                {paymentMethod === "cod" && "Tiền mặt"}
                {paymentMethod === "bank_transfer" && "Chuyển khoản"}
                {paymentMethod === "e_wallet" && "Quẹt thẻ"}
              </span>
            </div>
          </div>

          {paymentMethod === "cod" && (
            <div className="space-y-2 text-left bg-muted/10 p-3 border border-border/40 rounded-lg">
              <label className="text-xs font-black text-[#C8510A] uppercase">Tiền mặt nhận của khách:</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={cashReceived || ""}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="h-10 text-sm border-border bg-background font-bold text-[#C8510A]"
                  placeholder="Nhập số tiền mặt nhận..."
                />
                <button
                  type="button"
                  onClick={() => setCashReceived(total)}
                  className="px-3 border border-[#C8510A] text-[#C8510A] hover:bg-[#C8510A] hover:text-white transition-colors rounded-lg text-xs font-bold h-10 shrink-0"
                >
                  Chẵn tiền
                </button>
              </div>
              
              {/* Quick cash suggest buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {[50000, 100000, 200000, 500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={val < total}
                    onClick={() => setCashReceived(val)}
                    className="py-1 border border-border/80 rounded-md text-[10px] font-bold bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {val.toLocaleString()}đ
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs font-black pt-2.5 border-t border-dashed border-border/50 mt-2">
                <span className="text-muted-foreground">Tiền thối lại:</span>
                <span className={changeReturned > 0 ? "text-emerald-700 text-sm font-black" : "text-foreground text-sm font-black"}>
                  {changeReturned.toLocaleString()}đ
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="w-1/2 rounded-lg h-10 text-xs font-semibold">
              Quay lại (Esc)
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isSubmitting || (paymentMethod === "cod" && cashReceived < total)}
              className="w-1/2 bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg h-10 text-xs font-extrabold shadow-sm"
            >
              {isSubmitting ? "Đang tạo đơn..." : "Xác nhận & In hóa đơn (Enter)"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getOrderErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return "kiểm tra backend, quyền ORDER_CREATE hoặc store được gán.";
}
