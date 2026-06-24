"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart.store";
import { getPromotions } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Ticket, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const {
    items,
    appliedPromotion,
    updateQuantity,
    removeItem,
    applyPromotion,
    getSubtotal,
    getDiscountAmount,
    getTotalAmount,
  } = useCartStore();

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Attempt to apply promotion from the backend API database
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    try {
      const promotionsList = await getPromotions();
      const matchedPromo = promotionsList.find(
        (p) => p.code.toLowerCase() === promoCode.toLowerCase() && p.status === "active"
      );

      if (matchedPromo) {
        applyPromotion(matchedPromo);
        toast.success(t("promoSuccess"));
      } else {
        toast.error(t("promoInvalid"));
      }
    } catch (err) {
      console.warn("Failed to apply promotion (API Offline):", err);
      toast.error("Không thể kết nối API khuyến mãi. Vui lòng khởi động backend Spring Boot.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    applyPromotion(null);
    setPromoCode("");
  };

  if (items.length === 0) {
    return (
      <div className="py-20 min-h-[60vh] bg-background flex flex-col items-center justify-center text-center gap-6">
        <div className="rounded-full bg-secondary p-6 text-muted-foreground/45">
          <ShoppingBag className="h-16 w-16" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-primary">{t("empty")}</h2>
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
        
        <h1 className="font-heading font-extrabold text-3xl text-primary tracking-tight mb-8">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {items.map((item) => {
              const toppingsPrice = item.toppings.reduce(
                (sum, t) => sum + Number(t.topping.price) * t.quantity,
                0
              );
              const singleItemPrice = Number(item.variant.price) + toppingsPrice;
              const totalItemPrice = singleItemPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 border border-border/80 rounded-2xl p-4 bg-card shadow-sm"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square w-24 h-24 sm:w-20 sm:h-20 bg-secondary/20 rounded-xl overflow-hidden self-center sm:self-start">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/35">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-grow flex flex-col gap-1 text-left">
                    <h3 className="font-bold text-base text-primary leading-tight">
                      {item.product.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground mt-1">
                      <span className="bg-secondary px-2.5 py-0.5 rounded-full font-bold">
                        Size {item.variant.size}
                      </span>
                      {item.toppings.map(({ topping, quantity: q }) => (
                        <span key={topping.id} className="bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                          +{topping.name} x{q}
                        </span>
                      ))}
                    </div>
                    {item.note && (
                      <p className="text-xs text-accent italic mt-1 font-medium bg-accent/5 px-2 py-1 rounded border border-accent/15">
                        * {item.note}
                      </p>
                    )}
                  </div>

                  {/* Pricing and adjustments */}
                  <div className="flex sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    
                    {/* Item Total Price */}
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground sm:hidden">
                        {tCommon("price")}
                      </span>
                      <span className="text-sm font-extrabold text-primary">
                        {formatPrice(totalItemPrice)}
                      </span>
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">
                        {formatPrice(singleItemPrice)} / ly
                      </span>
                    </div>

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-full p-0.5 bg-card">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(t("removeConfirm"))) {
                            removeItem(item.id);
                          }
                        }}
                        className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="border border-border/80 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-4">
              <h3 className="font-heading font-extrabold text-lg text-primary border-b border-border/60 pb-3">
                {t("summary")}
              </h3>

              {/* Pricing Rows */}
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold text-foreground">{formatPrice(getSubtotal())}</span>
                </div>

                {appliedPromotion && (
                  <div className="flex justify-between items-center text-accent">
                    <div className="flex items-center gap-1 font-medium">
                      <Ticket className="h-4 w-4" />
                      <span>{appliedPromotion.code}</span>
                    </div>
                    <span className="font-bold">-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-border/60 pt-3 text-base font-extrabold text-primary">
                  <span>{t("total")}</span>
                  <span className="text-lg font-black">{formatPrice(getTotalAmount())}</span>
                </div>
              </div>

              {/* Promo Code Input Form */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("promoCode")}
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="MÃ GIẢM GIÁ"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromotion || promoLoading}
                    className="h-9 uppercase text-xs"
                  />
                  {appliedPromotion ? (
                    <Button
                      variant="destructive"
                      onClick={handleRemovePromo}
                      className="h-9 px-3 text-xs"
                    >
                      Xóa
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode}
                      className="h-9 px-4 text-xs font-bold"
                    >
                      {t("applyPromo")}
                    </Button>
                  )}
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full rounded-full font-bold gap-2 py-5.5 mt-2 text-sm"
              >
                <span>{t("checkout")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* API Connection Indicator */}
            <div className="flex items-start gap-2.5 rounded-xl border border-accent/15 bg-accent/5 p-4 text-left text-xs">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-primary">Kiểm thử Khuyến Mãi</span>
                <p className="text-muted-foreground leading-relaxed">
                  Để áp dụng các mã giảm giá được cấu hình trong database, vui lòng đảm bảo API backend đã được khởi chạy.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
