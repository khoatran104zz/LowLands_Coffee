"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { getCategories, getProducts } from "@/services/product.service";
import { Category, Product } from "@/types";
import { ArrowRight, Gift, Sparkles, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function FeaturedCombos() {
  const { t } = useTranslation();
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCombos = async () => {
      try {
        const [productList, categoryList] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setAllProducts(productList || []);
        
        // Find category Combo
        const comboCategory = categoryList.find(
          (c) => c.name.toLowerCase() === "combo"
        );
        
        if (comboCategory) {
          const filtered = productList.filter(
            (p) => p.categoryId === comboCategory.id && p.status === "active"
          );
          setComboProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to load featured combos", err);
      } finally {
        setLoading(false);
      }
    };

    void loadCombos();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading || comboProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#FAF8F5] via-[#F2EDE4] to-[#FAF8F5] dark:from-[#120A09] dark:via-[#1A0F0D] dark:to-[#120A09] overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Glow decorative circles */}
        <div className="absolute top-1/4 -left-36 w-72 h-72 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-36 w-72 h-72 rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-3xl" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="h-3 w-3" />
            <span>Ưu Đãi Đặc Biệt</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight uppercase leading-tight"
          >
            🔥 SIÊU COMBO TIẾT KIỆM 🔥
          </motion.h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto font-semibold">
            Thưởng thức sự kết hợp hoàn hảo giữa đồ uống đậm đà và bánh ngọt thơm ngon với mức giá ưu đãi cực khủng, tiết kiệm lên đến 20%!
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mt-6" />
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {comboProducts.map((combo, idx) => {
            const discount = combo.discountPercentage || 10;
            
            // Find component products inside the combo
            const items = allProducts.filter((p) =>
              combo.comboProductIds?.includes(p.id)
            );

            // Compute default original price (sum of default M variants)
            const originalPrice = items.reduce((sum, item) => {
              const defaultVariant = item.variants?.find((v) => v.size === "M") || item.variants?.[0];
              return sum + (defaultVariant ? Number(defaultVariant.price) : 0);
            }, 0);

            // Combo price
            const comboPrice = Math.round(originalPrice * (1 - discount / 100));
            const savedAmount = originalPrice - comboPrice;

            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group relative rounded-3xl border border-amber-300/40 dark:border-amber-900/30 bg-card/60 dark:bg-card/20 backdrop-blur-md hover:bg-card dark:hover:bg-card/40 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col sm:flex-row min-h-[280px]"
              >
                {/* Sale tag */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>-{discount}%</span>
                  </div>
                  {savedAmount > 0 && (
                    <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-sm">
                      Tiết kiệm {formatPrice(savedAmount)}
                    </div>
                  )}
                </div>

                {/* Left side: Image */}
                <div className="relative aspect-[4/3] sm:aspect-square w-full sm:w-2/5 md:w-5/12 bg-muted overflow-hidden shrink-0">
                  {combo.imageUrl ? (
                    <img
                      src={combo.imageUrl}
                      alt={combo.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/35">
                      <Gift className="h-12 w-12" />
                    </div>
                  )}
                  {/* Decorative soft mask */}
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-transparent to-card/10" />
                </div>

                {/* Right side: Details */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow text-left relative z-10">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-heading font-black text-xl text-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                        {combo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">
                        {combo.description}
                      </p>
                    </div>

                    {/* Component items connector visualizer */}
                    {items.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                          Món đi kèm trong Combo
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {items.map((item, itemIdx) => (
                            <React.Fragment key={item.id}>
                              {itemIdx > 0 && (
                                <span className="text-amber-500 font-black text-sm shrink-0">
                                  +
                                </span>
                              )}
                              <div className="inline-flex items-center gap-1.5 bg-secondary/40 dark:bg-secondary/10 border border-border/40 px-2.5 py-1 rounded-full text-xs font-bold text-foreground">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                )}
                                <span>{item.name}</span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                        Giá trọn gói từ
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-primary leading-none">
                          {formatPrice(comboPrice || Number(combo.variants?.[0]?.price) || 0)}
                        </span>
                        {originalPrice > comboPrice && (
                          <span className="text-xs text-muted-foreground line-through font-semibold">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={`/menu/${combo.id}`}>
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black px-4 py-3 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer uppercase tracking-wider group-hover:translate-x-1">
                        <span>Chọn Món</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
