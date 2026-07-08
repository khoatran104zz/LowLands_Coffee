"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { createOrder } from "@/services/order.service";
import { getStores } from "@/services/store.service";
import { Order, OrderItemInput, Store, Promotion } from "@/types";
import { getAvailablePromotions, validatePromotion } from "@/services/promotion.service";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  Printer,
  QrCode,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  TicketPercent,
  Timer,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { buildOrderTrackingUrl, printOrderAsPdf } from "@/lib/order-print";

const PAYMENT_METHOD_VALUES = [
  "cod",
  "vnpay",
] as const;

type CheckoutPaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];
type GatewayStep = "review" | "processing" | "otp";

interface PaymentReceipt {
  transactionCode: string;
  methodLabel: string;
  bankName?: string;
  paidAt: string;
}

const PAYMENT_OPTIONS: {
  id: CheckoutPaymentMethod;
  title: string;
  subtitle: string;
  badge: string;
  requiresBank?: boolean;
}[] = [
  {
    id: "cod",
    title: "Tiền mặt",
    subtitle: "Thanh toán khi nhận hàng (COD).",
    badge: "COD",
  },
  {
    id: "vnpay",
    title: "VNPay",
    subtitle: "Thanh toán trực tuyến qua cổng VNPay.",
    badge: "VNPAY",
  },
];

const BANK_OPTIONS = [
  { id: "vcb", name: "Vietcombank", shortName: "VCB" },
  { id: "tcb", name: "Techcombank", shortName: "TCB" },
  { id: "mb", name: "MB Bank", shortName: "MB" },
  { id: "bidv", name: "BIDV", shortName: "BIDV" },
  { id: "vietin", name: "VietinBank", shortName: "VTB" },
  { id: "acb", name: "ACB", shortName: "ACB" },
  { id: "sacombank", name: "Sacombank", shortName: "STB" },
  { id: "vpbank", name: "VPBank", shortName: "VPB" },
];

const LOWLANDS_TRANSFER_ACCOUNT = {
  holderName: "LOWLANDS COFFEE",
  accountNumber: "26666666666222",
};

const ONLINE_PAYMENT_METHODS = new Set<CheckoutPaymentMethod>([
  "vnpay",
]);

const PAYMENT_TRACKING_STORAGE_KEY = "lowlands_pending_payment_order";

const rememberPendingPaymentOrder = (order: Order) => {
  if (typeof window === "undefined" || !order.orderCode || !order.receiverPhone?.trim()) {
    return;
  }

  window.localStorage.setItem(
    PAYMENT_TRACKING_STORAGE_KEY,
    JSON.stringify({
      orderCode: order.orderCode,
      receiverPhone: order.receiverPhone.trim(),
    })
  );
};

const toBackendPaymentMethod = (paymentMethod: CheckoutPaymentMethod): Order["paymentMethod"] => {
  if (paymentMethod === "cod") return "cod";
  return "bank_transfer";
};

const formatGatewayTime = (value: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);

const generateTransactionCode = () => `LLPAY${Date.now().toString().slice(-9)}`;

const getPaymentLabel = (paymentMethod: CheckoutPaymentMethod) =>
  PAYMENT_OPTIONS.find((option) => option.id === paymentMethod)?.title || "Thanh toán";

