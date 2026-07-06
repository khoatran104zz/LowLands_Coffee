import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CheckCircle2, Copy, Landmark, Minus, Plus, QrCode, ReceiptText, ShoppingBag, Ticket, Trash2, Utensils } from "lucide-react";
import { CartItem, Promotion, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { createOrder } from "@/services/order.service";
import { payOrder, paymentMethodMap } from "@/services/payment.service";
import { useConfirm } from "@/hooks/useConfirm";
import { getAvailablePromotions, validatePromotion } from "@/services/promotion.service";

interface POSCartProps {
  items: CartItem[];
  storeId?: number | null;
  onUpdateQty: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (order: POSReceiptOrder) => void;
}

interface POSReceiptOrder extends Order {
  cashReceived: number;
  changeReturned: number;
  vat: number;
  serviceType: "dine_in" | "takeaway";
  tableNumber: string;
}

const getOrderErrorMessage = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  if (responseMessage) {
    return responseMessage;
  }
  return error instanceof Error ? error.message : "Không thể tạo đơn hàng qua backend.";
};

const isItemEligibleForPromo = (item: CartItem, promo: Promotion | null): boolean => {
  if (!promo) return false;
  if (promo.applicableType === "Entire Order") return true;
  if (promo.applicableType === "Product") {
    return promo.applicableProductIds?.includes(item.product.id) || false;
  }
  if (promo.applicableType === "Category") {
    return promo.applicableCategoryIds?.includes(item.product.categoryId) || false;
  }
  return false;
};

const BANK_TRANSFER_CONFIG = {
  bankBin: "970422",
  bankName: "MB Bank",
  bankShortName: "MB",
  accountNo: "26666666666222",
  accountName: "LOWLANDS COFFEE",
};

const createTransferReference = () => `LLPOS${Date.now().toString().slice(-8)}`;

const buildVietQrUrl = (amount: number, transferReference: string) => {
  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: transferReference,
    accountName: BANK_TRANSFER_CONFIG.accountName,
  });

  return `https://img.vietqr.io/image/${BANK_TRANSFER_CONFIG.bankBin}-${BANK_TRANSFER_CONFIG.accountNo}-compact2.png?${params.toString()}`;
};

