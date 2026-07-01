import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, User as UserIcon, LogOut, Key, Sparkles, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { LanguageSwitcher } from "@/components/features/layout/LanguageSwitcher";
import { AccountModal } from "../account/AccountModal";

interface HeaderProps {
  locale: string;
  onOpenMobileSidebar: () => void;
}

export function Header({ locale, onOpenMobileSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const confirm = useConfirm();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState("profile");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  // Mock operational notifications
  const notifications = [
    { id: 1, title: "Cảnh báo kho hàng", desc: "Hạt sen ngâm syrup đã hết hàng hoàn toàn!", type: "alert", time: "5 phút trước" },
    { id: 2, title: "Đơn hàng mới", desc: "Đơn hàng LL-103 chờ xác nhận thanh toán chuyển khoản", type: "order", time: "12 phút trước" },
    { id: 3, title: "Mức tồn kho thấp", desc: "Sữa tươi Đà Lạt Milk 950ml sắp chạm ngưỡng cảnh báo", type: "warning", time: "1 giờ trước" }
  ];

  const getHeaderTitle = () => {
    if (pathname.includes("/dashboard")) return t("common.dashboard");
    if (pathname.includes("/branches")) return t("common.branches");
    if (pathname.includes("/products")) return t("common.products");
    if (pathname.includes("/categories")) return t("common.categories");
    if (pathname.includes("/toppings")) return t("common.toppings");
    if (pathname.includes("/employees")) return t("common.employees");
    if (pathname.includes("/customers")) return t("common.customers");
    if (pathname.includes("/orders")) return t("common.orders");
    if (pathname.includes("/promotions")) return t("common.promotions");
    if (pathname.includes("/reports")) return "Báo cáo thống kê";
    if (pathname.includes("/ingredients")) return "Danh mục Nguyên liệu";
    if (pathname.includes("/suppliers")) return "Danh sách Nhà cung cấp";
    if (pathname.includes("/import-notes")) return "Quản lý Phiếu nhập kho";
    if (pathname.includes("/stock")) return "Quản lý Tồn kho";
    if (pathname.includes("/recipes")) return "Quản lý Công thức";
    return t("common.dashboard");
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName?.toUpperCase()) {
      case "ADMIN":
        return "Admin Hệ Thống";
      case "MANAGER":
        return "Cửa hàng trưởng";
      case "STAFF":
        return "Nhân viên quầy";
      default:
        return "Quản trị viên";
    }
  };

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: t("common.confirmLogoutTitle"),
      message: t("common.confirmLogoutMessage"),
      confirmText: t("common.logout"),
      cancelText: t("common.cancel")
    });
    if (isConfirmed) {
      logout();
      router.push(`/${locale}/portal/login`);
    }
  };

  const handleOpenAccountSettings = (tab = "profile") => {
    setAccountTab(tab);
    setIsAccountOpen(true);
  };

  return (
    <>
      <header className="h-16 border-b border-zinc-200 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shadow-2xs shrink-0 select-none">
        {/* Mobile menu toggle & page title */}
        <div className="flex items-center space-x-3 text-left">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden text-zinc-500 hover:text-zinc-800 transition-colors p-1"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-zinc-800 dark:text-zinc-200 font-outfit uppercase tracking-wide leading-tight">
              {getHeaderTitle()}
            </h2>
            <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">
              Lowlands Coffee F&B System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Operational Notifications Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer border border-zinc-150"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden text-left p-1">
                <div className="px-4 py-2.5 border-b border-zinc-100 select-none flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide font-outfit">Thông báo vận hành</span>
                  <span className="text-[9px] font-bold text-[#c8510a] bg-amber-50 px-2 py-0.5 rounded-full select-none">Mới</span>
                </div>
                <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "alert" ? "text-rose-600" : item.type === "warning" ? "text-amber-600" : "text-amber-800"
                        }`}>{item.title}</span>
                        <span className="text-[9px] text-zinc-400 font-semibold">{item.time}</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 p-1 pr-3 bg-zinc-50/50 hover:bg-zinc-100/70 border border-zinc-200 dark:border-zinc-800 rounded-full transition-all duration-200 focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-amber-850 text-[#f7f2ed] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 select-none uppercase">
                {user.fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="hidden sm:block text-left select-none">
                <span className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                  {user.fullName}
                </span>
                <span className="block text-[9px] text-zinc-400 font-bold uppercase leading-none mt-0.5 tracking-wider">
                  {getRoleLabel(user.roleName || "")}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden p-1 text-left">
                <div className="px-4 py-3 border-b border-zinc-100 mb-1 select-none">
                  <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {user.fullName}
                  </span>
                  <span className="block text-[9px] text-zinc-400 mt-0.5 truncate font-semibold uppercase">
                    {getRoleLabel(user.roleName || "")}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleOpenAccountSettings("profile");
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Thông tin tài khoản</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleOpenAccountSettings("security");
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                  >
                    <Key className="h-3.5 w-3.5" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <div className="border-t border-zinc-100 my-1" />
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t("common.logout")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Account Settings Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        defaultTab={accountTab}
      />
    </>
  );
}