const isItemEligibleForPromo = (item: any, promo: Promotion | null): boolean => {
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

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getTotalAmount,
    clearCart,
    orderType,
    selectedStoreId,
    setSelectedStoreId,
    appliedPromotion,
    applyPromotion,
    hasHydrated,
  } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [stores, setStores] = useState<Store[]>([]);
  const [formStoreId, setFormStoreId] = useState<number>(selectedStoreId || 1);

  // Sync formStoreId when store hydrates
  useEffect(() => {
    if (hasHydrated && selectedStoreId) {
      setFormStoreId(selectedStoreId);
    }
  }, [hasHydrated, selectedStoreId]);

  useEffect(() => {
    if (!hasHydrated) return;
    const fetchStores = async () => {
      try {
        const data = await getStores();
        const active = data.filter((s) => s.status === "active");
        setStores(active);
        if (active.length > 0) {
          const currentStoreId = useCartStore.getState().selectedStoreId;
          const defaultStore = active.find((s) => s.id === currentStoreId) || active[0];
          setFormStoreId(defaultStore.id);
          setSelectedStoreId(defaultStore.id);
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    };
    void fetchStores();
  }, [hasHydrated, setSelectedStoreId]);

  // Fetch available promotions on customer checkout page
  useEffect(() => {
    if (!hasHydrated) return;
    const fetchAvailable = async () => {
      if (items.length === 0) {
        setAvailablePromotions([]);
        applyPromotion(null);
        return;
      }
      setIsLoadingPromos(true);
      try {
        const payloadItems = items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));
        const currentSubtotal = getSubtotal();
        const promos = await getAvailablePromotions(payloadItems, currentSubtotal);
        setAvailablePromotions(promos);

        if (appliedPromotion) {
          const isStillAvailable = promos.some((p) => p.id === appliedPromotion.id);
          if (isStillAvailable) {
            const valRes = await validatePromotion(appliedPromotion.code, payloadItems, currentSubtotal);
            if (!valRes.valid) {
              applyPromotion(null);
              toast.error(`Khuyến mãi ${appliedPromotion.code} không còn áp dụng: ${valRes.message}`);
            } else {
              applyPromotion(appliedPromotion, valRes.discount);
            }
          } else {
            applyPromotion(null);
          }
        }
      } catch (err) {
        console.error("Failed to load available promotions", err);
      } finally {
        setIsLoadingPromos(false);
      }
    };
    void fetchAvailable();
  }, [hasHydrated, items, appliedPromotion?.code, applyPromotion, getSubtotal]);

  const formSchema = zod.object({
    receiverName: zod.string().min(1, { message: t("product.checkout.validation.nameRequired") }),
    receiverPhone: zod
      .string()
      .regex(/^0[0-9]{9}$/, { message: t("product.checkout.validation.phoneInvalid") }),
    deliveryAddress: zod.string().min(1, { message: t("product.checkout.validation.addressRequired") }),
    note: zod.string().optional(),
    saveInfo: zod.boolean().optional(),
    acceptPolicy: zod.boolean().refine(Boolean, { message: t("product.checkout.acceptPolicyError") }),
    paymentMethod: zod.enum(PAYMENT_METHOD_VALUES),
  });

  type FormData = zod.infer<typeof formSchema>;

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(BANK_OPTIONS[0].id);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<GatewayStep>("review");
  const [gatewayTransactionCode, setGatewayTransactionCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingCheckoutData, setPendingCheckoutData] = useState<FormData | null>(null);
  const [completedPaymentReceipt, setCompletedPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [checkoutStartedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverName: user?.fullName || "",
      receiverPhone: user?.phone || "",
      deliveryAddress: "",
      note: "",
      saveInfo: false,
      acceptPolicy: true,
      paymentMethod: "cod",
    },
  });

  const selectedPaymentMethod = useWatch({ control, name: "paymentMethod" }) || "cod";
  const selectedPaymentOption = PAYMENT_OPTIONS.find((option) => option.id === selectedPaymentMethod) || PAYMENT_OPTIONS[0];
  const selectedBank = BANK_OPTIONS.find((bank) => bank.id === selectedBankId) || BANK_OPTIONS[0];
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const totalAmount = getTotalAmount();
  const deliveryLabel = orderType === "delivery" ? "Giao hàng tận nơi" : "Nhận tại cửa hàng";
  const estimatedReceiveTime = useMemo(() => {
    const minutes = orderType === "delivery" ? 35 : 18;
    return formatGatewayTime(new Date(checkoutStartedAt + minutes * 60_000));
  }, [checkoutStartedAt, orderType]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getOrderErrorMessage = (error: unknown) => {
    const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (responseMessage) {
      return responseMessage;
    }
    return error instanceof Error ? error.message : "Không thể gửi đơn hàng. Vui lòng thử lại.";
  };

  const formatOrderStatus = (status?: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "pending") return "Chờ nhân viên xác nhận";
    if (normalized === "confirmed") return "Đã xác nhận";
    if (normalized === "preparing") return "Đang pha chế";
    if (normalized === "ready") return "Sẵn sàng giao/nhận";
    if (normalized === "completed") return "Hoàn tất";
    if (normalized === "cancelled") return "Đã hủy";
    return status || "Chờ nhân viên xác nhận";
  };

  const buildOrderItems = (): OrderItemInput[] =>
    items.map((item) => {
      const toppingsPrice = item.toppings.reduce(
        (sum, topping) => sum + Number(topping.topping.price) * topping.quantity,
        0
      );
      const unitPrice = Number(item.variant.price) + toppingsPrice;

      return {
        productId: item.product.id,
        productVariantId: item.variant.id,
        productName: item.product.name,
        size: item.variant.size,
        unitPrice,
        quantity: item.quantity,
        totalPrice: unitPrice * item.quantity,
        note: item.note,
        toppings: item.toppings.map((topping) => ({
          toppingId: topping.topping.id,
          toppingName: topping.topping.name,
          unitPrice: Number(topping.topping.price),
          quantity: topping.quantity,
          totalPrice: Number(topping.topping.price) * topping.quantity,
        })),
      };
    });

  const buildOrderNote = (note?: string, receipt?: PaymentReceipt) => {
    const paymentNote = receipt
      ? `Thanh toán sandbox: ${receipt.methodLabel}${receipt.bankName ? ` - ${receipt.bankName}` : ""} - ${receipt.transactionCode}`
      : null;
    const fullNote = [note?.trim(), paymentNote].filter(Boolean).join(" | ");
    return fullNote ? fullNote.slice(0, 255) : undefined;
  };

  const submitOrder = async (data: FormData, receipt?: PaymentReceipt) => {
    if (items.length === 0) return;

    setSubmitting(true);

    const orderData: Order = {
      storeId: formStoreId,
      orderType,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      deliveryAddress: data.deliveryAddress,
      subtotal,
      discountAmount,
      totalAmount,
      note: buildOrderNote(data.note, receipt),
      items: buildOrderItems(),
      paymentMethod: toBackendPaymentMethod(data.paymentMethod),
      promotionCode: appliedPromotion?.code || undefined,
    };

    try {
      const savedOrder = await createOrder(orderData);
      setCompletedPaymentReceipt(receipt || null);
      setCreatedOrder(savedOrder);
      setIsGatewayOpen(false);
      setPendingCheckoutData(null);
      setIsSuccessDialogOpen(true);
      toast.success(receipt ? "Thanh toán mô phỏng thành công, đơn đã gửi đến nhân viên." : t("product.checkout.orderSuccess"));
    } catch (err) {
      console.error("Failed to submit customer order", err);
      toast.error(getOrderErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentGateway = (data: FormData) => {
    setPendingCheckoutData(data);
    setGatewayTransactionCode(generateTransactionCode());
    setGatewayStep("review");
    setOtpCode("");
    setIsGatewayOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) return;

    if (data.paymentMethod === "vnpay") {
      setSubmitting(true);
      const orderData: Order = {
        storeId: formStoreId,
        orderType,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        deliveryAddress: data.deliveryAddress,
        subtotal,
        discountAmount,
        totalAmount,
        note: buildOrderNote(data.note),
        items: buildOrderItems(),
        paymentMethod: toBackendPaymentMethod(data.paymentMethod),
        promotionCode: appliedPromotion?.code || undefined,
      };

      try {
        const savedOrder = await createOrder(orderData);
        rememberPendingPaymentOrder(savedOrder);
        toast.info("Đang tạo liên kết thanh toán...");
        
        const createPaymentPath = "/payment/vnpay/create";
          
        const paymentRes = await axiosInstance.post<{ data: { redirectUrl?: string; payUrl?: string; paymentUrl?: string } }>(
          createPaymentPath,
          { orderId: savedOrder.id }
        );
        
        const redirectUrl = paymentRes.data.data.redirectUrl || paymentRes.data.data.payUrl || paymentRes.data.data.paymentUrl;
        if (redirectUrl) {
          clearCart();
          window.location.href = redirectUrl;
        } else {
          toast.error("Không nhận được địa chỉ thanh toán từ hệ thống.");
        }
      } catch (err) {
        console.error("Failed to submit customer order and pay", err);
        toast.error(getOrderErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    await submitOrder(data);
  };

  const handleGatewayPrimaryAction = async () => {
    if (!pendingCheckoutData) return;

    if (gatewayStep === "review") {
      setGatewayStep("processing");
      window.setTimeout(() => setGatewayStep("otp"), 850);
      return;
    }

    if (gatewayStep === "otp") {
      if (otpCode.trim() !== "123456") {
        toast.error("OTP sandbox chưa đúng. Gợi ý: 123456");
        return;
      }

      const receipt: PaymentReceipt = {
        transactionCode: gatewayTransactionCode,
        methodLabel: getPaymentLabel(pendingCheckoutData.paymentMethod),
        bankName: selectedPaymentOption.requiresBank ? selectedBank.name : undefined,
        paidAt: formatGatewayTime(new Date()),
      };

      await submitOrder(pendingCheckoutData, receipt);
    }
  };

  const handleSelectPromo = async (promoCodeSelected: string) => {
    if (!promoCodeSelected) {
      applyPromotion(null);
      setVoucherCode("");
      setVoucherMessage(null);
      return;
    }
    try {
      const payloadItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      const valRes = await validatePromotion(promoCodeSelected, payloadItems, subtotal);
      if (valRes.valid) {
        const matched = availablePromotions.find((p) => p.code === promoCodeSelected);
        applyPromotion(
          matched || ({ code: promoCodeSelected, name: "Khuyến mãi đã chọn", discountType: valRes.discount > 0 ? "Fixed Amount" : "Percentage", discountValue: valRes.discount } as any),
          valRes.discount
        );
        setVoucherCode(promoCodeSelected);
        setVoucherMessage(null);
        toast.success(`Áp dụng mã giảm giá ${promoCodeSelected} thành công!`);
      } else {
        toast.error(`Không thể áp dụng: ${valRes.message}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi khi áp dụng mã giảm giá");
    }
  };

  const handleApplyVoucher = async () => {
    const normalized = voucherCode.trim().toUpperCase();
    if (!normalized) {
      setVoucherMessage("Nhập mã khuyến mãi để kiểm tra.");
      return;
    }
    try {
      const payloadItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      const valRes = await validatePromotion(normalized, payloadItems, subtotal);
      if (valRes.valid) {
        const matched = availablePromotions.find((p) => p.code === normalized);
        applyPromotion(
          matched || ({ code: normalized, name: "Mã giảm giá đã nhập", discountType: "Fixed Amount", discountValue: valRes.discount } as any),
          valRes.discount
        );
        setVoucherMessage(null);
        toast.success(`Áp dụng mã giảm giá ${normalized} thành công!`);
      } else {
        setVoucherMessage(`Mã giảm giá không hợp lệ: ${valRes.message}`);
      }
    } catch (err: any) {
      console.error(err);
      setVoucherMessage(err.response?.data?.message || "Lỗi khi áp dụng mã giảm giá");
    }
  };

  const handleOrderSuccessClose = () => {
    setIsSuccessDialogOpen(false);
    setCreatedOrder(null);
    setCompletedPaymentReceipt(null);
    clearCart();
    router.push("/menu");
  };

  const handleTrackCreatedOrder = () => {
    if (!createdOrder) return;
    setIsSuccessDialogOpen(false);
    clearCart();
    if (isAuthenticated) {
      router.push("/profile#orders");
      return;
    }
    router.push(`/track-order?code=${encodeURIComponent(createdOrder.orderCode || "")}&phone=${encodeURIComponent(createdOrder.receiverPhone || "")}`);
  };

  const handlePrintCreatedOrder = () => {
    if (!createdOrder) return;

    const opened = printOrderAsPdf(createdOrder, {
      storeName: createdOrder.storeName,
      trackingUrl: buildOrderTrackingUrl(createdOrder, locale),
    });

    if (opened) {
      toast.success("Đã mở mẫu in. Chọn Save as PDF để lưu hóa đơn.");
      return;
    }

    toast.error("Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  };

  if (!hasHydrated) {
    return (
      <div className="py-20 min-h-[60vh] bg-background flex flex-col items-center justify-center text-center gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-[#C8510A]" />
        <h2 className="font-heading font-extrabold text-xl text-[#3A1D14]">Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="py-20 min-h-[60vh] bg-background flex flex-col items-center justify-center text-center gap-6">
        <div className="rounded-full bg-secondary p-6 text-muted-foreground/45">
          <ShoppingBag className="h-16 w-16" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-primary">{t("product.cart.empty")}</h2>
        <Link
          href="/menu"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
        >
          {t("common.menu")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-10 text-left">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#7B655A] hover:text-[#3A1D14]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.cart")}</span>
        </Link>

        <div className="mt-8 flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-black tracking-tight text-[#3A1D14]">
            {t("product.checkout.title")}
          </h1>
          <p className="text-sm font-semibold text-[#7B655A]">
            {t("product.checkout.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-[#E5D8C8] bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-center gap-2 border-b border-[#E9DED1] pb-4">
                <Truck className="h-5 w-5 text-[#C69A5B]" />
                <h2 className="text-xl font-black text-[#3A1D14]">{t("product.checkout.shippingInfo")}</h2>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex flex-col gap-1.5 pb-2">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7B655A]">
                    {t("product.checkout.selectBranch")} <span className="text-[#C8510A]">*</span>
                  </label>
                  <select
                    value={formStoreId}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormStoreId(val);
                      setSelectedStoreId(val);
                    }}
                    className="h-11 w-full rounded-xl border border-[#E5D8C8] bg-[#FFFCF8] px-3 text-sm font-semibold text-[#3A1D14] outline-none transition focus:border-[#C69A5B] focus:ring-3 focus:ring-[#C69A5B]/20"
                  >
                    {stores.length === 0 ? (
                      <option value={1}>{t("product.checkout.loadingBranches")}</option>
                    ) : (
                      stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {s.address}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#C8510A]" />
                  <div>
                    <p className="font-black text-[#3A1D14]">{deliveryLabel}</p>
                    <p className="mt-1 font-semibold text-[#7B655A]">
                      {t("product.checkout.staffConfirm")}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F7EFE5] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-black text-[#3A1D14]">
                    <Timer className="h-4 w-4 text-[#C8510A]" />
                    {t("product.checkout.estimatedTime")}
                  </div>
                  <p className="mt-1 text-sm font-black text-[#C8510A]">{estimatedReceiveTime}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7B655A]">
                    {t("product.checkout.noteLabel")}
                  </label>
                  <textarea
                    {...register("note")}
                    className="min-h-[86px] w-full resize-none rounded-xl border border-[#E5D8C8] bg-[#FFFCF8] p-3 text-sm font-semibold text-[#3A1D14] outline-none transition focus:border-[#C69A5B] focus:ring-3 focus:ring-[#C69A5B]/20 placeholder:font-normal placeholder:text-muted-foreground/60"
                    placeholder={t("product.checkout.notePlaceholder")}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5D8C8] bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-center gap-2 border-b border-[#E9DED1] pb-4">
                <UserRound className="h-5 w-5 text-[#C69A5B]" />
                <h2 className="text-xl font-black text-[#3A1D14]">{t("product.checkout.yourInfo")}</h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7B655A]">
                    {t("product.checkout.fullNameLabel")} <span className="text-[#C8510A]">*</span>
                  </label>
                  <Input
                    {...register("receiverName")}
                    className="h-11 rounded-xl border-[#E5D8C8] bg-[#FFFCF8] text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/60"
                    placeholder={t("product.checkout.fullNamePlaceholder")}
                  />
                  {errors.receiverName && (
                    <span className="text-xs font-semibold text-destructive">{errors.receiverName.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7B655A]">
                    {t("product.checkout.phoneLabel")} <span className="text-[#C8510A]">*</span>
                  </label>
                  <Input
                    {...register("receiverPhone")}
                    className="h-11 rounded-xl border-[#E5D8C8] bg-[#FFFCF8] text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/60"
                    placeholder={t("product.checkout.phonePlaceholder")}
                  />
                  {errors.receiverPhone && (
                    <span className="text-xs font-semibold text-destructive">{errors.receiverPhone.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7B655A]">
                    {t("product.checkout.addressLabel")} <span className="text-[#C8510A]">*</span>
                  </label>
                  <Input
                    {...register("deliveryAddress")}
                    className="h-11 rounded-xl border-[#E5D8C8] bg-[#FFFCF8] text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/60"
                    placeholder={t("product.checkout.addressPlaceholder")}
                  />
                  {errors.deliveryAddress && (
                    <span className="text-xs font-semibold text-destructive">{errors.deliveryAddress.message}</span>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm font-semibold text-[#3A1D14]">
                <label className="flex items-start gap-3">
                  <input type="checkbox" {...register("saveInfo")} className="mt-1 accent-[#C8510A]" />
                  <span>{t("product.checkout.saveInfo")}</span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" {...register("acceptPolicy")} className="mt-1 accent-[#C8510A]" />
                  <span>
                    {t("product.checkout.acceptPolicy")}
                    <span className="font-black text-[#C8510A]"> *</span>
                  </span>
                </label>
                {errors.acceptPolicy && (
                  <span className="block text-xs font-semibold text-destructive">{errors.acceptPolicy.message}</span>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5D8C8] bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-center gap-2 border-b border-[#E9DED1] pb-4">
                <WalletCards className="h-5 w-5 text-[#C69A5B]" />
                <h2 className="text-xl font-black text-[#3A1D14]">{t("product.checkout.paymentMethod")}</h2>
              </div>

              <div className="mt-5 space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const isSelected = selectedPaymentMethod === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                        isSelected
                          ? "border-[#C69A5B] bg-[#FFF8ED] shadow-[0_0_0_3px_rgba(198,154,91,0.12)]"
                          : "border-[#E5D8C8] bg-white hover:border-[#C69A5B]/60 hover:bg-[#FFFCF8]"
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.id}
                        {...register("paymentMethod")}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? "border-[#C8510A] bg-[#C8510A]" : "border-[#C69A5B]"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-[#E5D8C8] bg-[#FBF7F0]">
                        <PaymentBrandMark method={option.id} badge={option.badge} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-[#3A1D14]">{option.title}</span>
                        <span className="mt-0.5 block text-xs font-semibold text-[#7B655A]">{option.subtitle}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedPaymentOption.requiresBank && (
                <div className="mt-5 rounded-xl border border-[#E5D8C8] bg-[#FFFCF8] p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-[#3A1D14]">
                    <Landmark className="h-4 w-4 text-[#C8510A]" />
                    {t("product.checkout.selectBank")}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {BANK_OPTIONS.map((bank) => {
                      const isSelected = selectedBankId === bank.id;
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBankId(bank.id)}
                          className={`rounded-lg border px-3 py-2 text-left transition ${
                            isSelected
                              ? "border-[#C8510A] bg-[#F7EFE5] text-[#3A1D14]"
                              : "border-[#E5D8C8] bg-white text-[#7B655A] hover:border-[#C69A5B]"
                          }`}
                        >
                          <span className="block text-xs font-black">{bank.shortName}</span>
                          <span className="mt-0.5 block truncate text-[11px] font-semibold">{bank.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/cart"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#C69A5B]/40 bg-[#8EA096] px-5 text-sm font-black text-white hover:bg-[#7F9188]"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("product.checkout.back")}
              </Link>
              <Button
                type="submit"
                disabled={submitting || Boolean(createdOrder)}
                className="h-12 rounded-xl bg-[#3A1D14] px-5 text-sm font-black text-white hover:bg-[#2C140F]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    {t("product.checkout.placeOrderBtn")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-5 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-[#E5D8C8] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <TicketPercent className="h-5 w-5 text-[#C69A5B]" />
                <h2 className="text-base font-black text-[#3A1D14]">{t("product.checkout.voucherTitle")}</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#7B655A]">{t("product.checkout.voucherSubtitle")}</p>
              
              {/* Dropdown list */}
              <div className="mt-3">
                {availablePromotions.length > 0 ? (
                  <select
                    value={appliedPromotion?.code || ""}
                    onChange={(e) => handleSelectPromo(e.target.value)}
                    className="w-full rounded-xl border border-[#E5D8C8] bg-[#FFFCF8] p-2.5 text-xs font-bold text-[#3A1D14] outline-none focus:border-[#C69A5B]"
                  >
                    <option value="">{t("product.checkout.selectVoucherPlaceholder")}</option>
                    {availablePromotions.map((promo) => (
                      <option key={promo.id} value={promo.code}>
                        {promo.code} - {promo.name} ({promo.discountType === "Percentage" ? `${promo.discountValue}%` : `${formatPrice(promo.discountValue)}`})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs italic text-[#7B655A] px-1">
                    {t("product.checkout.noVoucher")}
                  </div>
                )}
              </div>

              {/* Manual input code */}
              <div className="mt-3 flex overflow-hidden rounded-xl border border-[#E5D8C8] bg-[#FFFCF8]">
                <input
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[#3A1D14] outline-none uppercase placeholder:font-normal placeholder:text-muted-foreground/60"
                  placeholder={t("product.checkout.manualVoucherPlaceholder")}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="bg-[#C8510A] px-4 py-2 text-sm font-black text-white hover:bg-[#A94309]"
                >
                  {t("product.checkout.apply")}
                </button>
              </div>

              {voucherMessage && (
                <div className="mt-3 rounded-xl border border-[#EBCFC2] bg-[#FFF1EC] px-3 py-2 text-xs font-bold text-[#C8510A]">
                  {voucherMessage}
                </div>
              )}

              {/* Applied promo display */}
              {appliedPromotion && (
                <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  <div className="min-w-0 flex items-center">
                    <span className="font-bold uppercase tracking-wider text-[10px] bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded mr-1.5 font-mono">
                      {appliedPromotion.code}
                    </span>
                    <span className="truncate">{appliedPromotion.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPromo("")}
                    className="text-xs font-bold text-emerald-900 hover:text-red-600 transition-colors ml-1.5 px-1.5 py-0.5 bg-emerald-100/50 hover:bg-red-50 rounded"
                  >
                    {t("product.checkout.deleteVoucher")}
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#E5D8C8] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#E9DED1] pb-4">
                <ReceiptText className="h-5 w-5 text-[#C69A5B]" />
                <h2 className="text-xl font-black text-[#3A1D14]">{t("product.checkout.orderSummary")}</h2>
              </div>

              <div className="max-h-[260px] space-y-4 overflow-y-auto py-4 pr-1">
                {items.map((item) => {
                  const toppingsTotal = item.toppings.reduce(
                    (sum, topping) => sum + Number(topping.topping.price) * topping.quantity,
                    0
                  );
                  const itemPrice = (Number(item.variant.price) + toppingsTotal) * item.quantity;
                  return (
                    <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                      <div className="min-w-0">
                        <p className="font-black text-[#3A1D14]">
                          {t(`product.items.${item.product.id}.name`, { defaultValue: item.product.name })} <span className="font-semibold text-[#7B655A]">x{item.quantity}</span>
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-[#7B655A]">{t("product.menu.size")} {item.variant.size}</p>
                        {item.toppings.length > 0 && (
                          <p className="mt-0.5 truncate text-xs font-semibold text-[#9A7A65]">
                            + {item.toppings.map((topping) => `${topping.topping.name} x${topping.quantity}`).join(", ")}
                          </p>
                        )}
                        {appliedPromotion && isItemEligibleForPromo(item, appliedPromotion) && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                              ✓ {t("product.checkout.eligibleDiscount")}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 font-black text-[#3A1D14]">{formatPrice(itemPrice)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-[#E9DED1] pt-4 text-sm font-semibold">
                <SummaryRow label={t("product.checkout.subtotal")} value={formatPrice(subtotal)} />
                <SummaryRow label={t("product.checkout.discount")} value={discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)} />
                <SummaryRow label={t("product.checkout.shippingFee")} value={formatPrice(0)} />
                <SummaryRow label={t("product.checkout.surcharge")} value={formatPrice(0)} />
                <div className="mt-4 flex items-center justify-between border-t border-[#E9DED1] pt-4 text-xl font-black text-[#3A1D14]">
                  <span>{t("product.checkout.totalAmount")}</span>
                  <span className="text-[#C8510A]">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#E5D8C8] bg-[#FBF7F0] p-3 text-xs font-semibold text-[#7B655A]">
                <div className="flex items-center gap-2 font-black text-[#3A1D14]">
                  <ShieldCheck className="h-4 w-4 text-[#C8510A]" />
                  {t("product.checkout.sandboxTitle")}
                </div>
                <p className="mt-1">
                  {t("product.checkout.sandboxDesc")}
                </p>
              </div>
            </section>
          </aside>
        </form>
      </div>

      <Dialog open={isGatewayOpen} onOpenChange={setIsGatewayOpen}>
        <DialogContent className="w-[min(1040px,calc(100vw-2rem))] !max-w-none overflow-hidden bg-white p-0 text-left">
          <div className="max-h-[92vh] overflow-y-auto rounded-xl">
            <div className="bg-[#3A1D14] px-5 py-4 text-white md:px-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 pr-8 text-xl font-black md:text-2xl">
                  <ShieldCheck className="h-6 w-6 text-[#F0C77A]" />
                  Lowlands Pay Sandbox
                </DialogTitle>
                <DialogDescription className="text-sm font-semibold text-[#EBDDCF]">
                  Giả lập cổng {selectedPaymentOption.title}. OTP sandbox: <span className="font-black text-white">123456</span>
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_310px] lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 p-5 md:p-6">
                {gatewayStep === "processing" ? (
                  <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#C8510A]" />
                    <h3 className="mt-4 text-lg font-black text-[#3A1D14]">Đang kết nối cổng thanh toán</h3>
                    <p className="mt-1 text-sm font-semibold text-[#7B655A]">
                      Hệ thống đang kiểm tra giao dịch với {selectedPaymentOption.title}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-[#E5D8C8] bg-[#FBF7F0] p-4">
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-wide text-[#7B655A]">Số tiền thanh toán</p>
                          <p className="mt-1 text-3xl font-black text-[#C8510A] md:text-4xl">{formatPrice(totalAmount)}</p>
                        </div>
                        <div className="flex h-14 min-w-[132px] items-center justify-center rounded-xl border border-[#E5D8C8] bg-white px-4">
                          <PaymentBrandMark method={selectedPaymentMethod} badge={selectedPaymentOption.badge} large />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-semibold text-[#7B655A] sm:grid-cols-3">
                        <GatewayInfo label="Mã giao dịch" value={gatewayTransactionCode} />
                        <GatewayInfo label="Phương thức" value={selectedPaymentOption.title} />
                        {selectedPaymentOption.requiresBank && (
                          <GatewayInfo label="Ngân hàng" value={selectedBank.name} />
                        )}
                      </div>
                    </div>

                    {((selectedPaymentMethod as string) === "vnpay_qr" || (selectedPaymentMethod as string) === "bank_transfer") && (
                      <div className="grid gap-4 sm:grid-cols-[280px_minmax(0,1fr)]">
                        <VietQrCard
                          transactionCode={gatewayTransactionCode}
                          bankShortName={selectedBank.shortName}
                          bankName={selectedBank.name}
                          paymentMethod={selectedPaymentMethod}
                          amountLabel={formatPrice(totalAmount)}
                        />
                        <GatewayMethodPanel
                          title={(selectedPaymentMethod as string) === "bank_transfer" ? "Chuyển khoản bằng VietQR" : "Quét mã bằng app ngân hàng"}
                          description={
                            (selectedPaymentMethod as string) === "bank_transfer"
                              ? "Mở ứng dụng ngân hàng, quét mã VietQR và kiểm tra đúng tên tài khoản, số tiền, nội dung chuyển khoản."
                              : "Mở ứng dụng ngân hàng, chọn VNPay QR và quét mã sandbox. Sau đó nhập OTP để xác nhận giao dịch."
                          }
                          steps={
                            (selectedPaymentMethod as string) === "bank_transfer"
                              ? [
                                  "Quét mã VietQR trong app ngân hàng.",
                                  "Kiểm tra người nhận LOWLANDS COFFEE và nội dung chuyển khoản.",
                                  "Nhập OTP sandbox để gửi đơn hàng.",
                                ]
                              : [
                                  "Mở app ngân hàng hoặc ví hỗ trợ VNPay.",
                                  "Chọn quét mã QR và kiểm tra số tiền.",
                                  "Nhập OTP sandbox để hoàn tất.",
                                ]
                          }
                        />
                      </div>
                    )}

                    {(selectedPaymentMethod as string) !== "vnpay_qr" && (selectedPaymentMethod as string) !== "bank_transfer" && (
                      <GatewayMethodPanel
                        title={
                          selectedPaymentOption.requiresBank
                            ? `Xác nhận qua ${selectedBank.name}`
                            : `Xác nhận qua ${selectedPaymentOption.title}`
                        }
                        description={
                          selectedPaymentOption.requiresBank
                            ? "Đây là giao dịch ngân hàng sandbox. Kiểm tra thông tin bên dưới rồi xác nhận để chuyển sang bước OTP."
                            : "Ví điện tử sandbox sẽ mô phỏng trạng thái đang chờ xác nhận, sau đó yêu cầu OTP để hoàn tất."
                        }
                        steps={[
                          "Kiểm tra đúng số tiền và mã giao dịch.",
                          selectedPaymentOption.requiresBank ? "Chọn tài khoản nguồn trong ngân hàng sandbox." : "Mở ví điện tử sandbox để xác nhận.",
                          "Nhập OTP 123456 để gửi đơn hàng.",
                        ]}
                      />
                    )}

                    {gatewayStep === "otp" && (
                      <div className="rounded-2xl border border-[#E5D8C8] p-4">
                        <label className="text-xs font-black uppercase tracking-wide text-[#7B655A]">
                          Mã OTP xác thực
                        </label>
                        <Input
                          value={otpCode}
                          onChange={(event) => setOtpCode(event.target.value)}
                          className="mt-2 h-12 rounded-xl border-[#C69A5B] text-center text-lg font-black tracking-[0.35em] placeholder:font-normal placeholder:text-muted-foreground/60 placeholder:tracking-normal placeholder:text-sm"
                          maxLength={6}
                          placeholder="123456"
                        />
                        <p className="mt-2 text-xs font-semibold text-[#7B655A]">
                          Nhập <span className="font-black text-[#C8510A]">123456</span> để hoàn tất giao dịch sandbox.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 border-t border-[#E5D8C8] bg-[#FFFCF8] p-5 md:border-l md:border-t-0 md:p-6">
                <h3 className="text-lg font-black text-[#3A1D14]">Tóm tắt thanh toán</h3>
                <div className="mt-4 space-y-2 text-sm font-semibold text-[#7B655A]">
                  <SummaryRow label="Đơn hàng" value={`${items.length} món`} />
                  <SummaryRow label="Tổng tiền" value={formatPrice(totalAmount)} strong />
                  <SummaryRow label="Cổng" value={selectedPaymentOption.badge} />
                  {selectedPaymentOption.requiresBank && <SummaryRow label="Ngân hàng" value={selectedBank.shortName} />}
                </div>

                <div className="mt-5 rounded-xl border border-[#E5D8C8] bg-white p-3 text-xs font-semibold text-[#7B655A]">
                  <p className="font-black text-[#3A1D14]">Quy trình giả lập</p>
                  <ol className="mt-2 space-y-1">
                    <li>1. Kiểm tra thông tin giao dịch.</li>
                    <li>2. Cổng thanh toán phản hồi sandbox.</li>
                    <li>3. Xác thực OTP và gửi đơn.</li>
                  </ol>
                </div>

                <Button
                  type="button"
                  onClick={handleGatewayPrimaryAction}
                  disabled={submitting || gatewayStep === "processing"}
                  className="mt-5 h-11 w-full rounded-xl bg-[#C8510A] text-sm font-black text-white hover:bg-[#A94309]"
                >
                  {gatewayStep === "review" && (
                    <>
                      Xác nhận thanh toán
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                  {gatewayStep === "processing" && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý
                    </>
                  )}
                  {gatewayStep === "otp" && (
                    <>
                      Hoàn tất giao dịch
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isSuccessDialogOpen && createdOrder && (
        <Dialog
          open={isSuccessDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleOrderSuccessClose();
            }
          }}
        >
          <DialogContent className="max-w-2xl bg-card text-left max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-primary">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <span>Đơn hàng đã gửi đến nhân viên</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                Đơn hàng của bạn đã được ghi nhận vào hệ thống. Nhân viên cửa hàng sẽ kiểm tra và xác nhận trong ít phút.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
              <div className="rounded-xl border border-border bg-secondary/25 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mã đơn hàng</div>
                <div className="mt-1 text-lg font-black text-primary">{createdOrder.orderCode}</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Trạng thái</div>
                <div className="mt-1 text-sm font-black text-emerald-800">{formatOrderStatus(createdOrder.status)}</div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/25 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cửa hàng</div>
                <div className="mt-1 text-sm font-extrabold text-primary">{createdOrder.storeName || `#${createdOrder.storeId}`}</div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/25 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng tiền</div>
                <div className="mt-1 text-sm font-extrabold text-primary">{formatPrice(createdOrder.totalAmount)}</div>
              </div>
            </div>

            {completedPaymentReceipt && (
              <div className="rounded-xl border border-[#E5D8C8] bg-[#FBF7F0] p-4 text-xs font-semibold text-[#7B655A]">
                <div className="flex items-center gap-2 font-black text-[#3A1D14]">
                  <ShieldCheck className="h-4 w-4 text-[#C8510A]" />
                  Đã thanh toán sandbox
                </div>
                <p className="mt-1">
                  {completedPaymentReceipt.methodLabel}
                  {completedPaymentReceipt.bankName ? ` - ${completedPaymentReceipt.bankName}` : ""} - {completedPaymentReceipt.transactionCode}
                </p>
                <p className="mt-0.5">Thời gian: {completedPaymentReceipt.paidAt}</p>
              </div>
            )}

            <div className="flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p>
                Trạng thái hiện tại là <span className="font-bold">{formatOrderStatus(createdOrder.status)}</span>. Khi nhân viên xác nhận, đơn sẽ chuyển sang trạng thái đã xác nhận trong hệ thống quản lý đơn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <Button onClick={handleTrackCreatedOrder} className="rounded-full font-bold">
                Theo dõi đơn hàng
              </Button>
              <Button onClick={handlePrintCreatedOrder} variant="outline" className="rounded-full font-bold">
                <Printer className="h-4 w-4 mr-1.5" />
                In PDF
              </Button>
              <Button onClick={handleOrderSuccessClose} variant="outline" className="rounded-full font-bold">
                Tiếp tục mua hàng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PaymentBrandMark({
  method,
  badge,
  large = false,
}: {
  method: CheckoutPaymentMethod;
  badge: string;
  large?: boolean;
}) {
  const iconClass = large ? "h-6 w-6" : "h-5 w-5";
  const textClass = large ? "text-sm" : "text-xs";

  if (method === "cod") {
    return (
      <span className="flex items-center gap-1.5 text-[#C8510A]">
        <Banknote className={iconClass} />
        <span className={`${textClass} font-black`}>{badge}</span>
      </span>
    );
  }

  if (method === "vnpay") {
    return (
      <span className="flex items-center gap-1.5 text-[#1D5FA7]">
        <CreditCard className={iconClass} />
        <span className={`${textClass} font-black`}>{badge}</span>
      </span>
    );
  }

  // MoMo option removed

  const methodStr = method as string;
  if (methodStr === "vnpay_qr") {
    return (
      <span className="flex items-center gap-1.5 text-[#1D5FA7]">
        <QrCode className={iconClass} />
        <span className={`${textClass} font-black`}>{badge}</span>
      </span>
    );
  }

  if (methodStr === "vnpay_card") {
    return (
      <span className="flex items-center gap-1.5 text-[#1F7A4D]">
        <CreditCard className={iconClass} />
        <span className={`${textClass} font-black`}>{badge}</span>
      </span>
    );
  }

  if (methodStr === "bank_transfer") {
    return (
      <span className="flex items-center gap-1.5 text-[#3A1D14]">
        <Landmark className={iconClass} />
        <span className={`${textClass} font-black`}>{badge}</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[#C8510A]">
      <Smartphone className={iconClass} />
      <span className={`${textClass} font-black`}>{badge}</span>
    </span>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-3 ${strong ? "font-black text-[#3A1D14]" : "text-[#7B655A]"}`}>
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 text-right">{value}</span>
    </div>
  );
}

function GatewayInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E5D8C8] bg-white px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-wide text-[#9A7A65]">{label}</div>
      <div className="mt-1 break-words text-sm font-black text-[#3A1D14]">{value}</div>
    </div>
  );
}

function GatewayMethodPanel({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps: string[];
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#E5D8C8] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7EFE5] text-[#C8510A]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-black text-[#3A1D14]">{title}</h3>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-[#7B655A]">{description}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#FBF7F0] p-3">
        <p className="text-xs font-black uppercase tracking-wide text-[#9A7A65]">Các bước mô phỏng</p>
        <ol className="mt-2 space-y-2 text-sm font-semibold leading-relaxed text-[#7B655A]">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8510A] text-[10px] font-black text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function VietQrCard({
  transactionCode,
  bankShortName,
  bankName,
  paymentMethod,
  amountLabel,
}: {
  transactionCode: string;
  bankShortName: string;
  bankName: string;
  paymentMethod: CheckoutPaymentMethod;
  amountLabel: string;
}) {
  const seed = transactionCode.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const providerLabel = (paymentMethod as string) === "bank_transfer" ? "VIETQR" : "VNPAY QR";
  const transferContent = `LL ${transactionCode}`;
  const size = 21;

  const getQrCell = (row: number, col: number) => {
    const finderOrigins = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ];

    for (const [originRow, originCol] of finderOrigins) {
      const localRow = row - originRow;
      const localCol = col - originCol;
      const inFinder = localRow >= 0 && localRow < 7 && localCol >= 0 && localCol < 7;

      if (inFinder) {
        const isOuter = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
        const isInner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
        return isOuter || isInner;
      }
    }

    const diagonal = (row + col + seed) % 7 === 0;
    const stripe = (row * 3 + col * 5 + seed) % 11 < 4;
    const cluster = ((row - 10) ** 2 + (col - 11) ** 2 + seed) % 13 < 5;
    return diagonal || stripe || cluster;
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#CDE9F6] bg-gradient-to-br from-[#E7F8FF] via-white to-[#F2FBFF] shadow-sm">
      <div className="border-b border-[#D7EDF7] bg-white/75 px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#1D5FA7]">
          {LOWLANDS_TRANSFER_ACCOUNT.holderName}
        </div>
        <div className="mt-0.5 text-lg font-black tracking-wide text-[#25333A]">
          {LOWLANDS_TRANSFER_ACCOUNT.accountNumber}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#D71920]">VietQR</span>
            <span className="rounded-full bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-black text-[#1D5FA7]">
              {providerLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-[#D71920]" />
            <span className="text-xl font-black text-[#173B88]">{bankShortName}</span>
          </div>
        </div>

        <div className="relative mx-auto mt-3 aspect-square w-full max-w-[250px] rounded-2xl bg-white p-3 shadow-inner ring-1 ring-[#D8ECF6]">
          <div className="grid h-full w-full grid-cols-[repeat(21,minmax(0,1fr))] gap-[3px]">
            {Array.from({ length: size * size }, (_, index) => {
              const row = Math.floor(index / size);
              const col = index % size;
              const filled = getQrCell(row, col);
              return (
                <span
                  key={`${transactionCode}-${index}`}
                  className={`rounded-[2px] ${filled ? "bg-[#26343A]" : "bg-[#F7FCFF]"}`}
                />
              );
            })}
          </div>
          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-[#D8ECF6] bg-white text-sm font-black text-[#C8510A] shadow-sm">
            LL
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white/80 p-3 text-xs font-semibold text-[#506A76]">
          <div className="flex items-center justify-between gap-3">
            <span>Ngân hàng</span>
            <span className="text-right font-black text-[#25333A]">{bankName}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span>Số tiền</span>
            <span className="text-right font-black text-[#C8510A]">{amountLabel}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span>Nội dung</span>
            <span className="text-right font-black text-[#25333A]">{transferContent}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-black text-[#506A76]">
          <span>VietQR Pay</span>
          <span>VietQR Global</span>
          <span>napas 247</span>
        </div>
      </div>
    </div>
  );
}
