"use client";

import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Product } from "@/types";
import { ArrowRight, ShoppingBag, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);

  // Get starting price from variants
  const startingPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => Number(v.price)))
    : 0;

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(startingPrice);

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      addItem(product, defaultVariant, 1, []);
      toast.success(t("product.addedToCart"));
    } else {
      toast.error(t("product.outOfStock"));
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all duration-350 hover:-translate-y-1">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square w-full bg-secondary/20 overflow-hidden">
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

        {/* Hover Slide-up Button Overlay */}
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

      {/* Info Container */}
      <div className="flex flex-col flex-grow p-4 text-left gap-2">
        <h3 className="font-heading font-bold text-base sm:text-lg text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
          {product.description || t("product.defaultDescription")}
        </p>

        {/* Pricing and Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
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
              <Plus className="h-4 w-4" />
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
