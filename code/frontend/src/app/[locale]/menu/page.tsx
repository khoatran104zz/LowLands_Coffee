"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getProducts, getCategories } from "@/services/product.service";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Coffee } from "lucide-react";

export default function MenuPage() {
  const t = useTranslations("menu");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.warn("Failed to fetch menu data (API Offline):", err);
        setError("api_not_connected");
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Filter products by selected category and search input query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-left mb-10">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
            {t("title")}
          </h1>
          <div className="w-12 h-1 bg-accent rounded-full mt-3" />
        </div>

        {/* Filters and Search Bar Container */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-border/50">
          
          {/* Categories Tab selector (Desktop/Mobile scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(null)}
              className="rounded-full text-xs font-bold"
              size="sm"
              disabled={error !== null}
            >
              {t("all")}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategoryId(category.id)}
                className="rounded-full text-xs font-bold whitespace-nowrap"
                size="sm"
                disabled={error !== null}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full h-10 border-border"
              disabled={loading || error !== null}
            />
          </div>

        </div>

        {/* Main Grid display / Loading Skeletons / API disconnect Alert */}
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

        {error === "api_not_connected" && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-xl mx-auto border border-border/80 rounded-3xl bg-card shadow-sm gap-4">
            <div className="rounded-full bg-accent/15 p-4 text-accent animate-bounce">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-primary">Backend API Offline</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lowlands Coffee Frontend đang chạy độc lập. Để hiển thị thực đơn đồ uống và danh mục sản phẩm từ database, vui lòng:
            </p>
            <div className="w-full text-left bg-secondary/35 p-4 rounded-xl font-mono text-xs text-foreground/80 leading-relaxed border border-border">
              1. Di chuyển vào thư mục backend:<br />
              <span className="text-accent font-bold">cd code/backend</span><br />
              2. Khởi động Spring Boot API Server:<br />
              <span className="text-accent font-bold">./mvnw spring-boot:run</span><br />
              3. Endpoint mặc định: <span className="underline">http://localhost:8080/api/v1</span>
            </div>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <Coffee className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("noProducts")}</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
