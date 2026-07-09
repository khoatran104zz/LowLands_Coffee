"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { useCartStore } from "@/store/cart.store";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Gift, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

// ─── Combo Cart Item ──────────────────────────────────────────────────────────
function ComboCartItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const comboPrice = Number(item.variant.price);
  const savingsPct = item.comboDiscountPercent ?? 0;

  // Calculate original price from comboSelections
  const originalPrice = item.comboSelections
    ? item.comboSelections.reduce((sum, s) => sum + Number(s.variant.price), 0)
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/60 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/20 shadow-md shadow-amber-200/30 dark:shadow-amber-900/20">
      {/* Glow accent line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />

      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="relative aspect-square w-20 h-20 shrink-0 self-center sm:self-start">
          <div className="absolute inset-0 rounded-xl overflow-hidden border border-amber-300/50">
            {item.product.imageUrl ? (
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-400">
                <Gift className="h-8 w-8" />
              </div>
            )}
          </div>
          {/* COMBO badge on image */}
          <div className="absolute -top-1.5 -left-1.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shadow-sm">
            COMBO
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-primary leading-tight">
                {item.product.name}
              </h3>
              {/* Savings badge */}
              {savingsPct > 0 && (
                <div className="inline-flex items-center gap-1 mt-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-green-400/40">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Tiết kiệm {savingsPct}%</span>
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="text-right shrink-0">
              <div className="text-base font-black text-primary">
                {formatPrice(comboPrice * item.quantity)}
              </div>
              {item.quantity > 1 && (
                <div className="text-[10px] text-muted-foreground font-semibold">
                  {formatPrice(comboPrice)} / combo
                </div>
              )}
              {originalPrice > comboPrice && (
                <div className="text-[10px] text-muted-foreground line-through font-semibold">
                  {formatPrice(originalPrice * item.quantity)}
                </div>
              )}
            </div>
          </div>

          {/* Combo items list (collapsible) */}
          {item.comboSelections && item.comboSelections.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors"
              >
                <Gift className="h-3 w-3" />
                <span>{item.comboSelections.length} món trong combo</span>
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {expanded && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {item.comboSelections.map((sel) => {
                    const itemOriginalPrice = Number(sel.variant.price);
                    return (
                      <div
                        key={`${sel.product.id}-${sel.variant.id}`}
                        className="flex items-center gap-2 text-xs"
                      >
                        {/* Thumbnail */}
                        {sel.product.imageUrl && (
                          <div className="w-6 h-6 rounded-md overflow-hidden border border-amber-300/40 shrink-0">
                            <img
                              src={sel.product.imageUrl}
                              alt={sel.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="font-semibold text-foreground/85 truncate flex-1">
                          {sel.product.name}
                        </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">
                          Size {sel.variant.size}
                        </span>
                        <span className="text-muted-foreground line-through font-semibold shrink-0">
                          {formatPrice(itemOriginalPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Note */}
          {item.note && (
            <p className="text-xs text-amber-700 dark:text-amber-400 italic mt-2 font-medium bg-amber-100/60 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200/60">
              * {item.note}
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-300/40">
            <div className="flex items-center border border-amber-300/60 rounded-full p-0.5 bg-white/60 dark:bg-black/20">
              <button
                onClick={() => onUpdate(item.id, item.quantity - 1)}
                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 text-muted-foreground"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-primary">{item.quantity}</span>
              <button
                onClick={() => onUpdate(item.id, item.quantity + 1)}
                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 text-muted-foreground"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Regular Cart Item ────────────────────────────────────────────────────────
function RegularCartItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  const toppingsPrice = item.toppings.reduce(
    (sum, t) => sum + Number(t.topping.price) * t.quantity,
    0
  );
  const singleItemPrice = Number(item.variant.price) + toppingsPrice;
  const totalItemPrice = singleItemPrice * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 border border-border/80 rounded-2xl p-4 bg-card shadow-sm">
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
          {t(`product.items.${item.product.id}.name`, { defaultValue: item.product.name })}
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

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-full p-0.5 bg-card">
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-primary">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const router = useRouter();

  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();

  // Combo savings calculation
  const totalComboPriceInCart = items
    .filter((item) => item.comboSelections && item.comboSelections.length > 0)
    .reduce((sum, item) => {
      const originalPrice = item.comboSelections!.reduce(
        (s, sel) => s + Number(sel.variant.price),
        0
      );
      const discountedPrice = Number(item.variant.price);
      return sum + (originalPrice - discountedPrice) * item.quantity;
    }, 0);

  const handleRemove = async (itemId: string) => {
    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle"),
      message: t("product.cart.removeConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    });
    if (isConfirmed) removeItem(itemId);
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
              const isCombo = (item.comboSelections?.length ?? 0) > 0;
              return isCombo ? (
                <ComboCartItem
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={handleRemove}
                />
              ) : (
                <RegularCartItem
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={handleRemove}
                />
              );
            })}

            {/* Combo savings banner (if any combos in cart) */}
            {totalComboPriceInCart > 0 && (
              <div className="rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-950/30 dark:to-green-950/20 p-4 flex items-center gap-3">
                <div className="rounded-full bg-emerald-500 p-2 text-white shrink-0 shadow-md shadow-emerald-400/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    🎉 Bạn đã tiết kiệm được
                  </p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatPrice(totalComboPriceInCart)}
                  </p>
                  <p className="text-[11px] text-emerald-600/70 dark:text-emerald-500/70 font-semibold">
                    so với mua từng món riêng lẻ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="border border-border/80 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-4">
              <h3 className="font-heading font-extrabold text-lg text-primary border-b border-border/60 pb-3">
                {t("product.cart.summary")}
              </h3>

              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t("product.cart.subtotal")}</span>
                  <span className="font-semibold text-foreground">{formatPrice(getSubtotal())}</span>
                </div>

                {totalComboPriceInCart > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Tiết kiệm từ combo
                    </span>
                    <span className="font-extrabold">-{formatPrice(totalComboPriceInCart)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-border/60 pt-3 text-base font-extrabold text-primary">
                  <span>{t("product.cart.total")}</span>
                  <span className="text-lg font-black">{formatPrice(getSubtotal())}</span>
                </div>
              </div>

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