export function POSCart({
  items,
  storeId,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess
}: POSCartProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [promoCode, setPromoCode] = useState("");
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  
  // Service configuration
  const [serviceType, setServiceType] = useState<"dine_in" | "takeaway">("takeaway");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [orderNote, setOrderNote] = useState("");

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "e_wallet">("cod");
  const [transferReference, setTransferReference] = useState(() => createTransferReference());

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const promotions = availablePromotions;

  // Totals calculations
  const subtotal = items.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce((s, t) => s + t.topping.price * t.quantity, 0);
    return sum + (item.variant.price + toppingsTotal) * item.quantity;
  }, 0);

  const discount = appliedDiscount;

  const total = Math.max(0, subtotal - discount);
  const changeReturned = Math.max(0, cashReceived - total);
  const bankQrUrl = useMemo(() => buildVietQrUrl(total, transferReference), [total, transferReference]);

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
    transferReference
  });

  useEffect(() => {
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
      transferReference
    };
  }, [
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
    transferReference
  ]);

  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

  useEffect(() => {
    const fetchAvailable = async () => {
      if (items.length === 0) {
        setAvailablePromotions([]);
        setAppliedPromo(null);
        setAppliedDiscount(0);
        return;
      }
      setIsLoadingPromos(true);
      try {
        const payloadItems = items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }));
        const promos = await getAvailablePromotions(payloadItems, subtotal);
        setAvailablePromotions(promos);

        if (appliedPromo) {
          const isStillAvailable = promos.some(p => p.id === appliedPromo.id);
          if (isStillAvailable) {
            const valRes = await validatePromotion(appliedPromo.code, payloadItems, subtotal);
            if (valRes.valid) {
              setAppliedDiscount(valRes.discount);
            } else {
              setAppliedPromo(null);
              setAppliedDiscount(0);
              toast.error(`Khuyến mãi ${appliedPromo.code} không còn áp dụng: ${valRes.message}`);
            }
          } else {
            setAppliedPromo(null);
            setAppliedDiscount(0);
          }
        }
      } catch (err) {
        console.error("Failed to load available promotions", err);
      } finally {
        setIsLoadingPromos(false);
      }
    };
    void fetchAvailable();
  }, [items, subtotal, appliedPromo?.code]);

  const handleSelectPromo = async (promoCodeSelected: string) => {
    if (!promoCodeSelected) {
      setAppliedPromo(null);
      setAppliedDiscount(0);
      setPromoCode("");
      return;
    }
    try {
      const payloadItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      const valRes = await validatePromotion(promoCodeSelected, payloadItems, subtotal);
      if (valRes.valid) {
        const matched = availablePromotions.find(p => p.code === promoCodeSelected);
        setAppliedPromo(matched || { code: promoCodeSelected, name: "Khuyến mãi đã chọn" } as any);
        setAppliedDiscount(valRes.discount);
        setPromoCode(promoCodeSelected);
        toast.success(`Áp dụng mã giảm giá ${promoCodeSelected} thành công!`);
      } else {
        toast.error(`Không thể áp dụng: ${valRes.message}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi khi áp dụng mã giảm giá");
    }
  };

  // Apply promo handler
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const payloadItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      const valRes = await validatePromotion(promoCode.trim().toUpperCase(), payloadItems, subtotal);
      if (valRes.valid) {
        const matched = availablePromotions.find(p => p.code.toUpperCase() === promoCode.trim().toUpperCase());
        setAppliedPromo(matched || { code: promoCode.trim().toUpperCase(), name: "Mã giảm giá đã nhập" } as any);
        setAppliedDiscount(valRes.discount);
        toast.success(`Áp dụng mã giảm giá ${promoCode.trim().toUpperCase()} thành công!`);
      } else {
        toast.error(`Mã giảm giá không hợp lệ: ${valRes.message}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi áp dụng mã giảm giá");
    }
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) {
      toast.warning("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!storeId) {
      toast.error("Tài khoản chưa được gán chi nhánh. Vui lòng cập nhật chi nhánh nhân viên rồi đăng nhập lại.");
      return;
    }
    if (serviceType === "dine_in" && !tableNumber) {
      toast.warning("Vui lòng chọn số bàn trước khi thanh toán!");
      return;
    }
    setCashReceived(paymentMethod === "cod" ? total : 0);
    setIsCheckoutOpen(true);
  };

  const handleCopyTransferValue = async (value: string, label: string) => {
    if (!navigator.clipboard) {
      toast.info(value);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} ${t("pos.copied")}`);
    } catch {
      toast.info(value);
    }
  };

  const handleConfirmPayment = useCallback(async () => {
    const state = stateRef.current;
    if (isSubmitting) {
      return;
    }
    if (!storeId) {
      toast.error("Tài khoản chưa được gán chi nhánh. Vui lòng cập nhật chi nhánh nhân viên rồi đăng nhập lại.");
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

    const transferNote =
      state.paymentMethod === "bank_transfer"
        ? `${t("pos.bankTransferContent")}: ${state.transferReference}`
        : null;
    const finalNote = [state.orderNote, transferNote].filter(Boolean).join(" | ") || undefined;

    const finalOrder: Order = {
      storeId,
      orderType: state.serviceType,
      receiverName: state.customerName || t("pos.guest") || "Khách lẻ",
      receiverPhone: state.customerPhone || "N/A",
      deliveryAddress: destinationAddress,
      subtotal: state.subtotal,
      discountAmount: state.discount,
      totalAmount: state.total,
      paymentMethod: state.paymentMethod,
      note: finalNote,
      items: orderItems,
      promotionCode: appliedPromo?.code || undefined,
    };

    try {
      setIsSubmitting(true);
      const savedOrder = await createOrder(finalOrder);
      if (!savedOrder.id) {
        throw new Error("Backend did not return order id for payment.");
      }
      const paidPayment = await payOrder(
        savedOrder.id,
        paymentMethodMap[state.paymentMethod],
        finalNote
      );
      const paidOrder: Order = {
        ...savedOrder,
        paymentMethod: state.paymentMethod,
        payment: {
          id: paidPayment.id,
          paymentMethod: paidPayment.paymentMethod,
          paymentStatus: paidPayment.paymentStatus,
          amount: Number(paidPayment.amount),
          paidAt: paidPayment.paidAt,
          createdAt: paidPayment.createdAt,
        },
      };
      const backendTotal = paidOrder.totalAmount ?? state.total;
      onCheckoutSuccess({
        ...paidOrder,
        cashReceived: state.paymentMethod === "cod" ? state.cashReceived : backendTotal,
        changeReturned: state.paymentMethod === "cod" ? Math.max(0, state.cashReceived - backendTotal) : 0,
        vat: 0,
        serviceType: state.serviceType,
        tableNumber: state.tableNumber
      });

      setIsCheckoutOpen(false);
      setPromoCode("");
      setAppliedPromo(null);
      setOrderNote("");
      setCustomerName("");
      setCustomerPhone("");
      setServiceType("takeaway");
      setTableNumber("");
      setTransferReference(createTransferReference());
      toast.success(t("pos.orderCreatedSuccess") || "Tạo đơn hàng thành công!");
    } catch (error: unknown) {
      toast.error(getOrderErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onCheckoutSuccess, storeId, t]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleEscapePressed = () => {
      setIsCheckoutOpen(false);
    };

    const handleEnterPressed = () => {
      const state = stateRef.current;
      if (state.items.length === 0) return;

      if (!state.isCheckoutOpen) {
        setCashReceived(state.paymentMethod === "cod" ? state.total : 0);
        setIsCheckoutOpen(true);
      } else {
        void handleConfirmPayment();
      }
    };

    window.addEventListener("pos-escape-pressed", handleEscapePressed);
    window.addEventListener("pos-enter-pressed", handleEnterPressed);

    return () => {
      window.removeEventListener("pos-escape-pressed", handleEscapePressed);
      window.removeEventListener("pos-enter-pressed", handleEnterPressed);
    };
  }, [handleConfirmPayment]);

  const handleUpdateQtyLocal = (itemId: string, newQty: number) => {
    onUpdateQty(itemId, newQty);
    if (newQty <= 0) {
      toast.info(t("pos.itemRemovedInfo"));
    }
  };

  const handleRemoveItemLocal = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle") || "Xác nhận xóa",
      message: `${t("pos.confirmRemoveItemMsg") || "Bạn có chắc chắn muốn xóa món này khỏi đơn hàng?"} ("${item.product.name}")`,
      confirmText: t("common.delete") || "Xóa",
      cancelText: t("common.cancel") || "Hủy",
      variant: "danger"
    });
    
    if (isConfirmed) {
      onRemoveItem(itemId);
      toast.info(t("pos.itemRemovedInfo"));
    }
  };

  const handleClearCartClick = async () => {
    const isConfirmed = await confirm({
      title: t("pos.confirmClearCartTitle") || "Xác nhận xóa giỏ hàng",
      message: t("pos.confirmClearCartMsg") || "Bạn có chắc chắn muốn xóa toàn bộ món trong giỏ hàng hiện tại?",
      confirmText: t("pos.posClearCart") || "Xóa giỏ hàng",
      cancelText: t("common.cancel") || "Hủy",
      variant: "danger"
    });
    if (isConfirmed) {
      onClearCart();
      setTransferReference(createTransferReference());
      toast.info(t("pos.cartClearedInfo") || "Đã xóa toàn bộ giỏ hàng!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm select-none">
      {/* Panel Title */}
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-background">
        <h3 className="text-xs font-black text-foreground font-outfit uppercase tracking-wider">
          {t("pos.posTitle")} {items.length > 0 && <span className="text-[#C8510A] ml-1">{t("pos.posItemsCount", { count: items.length })}</span>}
        </h3>
        {items.length > 0 && (
          <button 
            onClick={handleClearCartClick} 
            className="text-muted-foreground hover:text-rose-600 transition-colors p-1 hover:bg-muted/40 rounded-md"
            title={t("pos.posClearCart") || "Xóa giỏ hàng"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Service Type Selection (At the top of the panel) */}
      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-border/40 space-y-2 shrink-0">
        <div className="bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-lg grid grid-cols-2 gap-0.5 border border-border/50">
          <button
            type="button"
            onClick={() => { setServiceType("takeaway"); setTableNumber(""); }}
            className={`py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              serviceType === "takeaway"
                ? "bg-white dark:bg-zinc-800 text-[#C8510A] shadow-2xs font-extrabold"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("pos.takeaway")}
          </button>
          <button
            type="button"
            onClick={() => { setServiceType("dine_in"); }}
            className={`py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              serviceType === "dine_in"
                ? "bg-white dark:bg-zinc-800 text-[#C8510A] shadow-2xs font-extrabold"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            {t("pos.dineIn") || "Ăn tại bàn"}
          </button>
        </div>
        
        {/* Table Selector */}
        {serviceType === "dine_in" && (
          <div className="flex items-center space-x-2 text-left pt-1">
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">{t("pos.posSelectTableLabel") || "Chọn số bàn:"}</span>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="text-xs font-semibold border border-border rounded-lg bg-background p-1.5 flex-grow focus:ring-1 focus:ring-[#C8510A] focus:outline-none"
            >
              <option value="">{t("pos.posSelectTable")}</option>
              {Array.from({ length: 20 }, (_, i) => `${i + 1}`).map((num) => (
                <option key={num} value={num}>{t("pos.posTableNum", { num })}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-grow overflow-y-auto p-2.5 space-y-2 min-h-0">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 py-20 bg-zinc-50/20 border-2 border-dashed border-zinc-200/50 rounded-xl m-2.5">
            <div className="p-3 bg-zinc-100 rounded-full mb-3 text-zinc-400">
              <ReceiptText className="h-6 w-6 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold text-zinc-500 leading-snug">{t("pos.cartEmptyWarning")}</span>
            <span className="text-[10px] text-zinc-400 mt-1 leading-normal max-w-[160px] mx-auto">{t("pos.emptyCartDesc") || "Chọn đồ uống từ thực đơn để thêm vào đơn hàng"}</span>
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
                  {appliedPromo && isItemEligibleForPromo(item, appliedPromo) && (
                    <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                      ✓ Giảm giá
                    </span>
                  )}
                </div>
              </div>
              
              {/* Qty and Price */}
              <div className="flex items-center space-x-3 shrink-0 ml-2">
                <span className="text-[10px] text-muted-foreground font-black">× {item.quantity}</span>
                <span className="text-xs font-extrabold text-foreground min-w-[50px] text-right">
                  {((item.variant.price + item.toppings.reduce((sum, t) => sum + t.topping.price * t.quantity, 0)) * item.quantity).toLocaleString("vi-VN")}đ
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
          {/* Promo code area */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {t("pos.promotions") || "Khuyến mãi & Mã ưu đãi"}
            </span>
            
            {/* Available Promotions Dropdown */}
            {availablePromotions.length > 0 ? (
              <select
                value={appliedPromo?.code || ""}
                onChange={(e) => handleSelectPromo(e.target.value)}
                className="w-full text-xs p-1.5 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8510A] font-semibold"
              >
                <option value="">-- Chọn mã ưu đãi có sẵn ({availablePromotions.length}) --</option>
                {availablePromotions.map((promo) => (
                  <option key={promo.id} value={promo.code}>
                    {promo.code} - {promo.name} ({promo.discountType === "Percentage" ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}đ`})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-[10px] text-muted-foreground italic px-1">
                Không có mã giảm giá nào phù hợp với giỏ hàng hiện tại.
              </div>
            )}

            {/* Manual input */}
            <div className="flex gap-1.5 mt-1.5">
              <div className="relative flex-1">
                <Ticket className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nhập mã khác..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="pl-8 text-xs h-8 border-border bg-background focus-visible:ring-1 focus-visible:ring-[#C8510A] uppercase"
                />
              </div>
              <Button
                onClick={handleApplyPromo}
                className="h-8 text-xs font-bold px-3 bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg"
              >
                Áp dụng
              </Button>
            </div>
            
            {/* Display applied promo details */}
            {appliedPromo && (
              <div className="mt-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-2 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
                <div className="min-w-0 flex items-center">
                  <span className="font-bold uppercase tracking-wider text-xs bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded mr-1.5 font-mono">
                    {appliedPromo.code}
                  </span>
                  <span className="font-semibold truncate">{appliedPromo.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPromo("")}
                  className="text-xs font-bold text-emerald-900 hover:text-red-600 transition-colors ml-1.5 px-1 bg-emerald-100/50 hover:bg-red-50 rounded"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Ghi chú đơn hàng */}
          <div className="space-y-1 text-left">
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder={t("pos.notePlaceholder")}
              className="w-full text-xs p-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] h-10 resize-none leading-snug transition-all"
            />
          </div>

          {/* Pricing labels */}
          <div className="space-y-1.5 text-xs text-muted-foreground font-semibold border-b border-border/40 pb-2.5">
            <div className="flex justify-between">
              <span>{t("pos.subtotal")}</span>
              <span className="text-foreground">{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>{t("pos.discount")}</span>
                <span>-{discount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-dashed border-border/40 mt-1">
              <span>{t("pos.total")}</span>
              <span className="text-[#C8510A] font-outfit text-base leading-none">{total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-left">
              {t("pos.posPaymentMethod")}
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
                {t("pos.cash")}
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
                {t("pos.bankTransfer")}
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
                {t("pos.card")}
              </button>
            </div>
          </div>

          {paymentMethod === "bank_transfer" && (
            <BankTransferQrPanel
              amount={total}
              qrUrl={bankQrUrl}
              transferReference={transferReference}
              compact
              onCopy={handleCopyTransferValue}
              t={t}
            />
          )}

          {/* Big Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
            <Button
              type="button"
              onClick={() => toast.success(t("pos.orderSavedTemporary"))}
              className="bg-background hover:bg-muted/10 text-foreground border border-border text-xs font-bold h-10 rounded-xl transition-all shadow-2xs shrink-0 flex items-center justify-center gap-1.5"
            >
              <ReceiptText className="h-3.5 w-3.5 text-muted-foreground" />
              {t("pos.posSaveTemporary") || "Lưu đơn tạm"}
            </Button>
            <Button
              type="button"
              onClick={handleCheckoutClick}
              className="col-span-2 bg-[#C8510A] hover:bg-[#B04308] text-white text-xs font-extrabold h-10 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center shrink-0 gap-1.5"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t("pos.posCheckout")}
            </Button>
          </div>
        </div>
      )}

      {/* Checkout configuration modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={t("pos.posCheckoutDetail")}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("pos.posCustomerName")}</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-xs border-border bg-background focus-visible:ring-1 focus-visible:ring-[#C8510A]"
                placeholder={t("pos.posEnterCustomerName")}
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("pos.posPhone")}</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-9 text-xs border-border bg-background focus-visible:ring-1 focus-visible:ring-[#C8510A]"
                placeholder={t("pos.posEnterPhone")}
              />
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-lg border border-border/50 text-left space-y-1">
            <div className="text-xs font-black text-muted-foreground mb-1 select-none">{t("pos.posPaymentSummary")}</div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>{t("pos.serviceType")}</span>
              <span className="font-bold">{serviceType === "dine_in" ? t("pos.dineInTable", { table: tableNumber }) : t("pos.takeaway")}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>{t("pos.posTotalVat")}</span>
              <span className="font-extrabold text-[#C8510A]">{total.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-foreground/80">
              <span>{t("pos.posPaymentMethod")}</span>
              <span className="font-bold">
                {paymentMethod === "cod" && t("pos.cash")}
                {paymentMethod === "bank_transfer" && t("pos.bankTransfer")}
                {paymentMethod === "e_wallet" && t("pos.card")}
              </span>
            </div>
          </div>

          {paymentMethod === "cod" && (
            <div className="space-y-2 text-left bg-muted/10 p-3 border border-border/40 rounded-lg">
              <label className="text-xs font-black text-[#C8510A] uppercase">{t("pos.posEnterCashReceived")}</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={cashReceived || ""}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="h-10 text-sm border-border bg-background font-bold text-[#C8510A]"
                  placeholder={t("pos.posEnterCashReceived")}
                />
                <button
                  type="button"
                  onClick={() => setCashReceived(total)}
                  className="px-3 border border-[#C8510A] text-[#C8510A] hover:bg-[#C8510A] hover:text-white transition-colors rounded-lg text-xs font-bold h-10 shrink-0"
                >
                  {t("pos.posExactCash")}
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
                    {val.toLocaleString("vi-VN")}đ
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs font-black pt-2.5 border-t border-dashed border-border/50 mt-2">
                <span className="text-muted-foreground">{t("pos.changeReturned")}</span>
                <span className={changeReturned > 0 ? "text-emerald-700 text-sm font-black" : "text-foreground text-sm font-black"}>
                  {changeReturned.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          )}

          {paymentMethod === "bank_transfer" && (
            <BankTransferQrPanel
              amount={total}
              qrUrl={bankQrUrl}
              transferReference={transferReference}
              onCopy={handleCopyTransferValue}
              t={t}
            />
          )}

          <div className="flex space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="w-1/2 rounded-lg h-10 text-xs font-semibold">
              {t("pos.posBack")}
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isSubmitting || (paymentMethod === "cod" && cashReceived < total)}
              className="w-1/2 bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg h-10 text-xs font-extrabold shadow-sm"
            >
              {isSubmitting
                ? t("pos.posSubmittingOrder")
                : paymentMethod === "bank_transfer"
                  ? t("pos.posConfirmBankTransfer")
                  : t("pos.posConfirmPayment")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BankTransferQrPanel({
  amount,
  qrUrl,
  transferReference,
  compact = false,
  onCopy,
  t,
}: {
  amount: number;
  qrUrl: string;
  transferReference: string;
  compact?: boolean;
  onCopy: (value: string, label: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const qrSizeClass = compact ? "h-24 w-24" : "h-44 w-44";

  return (
    <div
      className={`rounded-xl border border-[#C8510A]/25 bg-[#FFF8ED] text-left shadow-2xs ${
        compact ? "p-2.5" : "p-4"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#C8510A] shadow-2xs">
            <QrCode className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#3A1D14]">
              {t("pos.bankQrTitle")}
            </div>
            <div className="text-[10px] font-bold text-[#7B655A]">
              {BANK_TRANSFER_CONFIG.bankShortName} / VietQR
            </div>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">
          {t("pos.bankQrReady")}
        </span>
      </div>

      <div className={`mt-3 grid gap-3 ${compact ? "grid-cols-[96px_minmax(0,1fr)]" : "grid-cols-1 sm:grid-cols-[176px_minmax(0,1fr)]"}`}>
        <div className="rounded-xl border border-[#E5D8C8] bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={t("pos.bankQrAlt")}
            className={`${qrSizeClass} rounded-lg object-contain`}
            loading="eager"
          />
        </div>

        <div className="min-w-0 space-y-2">
          <div className="rounded-lg border border-[#E5D8C8] bg-white px-3 py-2">
            <div className="text-[9px] font-black uppercase tracking-wider text-[#7B655A]">
              {t("pos.bankQrAmount")}
            </div>
            <div className="mt-0.5 text-lg font-black text-[#C8510A]">
              {amount.toLocaleString("vi-VN")}đ
            </div>
          </div>

          <InfoLine
            icon={<Landmark className="h-3.5 w-3.5" />}
            label={t("pos.bankQrAccount")}
            value={`${BANK_TRANSFER_CONFIG.bankShortName} - ${BANK_TRANSFER_CONFIG.accountNo}`}
            onCopy={() => onCopy(BANK_TRANSFER_CONFIG.accountNo, t("pos.bankQrAccount"))}
          />

          <InfoLine
            icon={<ReceiptText className="h-3.5 w-3.5" />}
            label={t("pos.bankTransferContent")}
            value={transferReference}
            onCopy={() => onCopy(transferReference, t("pos.bankTransferContent"))}
          />
        </div>
      </div>

      {!compact && (
        <div className="mt-3 rounded-lg border border-[#E5D8C8] bg-white p-3">
          <div className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-[#7B655A]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{t("pos.bankQrInstruction")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoLine({
  icon,
  label,
  value,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#E5D8C8] bg-white px-3 py-2">
      <span className="text-[#C8510A]">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-black uppercase tracking-wider text-[#7B655A]">{label}</div>
        <div className="truncate text-xs font-black text-[#3A1D14]">{value}</div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E5D8C8] text-[#7B655A] transition hover:border-[#C8510A]/30 hover:bg-[#F7EFE5] hover:text-[#C8510A]"
        aria-label={label}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
