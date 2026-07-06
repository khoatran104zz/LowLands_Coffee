"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const router = useRouter();

  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
  } = useCartStore();

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (items.length === 0) {
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
    <div className="py-12 bg-background min-h-screen text-left">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-heading font-extrabold text-3xl text-primary tracking-tight mb-8">
          {t("product.cart.title")}
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
                        sizes="(max-width: 640px) 96px, 80px"
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
                        {t("common.price")}
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
                        onClick={async () => {
                          const isConfirmed = await confirm({
                            title: t("common.confirmDeleteTitle"),
                            message: t("product.cart.removeConfirm"),
                            confirmText: t("common.delete"),
                            cancelText: t("common.cancel")
                          });
                          if (isConfirmed) {
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
                {t("product.cart.summary")}
              </h3>

              {/* Pricing Rows */}
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t("product.cart.subtotal")}</span>
                  <span className="font-semibold text-foreground">{formatPrice(getSubtotal())}</span>
                </div>

                <div className="flex justify-between items-center border-t border-border/60 pt-3 text-base font-extrabold text-primary">
                  <span>{t("product.cart.total")}</span>
                  <span className="text-lg font-black">{formatPrice(getSubtotal())}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full rounded-full font-bold gap-2 py-5.5 mt-2 text-sm"
              >
                <span>{t("product.cart.checkout")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
