"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useCartStore } from "@/store/cart.store";
import { createOrder } from "@/services/order.service";
import { Order, OrderItemInput } from "@/types";
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
import { ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const tCart = useTranslations("cart");
  const router = useRouter();

  const { items, getSubtotal, getDiscountAmount, getTotalAmount, clearCart, orderType, selectedStoreId } = useCartStore();

  const [checkoutPayload, setCheckoutPayload] = useState<Order | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Zod form validation schema matching messages validations
  const formSchema = zod.object({
    receiverName: zod.string().min(1, { message: t("validation.nameRequired") }),
    receiverPhone: zod
      .string()
      .regex(/^0[0-9]{9}$/, { message: t("validation.phoneInvalid") }),
    deliveryAddress: zod.string().min(1, { message: t("validation.addressRequired") }),
    note: zod.string().optional(),
    paymentMethod: zod.enum(["cod", "bank_transfer", "e_wallet"] as const),
  });

  type FormData = zod.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverName: "",
      receiverPhone: "",
      deliveryAddress: "",
      note: "",
      paymentMethod: "cod",
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) return;

    setSubmitting(true);

    // Map cart items to backend OrderItemInput format
    const orderItems: OrderItemInput[] = items.map((item) => {
      const toppingsPrice = item.toppings.reduce(
        (sum, t) => sum + Number(t.topping.price) * t.quantity,
        0
      );
      const unitPrice = Number(item.variant.price) + toppingsPrice;

      return {
        productId: item.product.id,
        productVariantId: item.variant.id,
        productName: item.product.name,
        size: item.variant.size,
        unitPrice: unitPrice,
        quantity: item.quantity,
        totalPrice: unitPrice * item.quantity,
        note: item.note,
        toppings: item.toppings.map((t) => ({
          toppingId: t.topping.id,
          toppingName: t.topping.name,
          unitPrice: Number(t.topping.price),
          quantity: t.quantity,
          totalPrice: Number(t.topping.price) * t.quantity,
        })),
      };
    });

    const orderData: Order = {
      storeId: selectedStoreId || 1, // Fallback to store 1
      orderType: orderType,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      deliveryAddress: data.deliveryAddress,
      subtotal: getSubtotal(),
      discountAmount: getDiscountAmount(),
      totalAmount: getTotalAmount(),
      note: data.note,
      items: orderItems,
      paymentMethod: data.paymentMethod,
    };

    try {
      // Attempt to hit Spring Boot Backend API
      await createOrder(orderData);
      toast.success(t("orderSuccess"));
      clearCart();
      router.push("/menu");
    } catch (err) {
      console.warn("Backend API not reachable. Displaying payload schema for debugging.", err);
      // Backend is offline, display the generated payload in modal to verify correctness
      setCheckoutPayload(orderData);
      setIsSuccessDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSuccess = () => {
    setIsSuccessDialogOpen(false);
    clearCart();
    router.push("/menu");
  };

  if (items.length === 0) {
    return (
      <div className="py-20 min-h-[60vh] bg-background flex flex-col items-center justify-center text-center gap-6">
        <div className="rounded-full bg-secondary p-6 text-muted-foreground/45">
          <ShoppingBag className="h-16 w-16" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-primary">{tCart("empty")}</h2>
        <Link
          href="/menu"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
        >
          {tCommon("menu")}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background min-h-screen text-left">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{tCommon("cart")}</span>
        </Link>

        <h1 className="font-heading font-extrabold text-3xl text-primary tracking-tight mb-8">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              
              {/* Shipping Address Section */}
              <div className="border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-4 text-left">
                <h3 className="font-bold text-base text-primary border-b border-border/60 pb-3">
                  {t("shippingAddress")}
                </h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{t("fullName")}</label>
                  <Input
                    {...register("receiverName")}
                    className="border-border text-xs sm:text-sm h-10"
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.receiverName && (
                    <span className="text-xs text-destructive font-semibold">{errors.receiverName.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{t("phone")}</label>
                  <Input
                    {...register("receiverPhone")}
                    className="border-border text-xs sm:text-sm h-10"
                    placeholder="0901234567"
                  />
                  {errors.receiverPhone && (
                    <span className="text-xs text-destructive font-semibold">{errors.receiverPhone.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{t("address")}</label>
                  <Input
                    {...register("deliveryAddress")}
                    className="border-border text-xs sm:text-sm h-10"
                    placeholder="123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
                  />
                  {errors.deliveryAddress && (
                    <span className="text-xs text-destructive font-semibold">{errors.deliveryAddress.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{tCart("promoCode")} ({tCommon("empty")})</label>
                  <textarea
                    {...register("note")}
                    className="w-full min-h-[80px] border border-border rounded-xl p-3 text-xs sm:text-sm focus:outline-primary/50 bg-card resize-none"
                    placeholder="Ví dụ: Ít đường, nhiều sữa..."
                  />
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-4 text-left">
                <h3 className="font-bold text-base text-primary border-b border-border/60 pb-3">
                  {t("paymentMethod")}
                </h3>
                
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 border border-border/80 rounded-xl p-3.5 hover:bg-muted/30 cursor-pointer">
                    <input
                      type="radio"
                      value="cod"
                      {...register("paymentMethod")}
                      className="accent-primary"
                    />
                    <span className="text-xs sm:text-sm font-semibold">{t("cashOnDelivery")}</span>
                  </label>

                  <label className="flex items-center gap-3 border border-border/80 rounded-xl p-3.5 hover:bg-muted/30 cursor-pointer">
                    <input
                      type="radio"
                      value="bank_transfer"
                      {...register("paymentMethod")}
                      className="accent-primary"
                    />
                    <span className="text-xs sm:text-sm font-semibold">{t("bankTransfer")}</span>
                  </label>

                  <label className="flex items-center gap-3 border border-border/80 rounded-xl p-3.5 hover:bg-muted/30 cursor-pointer">
                    <input
                      type="radio"
                      value="e_wallet"
                      {...register("paymentMethod")}
                      className="accent-primary"
                    />
                    <span className="text-xs sm:text-sm font-semibold">{t("eWallet")}</span>
                  </label>
                </div>
              </div>

              {/* Form Submission CTA */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 rounded-full font-bold text-sm"
              >
                {submitting ? tCommon("loading") : t("placeOrder")}
              </Button>

            </form>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-base text-primary border-b border-border/60 pb-3">
                {t("orderSummary")}
              </h3>

              {/* Summary Items list */}
              <div className="max-h-[220px] overflow-y-auto flex flex-col gap-3 pr-1 border-b border-border/60 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-left">
                    <div className="flex flex-col max-w-[70%]">
                      <span className="font-bold text-primary">{item.product.name} (x{item.quantity})</span>
                      <span className="text-muted-foreground text-[10px]">Size {item.variant.size}</span>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatPrice(
                        (Number(item.variant.price) +
                          item.toppings.reduce((sum, t) => sum + Number(t.topping.price) * t.quantity, 0)) *
                          item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="flex flex-col gap-2 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{tCart("subtotal")}</span>
                  <span className="font-semibold text-foreground">{formatPrice(getSubtotal())}</span>
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-accent font-semibold">
                    <span>{tCart("discount")}</span>
                    <span>-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-3 text-base font-extrabold text-primary">
                  <span>{tCommon("total")}</span>
                  <span className="text-lg font-black">{formatPrice(getTotalAmount())}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Backend Offline / Payload Inspection Modal */}
      {isSuccessDialogOpen && (
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent className="max-w-2xl bg-card text-left max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-primary">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0 animate-bounce" />
                <span>Kiểm Thử Đặt Hàng - API Offline</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                Giao diện đã chuẩn bị đầy đủ payload gửi lên API Server. Dưới đây là JSON Object đã được Zod xác thực thành công, sẵn sàng chuyển giao cho backend xử lý ghi nhận vào cơ sở dữ liệu:
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-secondary/40 p-4 rounded-xl border border-border font-mono text-[10px] text-foreground/80 overflow-x-auto my-2">
              <pre>{JSON.stringify(checkoutPayload, null, 2)}</pre>
            </div>

            <div className="flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p>
                Để tích hợp API thực, hãy khởi động Spring Boot API tại cổng <span className="font-bold">8080</span>. Khi đó, frontend sẽ tự động gửi trực tiếp đơn hàng này lên database.
              </p>
            </div>

            <Button onClick={handleDemoSuccess} className="w-full rounded-full font-bold mt-2">
              Đồng ý &amp; Làm trống Giỏ hàng
            </Button>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
