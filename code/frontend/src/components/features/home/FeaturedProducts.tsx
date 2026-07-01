"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cart.store";
import { getCategories, getProducts } from "@/services/product.service";
import { Category, Product } from "@/types";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function FeaturedProducts() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadFeaturedCatalog = async () => {
      try {
        const [productList, categoryList] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productList);
        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to load featured catalog from Backend API", error);
        setProducts([]);
        setCategories([]);
      }
    };

    void loadFeaturedCatalog();
  }, []);

  const filterCategories = categories.slice(0, 3);
  const filteredProducts = products
    .filter((product) => {
      if (activeTab === null) {
        return filterCategories.some((category) => category.id === product.categoryId);
      }
      return product.categoryId === activeTab;
    })
    .slice(0, 8);

  const handleAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      addItem(product, defaultVariant, 1, []);
      toast.success(t("product.addedToCart"));
    } else {
      toast.error(t("product.outOfStock"));
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    },
  };

  return (
    <section className="py-16 bg-[#FAF8F5] dark:bg-[#120A09]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl text-primary uppercase tracking-tight"
          >
            {t("landing.featured.title")}
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-1 bg-accent rounded-full mx-auto mt-3"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-muted-foreground mt-4 leading-relaxed"
          >
            {t("landing.featured.desc")}
          </motion.p>
        </div>

        <div className="flex justify-center space-x-1.5 sm:space-x-2 border-b border-border/40 pb-4 mb-10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab(null)}
            className={`relative px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === null ? "text-[#C8510A] font-black" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <span>{t("common.all")}</span>
            {activeTab === null && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8510A]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {filterCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`relative px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === category.id ? "text-[#C8510A] font-black" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <span>{category.name}</span>
              {activeTab === category.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8510A]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab ?? "all"}
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pr-4 md:pr-0 pb-4 md:pb-0 snap-x scrollbar-none snap-mandatory"
          >
            {filteredProducts.map((product) => {
              const displayPrice = product.variants?.[0]?.price || 0;
              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.025 }}
                  className="group min-w-[260px] sm:min-w-[280px] md:min-w-0 snap-start bg-card border border-border/80 rounded-2xl p-3 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden"
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted/40 relative shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold uppercase">
                        {product.name.slice(0, 2)}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none md:pointer-events-auto">
                      <motion.button
                        onClick={() => handleAddToCart(product)}
                        whileTap={{ scale: 0.95 }}
                        className="hidden md:flex items-center gap-1.5 bg-[#C8510A] text-white hover:bg-[#B04308] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-md translate-y-8 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer uppercase tracking-wider"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>{t("common.addToCart")}</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col justify-between flex-grow text-left">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-foreground line-clamp-1 group-hover:text-[#C8510A] transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-black text-[#C8510A] leading-none">
                        {displayPrice.toLocaleString()}d
                      </span>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="md:hidden p-2 rounded-full bg-[#C8510A] text-white hover:bg-[#B04308] transition-colors shadow-sm"
                        aria-label="Add to cart"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
