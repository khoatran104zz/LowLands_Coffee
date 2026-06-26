"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getProducts, getCategories } from "@/services/product.service";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Coffee } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/constants/mock";

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="py-12 bg-background min-h-screen flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <MenuPageInner />
    </Suspense>
  );
}

function MenuPageInner() {
  const t = useTranslations("menu");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive active selections directly from URL parameters to avoid synchronous state-in-effect warnings
  const selectedCategoryId = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : null;
  const searchQuery = searchParams.get("search") || "";

  // localSearch state is only used to control the search input UI responsively
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search input when URL changes (e.g. from header dropdown search parameters)
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
      } catch {
        console.warn("Failed to fetch menu data from backend. Loading offline fallback data.");
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setError("offline_fallback");
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
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

  // Localized helpers for mock product data in offline mode
  function getProductName(product: Product) {
    if (locale === "en" && error === "offline_fallback") {
      if (product.name === "Phin Sữa Đá") return "Iced Milk Coffee (Phin)";
      if (product.name === "Phin Đen Đá") return "Iced Black Coffee (Phin)";
      if (product.name === "Bạc Xỉu") return "Bac Xiu Coffee";
      if (product.name === "PhinĐi Hạnh Nhân") return "PhinDi Almond";
      if (product.name === "Trà Sen Vàng") return "Golden Lotus Tea";
      if (product.name === "Trà Thạch Đào") return "Peach Jelly Tea";
      if (product.name === "Trà Thanh Đào") return "Peach Lemongrass Tea";
      if (product.name === "Freeze Trà Xanh") return "Green Tea Freeze";
      if (product.name === "Freeze Cà Phê Phin") return "Coffee Freeze";
      if (product.name === "Bánh Mì Que Pate") return "Pate Stick Bread";
      if (product.name === "Bánh Phô Mai Việt Quất") return "Blueberry Cheesecake";
      if (product.name === "Cà Phê Phin Giấy Lowlands") return "Lowlands Drip Bag Coffee";
    }
    return product.name;
  }

  function getProductDescription(product: Product) {
    if (locale === "en" && error === "offline_fallback") {
      if (product.description?.includes("Robusta đậm đặc")) return "Traditional Robusta coffee brewed in phin filter with sweet condensed milk.";
      if (product.description?.includes("Cà phê đen phin")) return "Rich traditional black filter coffee for true coffee connoisseurs.";
      if (product.description?.includes("Cà phê phin hòa quyện")) return "Phin filtered coffee combined with fresh milk and condensed milk.";
      if (product.description?.includes("Sự kết hợp mới mẻ")) return "A refreshing mix of phin coffee, creamy almond milk, and chewy grass jelly.";
      if (product.description?.includes("Trà Ô Long")) return "Fragrant Oolong tea blended with rich lotus seeds and crispy water chestnut jelly.";
      if (product.description?.includes("Trà đào thơm lừng")) return "Fragrant peach tea combined with crispy pickled peach slices and peach jelly.";
      if (product.description?.includes("Trà đào thanh mát")) return "Refreshing peach tea with a perfect hint of fragrant lemongrass.";
      if (product.description?.includes("Matcha trà xanh xay")) return "Finely blended green tea matcha with rich cream, matcha jelly, and red beans.";
      if (product.description?.includes("Cà phê phin xay đá")) return "Blended phin coffee ice blended with rich cream and chewy coffee jelly.";
      if (product.description?.includes("Bánh mì que giòn")) return "Crispy stick bread stuffed with delicious rich pate, Central Vietnam style.";
      if (product.description?.includes("Bánh phô mai nướng")) return "Creamy baked cheesecake topped with sweet and sour blueberry sauce.";
      if (product.description?.includes("Hộp cà phê phin")) return "Convenient drip bag coffee box from Lowlands Coffee.";
    }
    return product.description || "";
  }

  const getCategoryName = (category: Category) => {
    if (locale === "en" && error === "offline_fallback") {
      if (category.name === "Cà Phê") return "Coffee";
      if (category.name === "Trà") return "Tea";
      if (category.name === "Khác") return "Others";
    }
    return category.name;
  };

  // Filter products by selected category and search input query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
    const nameToMatch = getProductName(product).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = nameToMatch.includes(query) || 
                          (product.description && product.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const showList = !loading && (error === null || error === "offline_fallback");

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

        {/* Offline notice banner */}
        {error === "offline_fallback" && (
          <div className="flex items-start gap-2.5 bg-accent/10 border border-accent/20 px-4 py-3 rounded-xl mb-6 max-w-7xl mx-auto shadow-xs">
            <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-foreground/80 leading-normal">
              <strong>Chế độ Xem thử (Offline):</strong> Kết nối API máy chủ đang ngoại tuyến. Danh mục sản phẩm được tải từ dữ liệu mẫu. Khởi động Spring Boot API để đồng bộ dữ liệu thực tế.
            </span>
          </div>
        )}

        {/* Filters and Search Bar Container */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-border/50">
          
          {/* Categories Tab selector (Desktop/Mobile scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => handleCategorySelect(null)}
              className="rounded-full text-xs font-bold"
              size="sm"
              disabled={error === "api_not_connected"}
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
                disabled={error === "api_not_connected"}
              >
                {getCategoryName(category)}
              </Button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-full h-10 border-border"
              disabled={loading || error === "api_not_connected"}
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

        {showList && filteredProducts.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <Coffee className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("noProducts")}</p>
          </div>
        )}

        {showList && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const translatedProduct = {
                ...product,
                name: getProductName(product),
                description: getProductDescription(product)
              };
              return <ProductCard key={product.id} product={translatedProduct} />;
            })}
          </div>
        )}

      </div>
    </div>
  );
}
