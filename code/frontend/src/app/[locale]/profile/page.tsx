"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { updateProfile } from "@/services/auth.service";
import { getOrderHistory } from "@/services/order.service";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { ClipboardList, Settings, LogOut, ShieldAlert, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const { user, isAuthenticated, logout, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Security Check: Redirect to login if user session is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load Order History from backend database API
  useEffect(() => {
    if (isAuthenticated) {
      const loadHistory = async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
          const history = await getOrderHistory();
          setOrders(history || []);
        } catch (err) {
          console.warn("Failed to fetch order history from backend:", err);
          setHistoryError("api_not_connected");
        } finally {
          setHistoryLoading(false);
        }
      };

      loadHistory();
    }
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setProfileLoading(true);
    try {
      const updatedUser = await updateProfile({ fullName, phone });
      updateUser(updatedUser);
      toast.success(t("profileSaved"));
    } catch (err) {
      console.warn("Backend API offline. Simulating profile save locally.", err);
      if (user) {
        updateUser({ ...user, fullName, phone });
        toast.success(t("profileSaved") + " (Cục bộ)");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        {tCommon("loading")}
      </div>
    );
  }

  return (
    <div className="py-12 bg-background min-h-screen text-left">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-border/50 pb-6">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-primary tracking-tight">
              {t("profileTitle")}
            </h1>
            <div className="w-12 h-1 bg-accent rounded-full mt-3" />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 self-start"
          >
            <LogOut className="h-4 w-4" />
            <span>{tCommon("logout")}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Personal Settings Form */}
          <div className="lg:col-span-5 border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-base text-primary flex items-center gap-2 border-b border-border/60 pb-3">
              <Settings className="h-5 w-5 text-accent" />
              <span>Cập nhật Thông tin</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">{t("fullName")}</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-border text-xs sm:text-sm h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">{t("email")}</label>
                <Input
                  value={user?.email}
                  disabled
                  className="border-border bg-secondary/50 text-xs sm:text-sm h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">{t("phone")}</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-border text-xs sm:text-sm h-10"
                />
              </div>

              <Button type="submit" disabled={profileLoading} className="w-full rounded-full h-10 font-bold text-sm">
                {profileLoading ? tCommon("loading") : tCommon("save")}
              </Button>
            </form>
          </div>

          {/* Order History Listing */}
          <div className="lg:col-span-7 border border-border/85 rounded-2xl p-6 bg-card shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-base text-primary flex items-center gap-2 border-b border-border/60 pb-3">
              <ClipboardList className="h-5 w-5 text-accent" />
              <span>{t("orderHistory")}</span>
            </h3>

            {historyLoading && (
              <div className="flex flex-col gap-3 py-12 justify-center items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">{tCommon("loading")}</span>
              </div>
            )}

            {historyError === "api_not_connected" && (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-3 border border-dashed border-border rounded-xl p-6">
                <ShieldAlert className="h-8 w-8 text-accent" />
                <h4 className="text-sm font-bold text-foreground">API Lịch sử Đơn hàng Offline</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  Không thể truy xuất lịch sử đơn hàng từ máy chủ. Vui lòng kết nối database và chạy backend API Spring Boot để hiển thị lịch sử mua hàng thật của tài khoản này.
                </p>
              </div>
            )}

            {!historyLoading && !historyError && orders.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10 text-muted-foreground/35" />
                <p className="text-xs text-muted-foreground">Chưa có đơn hàng nào được ghi nhận.</p>
              </div>
            )}

            {!historyLoading && !historyError && orders.map((order) => (
              <div
                key={order.orderCode}
                className="border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/15 hover:bg-secondary/25 transition-colors text-xs"
              >
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <span>{t("orderCode")}: {order.orderCode}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium scale-90">
                      {order.status}
                    </span>
                  </div>
                  <span className="text-muted-foreground">Loại: {order.orderType === "delivery" ? "Giao hàng" : "Lấy tại quầy"}</span>
                  <span className="text-muted-foreground">Ngày mua: {order.createdAt?.split("T")[0]}</span>
                </div>
                <div className="text-right sm:text-right shrink-0 flex flex-col gap-1">
                  <span className="font-extrabold text-primary text-sm">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {order.items.length} món đồ uống
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
