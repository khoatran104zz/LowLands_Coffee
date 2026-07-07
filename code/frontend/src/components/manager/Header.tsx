import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, User as UserIcon, LogOut, Key, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";
import { LanguageSwitcher } from "@/components/features/layout/LanguageSwitcher";
import { AccountModal } from "../account/AccountModal";
import { getNotifications, markNotificationAsRead, NotificationItem } from "@/services/notification.service";

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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    if (user) {
      void loadNotifications();
      const interval = setInterval(() => {
        void loadNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (isNotifOpen) {
      void loadNotifications();
    }
  }, [isNotifOpen]);

  const handleNotifClick = async (item: NotificationItem) => {
    try {
      await markNotificationAsRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      setIsNotifOpen(false);
      if (item.link) {
        router.push(`/${locale}${item.link}`);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const formatNotifTime = (createdAtStr: string) => {
    try {
      const date = new Date(createdAtStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-lg py-2 z-50 animate-slide-in-down text-left">
                <div className="px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{t("manager.header.opNotification")}</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-amber-850 font-bold select-none">Mới ({unreadCount})</span>
                  )}
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-850 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-400">Không có thông báo nào</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
                          !n.isRead ? "bg-amber-50/10 font-semibold" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-bold truncate ${
                            n.type === "IMPORT_APPROVED" ? "text-emerald-600" : "text-zinc-900 dark:text-zinc-100"
                          }`}>{n.title}</span>
                          <span className="text-[9px] text-zinc-400 whitespace-nowrap ml-2">{formatNotifTime(n.createdAt)}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.content}</p>
                      </div>
                    ))
                  )}
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
              <div className="h-8 w-8 rounded-full bg-amber-850 text-white flex items-center justify-center font-bold text-xs select-none uppercase shrink-0">
                {user.fullName ? user.fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "M"}
              </div>
              <div className="hidden sm:block text-left select-none">
                <span className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                  {user.fullName}
                </span>
                <span className="block text-[9px] text-zinc-400 font-bold uppercase leading-none mt-0.5 tracking-wider">
                  {getRoleLabel(user.roleName || "")}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-205 ${isProfileOpen ? "rotate-180" : ""}`} />
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
