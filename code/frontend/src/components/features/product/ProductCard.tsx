"use client";

import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Product, ComboSelection } from "@/types";
import { ArrowRight, ShoppingBag, ShoppingCart, Sparkles, Tag, Gift } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";
import { PRODUCT_BADGES, BADGE_STYLES } from "@/lib/productBadges";

interface ProductCardProps {
  product: Product;
  allProducts?: Product[];
}

export function ProductCard({ product, allProducts }: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);

  const isCombo = (product.comboProductIds && product.comboProductIds.length > 0) || false;
  const badge = PRODUCT_BADGES[product.id];

  // Resolve discount percentage
  const comboSavingPercent = isCombo ? Number(product.discountPercentage ?? 10) : 0;

  // Resolve original price from components if available
  const originalPrice = (() => {
    if (!isCombo) return 0;
    if (allProducts && product.comboProductIds) {
      const items = allProducts.filter((p) => product.comboProductIds?.includes(p.id));
      return items.reduce((sum, item) => {
        const sizeMVariant = item.variants?.find((v) => v.size === "M" && v.status === "active");
        const defaultVariant = sizeMVariant ?? item.variants?.find((v) => v.status === "active") ?? item.variants?.[0];
        return sum + (defaultVariant ? Number(defaultVariant.price) : 0);
      }, 0);
    }
    // Fallback to static variant price reverse math if allProducts not passed
    const base = product.variants && product.variants.length > 0
      ? Number(product.variants[0].price)
      : 0;
    return Math.round((base * (1 + 15 / 100)) / 1000) * 1000;
  })();

  const startingPrice = isCombo
    ? Math.round(originalPrice * (1 - comboSavingPercent / 100))
    : (product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v) => Number(v.price)))
      : 0);

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(startingPrice);

  const formattedOriginalPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(originalPrice);

  const translatedName = t(`product.items.${product.id}.name`, {
    defaultValue: product.name,
  });
  const translatedDesc = t(`product.items.${product.id}.description`, {
    defaultValue: product.description || t("product.defaultDescription"),
  });

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      
      if (isCombo && allProducts) {
        const comboProducts = allProducts.filter((p) => product.comboProductIds?.includes(p.id)) || [];
        const comboSelectionsArr = comboProducts.map((cp) => {
          const sizeMVariant = cp.variants?.find((v) => v.size === "M" && v.status === "active");
          const variant = sizeMVariant ?? cp.variants?.find((v) => v.status === "active") ?? cp.variants?.[0];
          return { product: cp, variant };
        }).filter((s) => s.variant != null) as ComboSelection[];

        const syntheticVariant = {
          ...defaultVariant,
          price: startingPrice
        };

        addItem(product, syntheticVariant, 1, [], "", comboSelectionsArr, comboSavingPercent);
      } else {
        addItem(product, defaultVariant, 1, []);
      }
      toast.success(t("product.addedToCart"));
    } else {
      toast.error(t("product.outOfStock"));
    }
  };

  // ─── COMBO CARD ─────────────────────────────────────────────────────────────
  if (isCombo) {
    return (
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-b from-[#2A1810] to-[#1A0F08] shadow-lg hover:shadow-[0_8px_32px_rgba(200,81,10,0.35)] transition-all duration-300 hover:-translate-y-1.5 h-full">

        {/* COMBO ribbon top-left */}
        <div className="absolute top-0 left-0 z-20 overflow-hidden w-20 h-20 pointer-events-none">
          <div className="absolute -left-5 top-3 rotate-[-45deg] bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-wider px-8 py-1 shadow-md">
            COMBO
          </div>
        </div>

        {/* Savings badge top-right */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full shadow-md">
          <Tag className="h-2.5 w-2.5" />
          -{comboSavingPercent}%
        </div>

        {/* Product Image — fixed square aspect */}
        <div className="relative aspect-square w-full overflow-hidden bg-black/30 shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-amber-500/30">
              <Gift className="h-12 w-12" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none md:pointer-events-auto">
            <button
              onClick={handleAddToCart}
              className="hidden md:flex items-center gap-1.5 bg-amber-500 text-[#1A0F08] hover:bg-amber-400 text-xs font-extrabold px-5 py-2.5 rounded-full shadow-md translate-y-6 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer uppercase tracking-wider"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{t("common.addToCart")}</span>
            </button>
          </div>
        </div>

        {/* Info — flex-grow to fill remaining height */}
        <div className="flex flex-col flex-grow p-3 sm:p-4 gap-1.5">
          {/* Deal pill */}
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap">
              <Sparkles className="h-2 w-2 shrink-0" />
              Giá hời!
            </span>
          </div>

          <h3 className="font-heading font-bold text-sm text-amber-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
            {translatedName}
          </h3>

          <p className="text-[11px] text-amber-100/45 line-clamp-2 leading-relaxed flex-grow">
            {translatedDesc}
          </p>

          {/* Price row — always at bottom */}
          <div className="flex items-center justify-between pt-2.5 border-t border-amber-400/15 mt-auto">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-red-400/70 line-through font-semibold">
                {formattedOriginalPrice}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-amber-400 leading-tight">
                {formattedPrice}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleAddToCart}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-[#1A0F08] hover:bg-amber-400 transition-all duration-300"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </button>
              <Link
                href={`/menu/${product.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-400 hover:bg-amber-500 hover:text-[#1A0F08] transition-all duration-300"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── REGULAR CARD ────────────────────────────────────────────────────────────
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 h-full">

      {/* Badge overlay (top-left) */}
      {badge && (
        <div className={`absolute top-2.5 left-2.5 z-20 flex items-center gap-1 text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full shadow-md ${BADGE_STYLES[badge.type]}`}>
          {t(badge.labelKey)}
        </div>
      )}

      {/* Product Image — fixed square aspect */}
      <div className="relative aspect-square w-full bg-secondary/20 overflow-hidden shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/40 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 opacity-30" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none md:pointer-events-auto">
          <button
            onClick={handleAddToCart}
            className="hidden md:flex items-center gap-1.5 bg-[#C8510A] text-white hover:bg-[#B04308] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-md translate-y-8 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer uppercase tracking-wider"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{t("common.addToCart")}</span>
          </button>
        </div>
      </div>

      {/* Info Container — flex-grow to fill remaining height */}
      <div className="flex flex-col flex-grow p-4 text-left gap-2">
        <h3 className="font-heading font-bold text-base sm:text-lg text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">
          {translatedName}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-grow">
          {translatedDesc}
        </p>

        {/* Pricing and Action — always at bottom */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t("common.price")}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-primary">
              {formattedPrice}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 hover:bg-[#C8510A] hover:text-white"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            <Link
              href={`/menu/${product.id}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
