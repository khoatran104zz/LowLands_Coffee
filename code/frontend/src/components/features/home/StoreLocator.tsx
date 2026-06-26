"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getStores } from "@/services/auth.service";
import { Store } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Search, AlertCircle } from "lucide-react";

const MOCK_STORES: Store[] = [
  {
    id: 1,
    name: "Lowlands Coffee - Nhà Thờ Lớn",
    address: "2 Nhà Thờ, Hàng Trống, Hoàn Kiếm, Hà Nội",
    phone: "024 3938 2112",
    status: "active",
  },
  {
    id: 2,
    name: "Lowlands Coffee - Hàm Cá Mập",
    address: "1-3-5 Đinh Tiên Hoàng, Hàng Bạc, Hoàn Kiếm, Hà Nội",
    phone: "024 3926 2728",
    status: "active",
  },
  {
    id: 3,
    name: "Lowlands Coffee - Lê Lợi",
    address: "65 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    phone: "028 3821 6789",
    status: "active",
  },
  {
    id: 4,
    name: "Lowlands Coffee - Bạch Đằng",
    address: "180 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng",
    phone: "0236 3849 777",
    status: "active",
  }
];

export function StoreLocator() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load stores from API
    const loadStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStores();
        setStores(data || []);
      } catch {
        // Quiet warn to keep Next.js dev server terminal clean and satisfy eslint rules
        console.warn("Backend API offline. Loading fallback mock stores.");
        setStores(MOCK_STORES);
        setError("offline_fallback");
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showList = !loading && (error === null || error === "offline_fallback");

  return (
    <section id="store-locator" className="py-20 bg-background scroll-mt-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-extrabold text-3xl text-primary tracking-tight">
            {t("locatorTitle")}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            {t("locatorDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Search bar & list */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchStorePlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={loading || error === "api_not_connected"}
                />
              </div>
              <Button variant="default">
                {t("findStoreButton")}
              </Button>
            </div>

            {/* Store Listing area */}
            <div className="max-h-[400px] overflow-y-auto border border-border rounded-xl p-4 flex flex-col gap-4 bg-card shadow-sm">
              {loading && (
                <div className="flex flex-col gap-3 py-6 justify-center items-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs text-muted-foreground">{tCommon("loading")}</span>
                </div>
              )}

              {error === "offline_fallback" && (
                <div className="flex items-start gap-2 bg-accent/10 border border-accent/20 px-3 py-2.5 rounded-lg mb-1">
                  <AlertCircle className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-xs leading-normal text-foreground/80">
                    <strong>Chế độ Xem thử:</strong> API offline. Đang hiển thị danh sách cửa hàng mẫu. Khởi động Spring Boot API để đồng bộ.
                  </span>
                </div>
              )}

              {error === "api_not_connected" && (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-3">
                  <AlertCircle className="h-8 w-8 text-accent animate-bounce" />
                  <h4 className="text-sm font-bold text-foreground">API Backend Pending Integration</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hệ thống đang chạy chế độ phát triển Frontend độc lập. Vui lòng kết nối và khởi động Spring Boot API để truy xuất danh sách cửa hàng trực tiếp từ database.
                  </p>
                </div>
              )}

              {showList && filteredStores.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {tCommon("empty")}
                </p>
              )}

              {showList && filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="border-b border-border/60 pb-3 last:border-0 last:pb-0 text-left hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <h4 className="text-sm font-bold text-primary">{store.name}</h4>
                  <div className="flex gap-2 items-start text-xs text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4 shrink-0 text-accent" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs text-muted-foreground mt-1">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>{store.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Placeholder Map (Visual Excellence) */}
          <div className="lg:col-span-7 h-[458px] border border-border rounded-xl overflow-hidden relative shadow-sm">
            <div className="absolute inset-0 bg-secondary/15 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-primary uppercase tracking-wider">Lowlands Interactive Map</h4>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                Bản đồ định vị cửa hàng trực quan sẽ hiển thị tại đây khi hệ thống định vị chi nhánh được cấu hình.
              </p>
              <div className="absolute bottom-4 right-4 bg-card border border-border px-3 py-1.5 rounded-lg text-[10px] text-muted-foreground shadow-sm">
                Next.js Map Integration Ready
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
