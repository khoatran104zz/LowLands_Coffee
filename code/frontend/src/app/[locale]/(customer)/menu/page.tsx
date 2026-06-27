"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getProducts, getCategories } from "@/services/product.service";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Coffee } from "lucide-react";

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
  const t = useTranslations("menu");
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
    if (categoryId === null) {
      params.delete("category");
    } else {
      params.set("category", categoryId.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("search");
    } else {
      params.set("search", value);
    }
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

  const showList = !loading && error === null;

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
            {t("title")}
          </h1>
          <div className="w-12 h-1 bg-accent rounded-full mt-3" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-border/50">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => handleCategorySelect(null)}
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
                onClick={() => handleCategorySelect(category.id)}
                className="rounded-full text-xs font-bold whitespace-nowrap"
                size="sm"
                disabled={error !== null}
              >
                {category.name}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={localSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9 rounded-full h-10 border-border"
              disabled={loading || error !== null}
            />
          </div>
        </div>

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

        {error === "api_error" && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-xl mx-auto border border-border/80 rounded-3xl bg-card shadow-sm gap-4">
            <div className="rounded-full bg-accent/15 p-4 text-accent">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-primary">Backend API error</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Không thể tải sản phẩm từ backend API. Frontend không dùng mock product thay thế, vui lòng kiểm tra Spring Boot API và seed data.
            </p>
            <div className="w-full text-left bg-secondary/35 p-4 rounded-xl font-mono text-xs text-foreground/80 leading-relaxed border border-border">
              GET http://localhost:8080/api/v1/products
            </div>
          </div>
        )}

        {showList && filteredProducts.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <Coffee className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("noProducts")}</p>
          </div>
        )}

        {showList && filteredProducts.length > 0 && (
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
