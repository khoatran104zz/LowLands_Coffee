"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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

  // Showcase Sections Configuration with premium colors and radial flows
  const showcaseSections = [
    {
      title: "CÀ PHÊ",
      descKey: "landing.menuShowcase.coffeeDesc",
      image: "/images/menu-coffee.png",
      bgClass: "bg-[#140F0B] bg-[radial-gradient(circle_at_70%_50%,rgba(197,168,128,0.06),transparent_60%)]",
      textClass: "text-zinc-100",
      btnClass: "border-accent/40 text-accent hover:bg-accent hover:text-[#140F0B] hover:border-accent hover:shadow-[0_0_15px_rgba(197,168,128,0.3)]",
      catName: "coffee",
      imgSide: "right" as const,
      zIndexClass: "z-[10]",
      glowColor: "rgba(197,168,128,0.18)",
    },
    {
      title: "TRÀ",
      descKey: "landing.menuShowcase.teaDesc",
      image: "/images/menu-tea.png",
      bgClass: "bg-[#9FBCA8] bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]",
      textClass: "text-[#251811]",
      btnClass: "border-[#251811]/40 text-[#251811] hover:bg-[#251811] hover:text-[#9FBCA8] hover:border-[#251811] hover:shadow-[0_0_15px_rgba(37,24,17,0.15)]",
      catName: "tea",
      imgSide: "left" as const,
      zIndexClass: "z-[15]",
      glowColor: "rgba(255,255,255,0.4)",
    },
    {
      title: "FREEZE",
      descKey: "landing.menuShowcase.freezeDesc",
      image: "/images/menu-freeze.png",
      bgClass: "bg-[#B5D6DA] bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent_60%)]",
      textClass: "text-[#251811]",
      btnClass: "border-[#251811]/40 text-[#251811] hover:bg-[#251811] hover:text-[#B5D6DA] hover:border-[#251811] hover:shadow-[0_0_15px_rgba(37,24,17,0.15)]",
      catName: "freeze",
      imgSide: "right" as const,
      zIndexClass: "z-[20]",
      glowColor: "rgba(255,255,255,0.4)",
    },
    {
      title: "KHÁC",
      descKey: "landing.menuShowcase.otherDesc",
      image: "/images/menu-other-cake.png",
      bgClass: "bg-[#EBE1CD] bg-[radial-gradient(circle_at_30%_50%,rgba(197,168,128,0.12),transparent_60%)]",
      textClass: "text-[#251811]",
      btnClass: "border-[#251811]/40 text-[#251811] hover:bg-[#251811] hover:text-[#EBE1CD] hover:border-[#251811] hover:shadow-[0_0_15px_rgba(37,24,17,0.15)]",
      catName: "other",
      imgSide: "left" as const,
      zIndexClass: "z-[25]",
      glowColor: "rgba(197,168,128,0.22)",
    },
  ];

  // Grid cascade animation variants
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    },
  };

  return (
    <div className="bg-background min-h-screen overflow-visible">
      {/* SHOWCASE MODE (Highlands style featured categories overview) */}
      {isShowcaseMode && (
        <div className="flex flex-col overflow-visible select-none">
          {/* Top Intro Section */}
          <div className="py-14 bg-background border-b border-border/40 text-center relative z-30">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.h1 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight"
              >
                {t("product.menu.title")}
              </motion.h1>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="w-16 h-1 bg-accent rounded-full mx-auto mt-4" 
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium text-balance"
              >
                Khám phá thế giới hương vị của Lowlands với những dòng sản phẩm đặc trưng, trọn vẹn và đậm nét văn hóa Việt.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-6 flex justify-center gap-4"
              >
                <Button 
                  onClick={viewAllDetailed} 
                  className="rounded-full bg-accent text-accent-foreground font-extrabold hover:bg-accent/90 hover:shadow-[0_8px_25px_rgba(197,168,128,0.4)] shadow-md text-xs px-7 py-2.5 transition-all duration-300"
                >
                  Xem thực đơn đầy đủ
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Featured Sections list with clean photo cards */}
          <div className="flex flex-col overflow-visible">
            {showcaseSections.map((section, idx) => {
              const catId = getCategoryIdByName(section.catName);
              
              return (
                <ShowcaseSection
                  key={idx}
                  title={section.title}
                  desc={t(section.descKey)}
                  image={section.image}
                  bgClass={section.bgClass}
                  textClass={section.textClass}
                  btnClass={section.btnClass}
                  catId={catId}
                  imgSide={section.imgSide}
                  zIndexClass={section.zIndexClass}
                  glowColor={section.glowColor}
                  onExplore={handleCategorySelect}
                  exploreText={t("landing.menuShowcase.exploreMore")}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED LIST MODE (Traditional product card grid) */}
      {!isShowcaseMode && (
        <div className="py-12 bg-background min-h-screen relative z-10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Navigation back and header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="text-left">
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="pl-0 text-xs font-bold text-accent hover:text-accent/80 hover:bg-transparent -ml-2 transition-colors"
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

            {/* Product Card Grid with Stagger Cascade */}
            {showList && filteredProducts.length > 0 && (
              <motion.div 
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={cardItemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual showcase categories with clean photo card layout
interface ShowcaseSectionProps {
  title: string;
  desc: string;
  image: string;
  bgClass: string;
  textClass: string;
  btnClass: string;
  catId: number | null;
  imgSide: "left" | "right";
  zIndexClass: string;
  glowColor: string;
  onExplore: (catId: number | null) => void;
  exploreText: string;
}

function ShowcaseSection({
  title,
  desc,
  image,
  bgClass,
  textClass,
  btnClass,
  catId,
  imgSide,
  zIndexClass,
  glowColor,
  onExplore,
  exploreText,
}: ShowcaseSectionProps) {
  return (
    <section
      className={`relative overflow-hidden py-20 md:py-28 ${bgClass} ${zIndexClass} transition-colors duration-500`}
    >
      {/* Background glow halo centered behind where the image will hover */}
      <div 
        style={{ backgroundColor: glowColor }}
        className={`absolute top-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full blur-[110px] pointer-events-none opacity-40 z-10 ${
          imgSide === "right" ? "right-12 md:right-[15%]" : "left-12 md:left-[15%]"
        }`} 
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Image Column (Written first so it sits on top on mobile stack) */}
          <div className={`md:col-span-6 flex justify-center items-center ${
            imgSide === "left" ? "md:order-1" : "md:order-2"
          }`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
              className="w-full max-w-[400px] aspect-square rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-white/10 bg-black/5"
            >
              <motion.img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                onClick={() => onExplore(catId)}
              />
            </motion.div>
          </div>

          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
            className={`md:col-span-6 flex flex-col items-start gap-4 ${
              imgSide === "left" ? "md:order-2" : "md:order-1"
            }`}
          >
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-accent uppercase">DÒNG SẢN PHẨM</span>
            <h2 className={`font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none uppercase ${textClass}`}>
              {title}
            </h2>
            <div className="w-10 h-0.5 bg-accent" />
            <p className={`text-sm sm:text-base leading-relaxed font-medium text-balance ${
              bgClass.includes("#14") ? "text-zinc-300" : "text-[#251811]/90"
            }`}>
              {desc}
            </p>
            
            <Button
              variant="outline"
              onClick={() => onExplore(catId)}
              className={`rounded-full px-7 py-3 text-xs font-black tracking-wider bg-transparent border ${btnClass} transition-all duration-300 mt-2 cursor-pointer`}
            >
              {exploreText}
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
