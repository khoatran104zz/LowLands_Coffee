import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, User as UserIcon, LogOut, Key, ChevronDown } from "lucide-react";
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
    { id: 1, title: t("manager.header.notifLowStock"), desc: t("manager.header.notifLowStockDesc"), type: "alert", time: "10m" },
    { id: 2, title: t("manager.header.notifNewOrder"), desc: t("manager.header.notifNewOrderDesc"), type: "order", time: "15m" }
  ];

  const getHeaderTitle = () => {
    if (pathname.includes("/dashboard")) return t("common.sidebar.dashboard");
    if (pathname.includes("/orders")) return t("common.sidebar.orders");
    if (pathname.includes("/inventory/import-notes")) return t("common.sidebar.importNotes");
    if (pathname.includes("/inventory/history")) return t("common.sidebar.stockHistory");
    if (pathname.includes("/inventory")) return t("common.sidebar.stockBalance");
    if (pathname.includes("/staff")) return t("common.sidebar.employees");
    if (pathname.includes("/shifts")) return t("common.sidebar.shifts");
    if (pathname.includes("/revenue")) return t("common.sidebar.revenue");
    if (pathname.includes("/reports")) return t("common.sidebar.statisticalReports");
    return t("common.sidebar.dashboard");
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName?.toUpperCase()) {
      case "ADMIN":
        return t("manager.header.roleAdmin");
      case "MANAGER":
        return t("manager.header.roleManager");
      case "STAFF":
        return t("manager.header.roleStaff");
      default:
        return t("manager.header.roleManager");
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
          <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 font-outfit uppercase tracking-wider">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
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
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{t("manager.header.opNotification")}</span>
                  <span className="text-[10px] text-amber-850 font-bold cursor-pointer hover:underline">{t("manager.header.latest")}</span>
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
                    {t("manager.header.profile")}
                  </button>
                  <button
                    onClick={() => handleOpenAccountSettings("password")}
                    className="w-full flex items-center px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-150/40 dark:hover:bg-zinc-850 transition-colors"
                  >
                    <Key className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                    {t("manager.header.changePassword")}
                  </button>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5 text-rose-500" />
                    {t("manager.header.logout")}
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
