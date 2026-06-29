"use client";

import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Product } from "@/types";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();

  // Get starting price from variants
  const startingPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => Number(v.price)))
    : 0;

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(startingPrice);

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
          <Link
            href={`/menu/${product.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
