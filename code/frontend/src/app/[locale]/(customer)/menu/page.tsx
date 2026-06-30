"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getProducts, getCategories } from "@/services/product.service";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Coffee, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 bg-background min-h-screen flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <MenuPageInner />
    </Suspense>
  );
}

function MenuPageInner() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryId = searchParams.get("category")
    ? parseInt(searchParams.get("category")!, 10)
    : null;
  const searchQuery = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // If no category is selected, no search query is present, and we don't have view=all, show showcase mode.
  const isShowcaseMode = selectedCategoryId === null && searchQuery === "" && searchParams.get("view") !== "all";

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const timer = setTimeout(() => {
      setLocalSearch(search);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    const loadMenuData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch (loadError) {
        console.error("Failed to fetch menu data from backend", loadError);
        setProducts([]);
        setCategories([]);
        setError("api_error");
      } finally {
        setLoading(false);
      }
    };

    void loadMenuData();
  }, []);

  const handleCategorySelect = (categoryId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view"); // Remove view=all if we filter by category
    if (categoryId === null) {
      params.delete("category");
      params.set("view", "all"); // If "All" clicked, show all in detailed list
    } else {
      params.set("category", categoryId.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    if (!value) {
      params.delete("search");
    } else {
      params.set("search", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const viewAllDetailed = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "all");
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (name: string) => {
    switch (name.toLowerCase()) {
      case "coffee":
        return t("common.coffee");
      case "tea":
        return t("common.tea");
      case "freeze":
        return t("common.freeze");
      case "other":
      case "khác":
        return t("common.other");
      default:
        return name;
    }
  };

  const getCategoryIdByName = (name: string) => {
    const match = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() || 
             (name === "coffee" && c.name.toLowerCase() === "cà phê") ||
             (name === "other" && c.name.toLowerCase() === "khác")
    );
    return match ? match.id : null;
  };

  const showList = !loading && error === null;

  // Showcase Sections Configuration
  const showcaseSections = [
    {
      title: "CÀ PHÊ",
      descKey: "landing.menuShowcase.coffeeDesc",
      image: "/images/menu-coffee.png",
      bgClass: "bg-[#0E0E0E]",
      textClass: "text-white",
      btnClass: "border-white/30 text-white hover:bg-white hover:text-black hover:border-white",
      catName: "coffee",
      imgSide: "right" as const,
      zIndexClass: "z-[10]",
    },
    {
      title: "TRÀ",
      descKey: "landing.menuShowcase.teaDesc",
      image: "/images/menu-tea.png",
      bgClass: "bg-[#A3C2B0]",
      textClass: "text-[#2D1A19]",
      btnClass: "border-[#2D1A19]/30 text-[#2D1A19] hover:bg-[#2D1A19] hover:text-[#A3C2B0] hover:border-[#2D1A19]",
      catName: "tea",
      imgSide: "left" as const,
      zIndexClass: "z-[15]",
    },
    {
      title: "FREEZE",
      descKey: "landing.menuShowcase.freezeDesc",
      image: "/images/menu-freeze.png",
      bgClass: "bg-[#C6DFE2]",
      textClass: "text-[#2D1A19]",
      btnClass: "border-[#2D1A19]/30 text-[#2D1A19] hover:bg-[#2D1A19] hover:text-[#C6DFE2] hover:border-[#2D1A19]",
      catName: "freeze",
      imgSide: "right" as const,
      zIndexClass: "z-[20]",
    },
    {
      title: "KHÁC",
      descKey: "landing.menuShowcase.otherDesc",
      image: "/images/menu-other-cake.png",
      bgClass: "bg-[#EFE7D3]",
      textClass: "text-[#2D1A19]",
      btnClass: "border-[#2D1A19]/30 text-[#2D1A19] hover:bg-[#2D1A19] hover:text-[#EFE7D3] hover:border-[#2D1A19]",
      catName: "other",
      imgSide: "left" as const,
      zIndexClass: "z-[25]",
    },
  ];

  return (
    <div className="bg-background min-h-screen overflow-visible">
      {/* SHOWCASE MODE (Highlands style featured slides) */}
      {isShowcaseMode && (
        <div className="flex flex-col overflow-visible select-none">
          {/* Top Intro Section */}
          <div className="py-12 bg-background border-b border-border/40 text-center relative z-30">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight"
              >
                {t("product.menu.title")}
              </motion.h1>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-16 h-1 bg-accent rounded-full mx-auto mt-4" 
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto"
              >
                Khám phá thế giới hương vị của Lowlands với những dòng sản phẩm đặc trưng, trọn vẹn và đậm nét văn hóa Việt.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 flex justify-center gap-4"
              >
                <Button 
                  onClick={viewAllDetailed} 
                  className="rounded-full bg-accent text-accent-foreground font-extrabold hover:bg-accent/90 shadow-md text-xs px-6 py-2"
                >
                  Xem thực đơn đầy đủ
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Featured Sections list with overlapping visual elements */}
          <div className="flex flex-col overflow-visible">
            {showcaseSections.map((section, idx) => {
              const catId = getCategoryIdByName(section.catName);
              
              return (
                <section
                  key={idx}
                  className={`relative overflow-visible py-20 md:py-28 ${section.bgClass} ${section.zIndexClass}`}
                >
                  <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative overflow-visible">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[280px] md:min-h-[360px]">
                      
                      {/* Text Box */}
                      <motion.div
                        initial={{ opacity: 0, x: section.imgSide === "right" ? -40 : 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className={`md:col-span-6 flex flex-col items-start gap-4 z-30 ${
                          section.imgSide === "left" ? "md:col-start-7" : ""
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs font-black tracking-widest text-accent uppercase">DÒNG SẢN PHẨM</span>
                        <h2 className={`font-heading font-black text-4xl sm:text-5xl tracking-tight leading-none ${section.textClass}`}>
                          {section.title}
                        </h2>
                        <div className="w-10 h-0.5 bg-accent" />
                        <p className={`text-sm sm:text-base leading-relaxed font-medium text-balance ${
                          section.bgClass === "bg-[#0E0E0E]" ? "text-zinc-300" : "text-[#2D1A19]/90"
                        }`}>
                          {t(section.descKey)}
                        </p>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleCategorySelect(catId)}
                          className={`rounded-full px-6 py-2.5 text-xs font-black tracking-wider bg-transparent border ${section.btnClass} transition-all duration-300 mt-2`}
                        >
                          {t("landing.menuShowcase.exploreMore")}
                        </Button>
                      </motion.div>

                      {/* Overlapping Glass Image */}
                      <div className={`absolute top-1/2 -translate-y-1/2 w-full md:w-1/2 h-[420px] md:h-[520px] z-20 pointer-events-none flex justify-center items-center ${
                        section.imgSide === "right" ? "right-0 md:right-[5%]" : "left-0 md:left-[5%]"
                      }`}>
                        <motion.img
                          initial={{ opacity: 0, scale: 0.9, y: 30 }}
                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ type: "spring", damping: 20, stiffness: 60 }}
                          src={section.image}
                          alt={section.title}
                          className="w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] h-[340px] sm:h-[400px] md:h-[460px] lg:h-[500px] object-contain hover:scale-105 transition-transform duration-500 pointer-events-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.4)]"
                        />
                      </div>

                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED LIST MODE (Traditional product grid with filters) */}
      {!isShowcaseMode && (
        <div className="py-12 bg-background min-h-screen relative z-10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Navigation back and header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="text-left">
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="pl-0 text-xs font-bold text-accent hover:text-accent/80 hover:bg-transparent -ml-2"
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  {t("landing.menuShowcase.backToShowcase")}
                </Button>
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight mt-1">
                  {selectedCategoryId !== null 
                    ? getCategoryName(categories.find(c => c.id === selectedCategoryId)?.name || "") 
                    : t("product.menu.title")}
                </h1>
                <div className="w-12 h-1 bg-accent rounded-full mt-3" />
              </div>
            </div>

            {/* Filter buttons and Search bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-border/50">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                <Button
                  variant={selectedCategoryId === null ? "default" : "outline"}
                  onClick={() => handleCategorySelect(null)}
                  className="rounded-full text-xs font-bold whitespace-nowrap"
                  size="sm"
                  disabled={error !== null}
                >
                  {t("product.menu.all")}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    onClick={() => handleCategorySelect(category.id)}
                    className="rounded-full text-xs font-bold whitespace-nowrap"
                    size="sm"
                    disabled={error !== null}
                  >
                    {getCategoryName(category.name)}
                  </Button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("product.menu.searchPlaceholder")}
                  value={localSearch}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="pl-9 rounded-full h-10 border-border"
                  disabled={loading || error !== null}
                />
              </div>
            </div>

            {/* Loading Grid */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4 bg-card animate-pulse">
                    <div className="aspect-square w-full rounded-xl bg-muted" />
                    <div className="h-4 w-2/3 rounded bg-muted mt-2" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-8 w-full rounded bg-muted mt-3" />
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error === "api_error" && (
              <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-xl mx-auto border border-border/80 rounded-3xl bg-card shadow-sm gap-4">
                <div className="rounded-full bg-accent/15 p-4 text-accent">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-primary">{t("product.menu.apiErrorTitle")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("product.menu.apiErrorDesc")}
                </p>
                <div className="w-full text-left bg-secondary/35 p-4 rounded-xl font-mono text-xs text-foreground/80 leading-relaxed border border-border">
                  GET http://localhost:8080/api/v1/products
                </div>
              </div>
            )}

            {/* No Products Found */}
            {showList && filteredProducts.length === 0 && (
              <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
                <Coffee className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">{t("product.menu.noProducts")}</p>
              </div>
            )}

            {/* Product Card Grid */}
            {showList && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
