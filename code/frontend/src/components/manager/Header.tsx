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

  // Mock manager operational notifications for this branch
  const notifications = [
    { id: 1, title: "Tồn kho sắp hết", desc: "Hạt cà phê Robusta Hồ Con Rùa sắp hết hạn mức an toàn", type: "alert", time: "10 phút trước" },
    { id: 2, title: "Đơn hàng mới", desc: "Đơn hàng quầy POS-1 vừa hoàn tất thanh toán thành công", type: "order", time: "15 phút trước" }
  ];

  const getHeaderTitle = () => {
    if (pathname.includes("/dashboard")) return t("sidebar.dashboard");
    if (pathname.includes("/orders")) return t("sidebar.orders");
    if (pathname.includes("/inventory/import-notes")) return t("sidebar.importNotes");
    if (pathname.includes("/inventory/history")) return t("sidebar.stockHistory");
    if (pathname.includes("/inventory")) return t("sidebar.stockBalance");
    if (pathname.includes("/staff")) return t("sidebar.employees");
    if (pathname.includes("/shifts")) return t("sidebar.shifts");
    if (pathname.includes("/revenue")) return t("sidebar.revenue");
    if (pathname.includes("/reports")) return t("sidebar.statisticalReports");
    return t("sidebar.dashboard");
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
        return "Cửa hàng trưởng";
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    if (selectedRole === "admin" && user.roleName?.toLowerCase() === "admin") {
      router.push(`/${locale}/admin/dashboard`);
    } else if (selectedRole === "manager") {
      router.push(`/${locale}/manager/dashboard`);
    } else if (selectedRole === "pos") {
      router.push(`/${locale}/staff/pos`);
    }
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
          <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 font-outfit uppercase tracking-wider">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Quick Role Switcher */}
          <div className="flex items-center space-x-2 bg-[#FAF7F2] border border-amber-850/20 rounded-lg px-2.5 py-1.5 transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-amber-850 animate-pulse" />
            <span className="text-[9px] font-bold text-amber-900/60 uppercase whitespace-nowrap">
              {t("common.testMode")}
            </span>
            <select
              value={pathname.includes("/admin") ? "admin" : pathname.includes("/staff") ? "pos" : "manager"}
              onChange={handleRoleChange}
              className="bg-transparent text-[11px] font-extrabold text-amber-850 focus:outline-none cursor-pointer pr-1"
            >
              {user.roleName?.toLowerCase() === "admin" && (
                <option value="admin">{t("common.adminSystem")}</option>
              )}
              <option value="manager">{t("common.branchManagement")}</option>
              <option value="pos">{t("common.pos")}</option>
            </select>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notification dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-lg py-2 z-50 animate-slide-in-down">
                <div className="px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Thông báo vận hành</span>
                  <span className="text-[10px] text-amber-850 font-bold cursor-pointer hover:underline">Mới nhất</span>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-850 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{n.title}</span>
                        <span className="text-[9px] text-zinc-400 whitespace-nowrap ml-2">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.desc}</p>
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
              className="flex items-center space-x-1.5 hover:opacity-90 transition-opacity p-0.5 rounded-lg cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-amber-850 text-white flex items-center justify-center font-bold text-xs font-outfit select-none">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "M"}
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-lg py-2 z-50 animate-slide-in-down text-left">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.fullName}</p>
                  <p className="text-[10px] text-amber-850 font-bold mt-0.5">{getRoleLabel(user.roleName || "")}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleOpenAccountSettings("profile")}
                    className="w-full flex items-center px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-150/40 dark:hover:bg-zinc-850 transition-colors"
                  >
                    <UserIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => handleOpenAccountSettings("password")}
                    className="w-full flex items-center px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-150/40 dark:hover:bg-zinc-850 transition-colors"
                  >
                    <Key className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                    Đổi mật khẩu
                  </button>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5 text-rose-500" />
                    Đăng xuất
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
