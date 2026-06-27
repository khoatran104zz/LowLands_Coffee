"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, RefreshCw, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { UI_TEXT } from "@/constants/ui-text";
import { useAuthStore } from "@/store/auth.store";
import { AccountDropdown } from "../account/AccountDropdown";
import { AccountModal } from "../account/AccountModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "manager";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "vi";

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [defaultAccountTab, setDefaultAccountTab] = useState("profile");
  
  const [isMounted, setIsMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setIsMounted(true);
    
    if (!isAuthenticated || !user) {
      router.push(`/${locale}/portal/login`);
      return;
    }

    const routeRole = role; // "admin" or "manager"
    const userRole = user.roleName?.toLowerCase();

    if (routeRole === "admin" && userRole !== "admin") {
      if (userRole === "manager") {
        router.push(`/${locale}/manager/dashboard`);
      } else {
        router.push(`/${locale}/portal/login`);
      }
    } else if (routeRole === "manager" && userRole !== "manager" && userRole !== "admin") {
      if (userRole === "staff") {
        router.push(`/${locale}/staff/pos`);
      } else {
        router.push(`/${locale}/portal/login`);
      }
    }
  }, [isMounted, isAuthenticated, user, role, router, locale]);

  const handleOpenAccountSettings = (tab: string = "profile") => {
    setDefaultAccountTab(tab);
    setIsAccountOpen(true);
  };

  const handleLogout = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản quản trị?");
    if (confirm) {
      logout();
      router.push(`/${locale}/portal/login`);
    }
  };

  // Show full screen loading state before layout mounts or if user is unauthorized
  const userRole = user?.roleName?.toLowerCase();
  const hasAccess = isAuthenticated && user && (
    (role === "admin" && userRole === "admin") ||
    (role === "manager" && (userRole === "manager" || userRole === "admin"))
  );

  if (!isMounted || !hasAccess) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-amber-500 font-sans select-none">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Đang tải và xác thực...</span>
      </div>
    );
  }

  // Derive title from active route
  const getHeaderTitle = () => {
    if (pathname.includes("/dashboard")) return UI_TEXT.common.dashboard;
    if (pathname.includes("/branches")) return UI_TEXT.common.branches;
    if (pathname.includes("/products")) return UI_TEXT.common.products;
    if (pathname.includes("/categories")) return UI_TEXT.common.categories;
    if (pathname.includes("/employees")) return UI_TEXT.common.employees;
    if (pathname.includes("/customers")) return UI_TEXT.common.customers;
    if (pathname.includes("/orders")) return UI_TEXT.common.orders;
    if (pathname.includes("/promotions")) return UI_TEXT.common.promotions;
    if (pathname.includes("/reports")) return UI_TEXT.common.reports;
    if (pathname.includes("/inventory")) return UI_TEXT.common.inventory;
    if (pathname.includes("/staff")) return UI_TEXT.manager.workingShift;
    if (pathname.includes("/revenue")) return UI_TEXT.common.revenue;
    return UI_TEXT.common.dashboard;
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    if (selectedRole === "admin") {
      router.push(`/${locale}/admin/dashboard`);
    } else if (selectedRole === "manager") {
      router.push(`/${locale}/manager/dashboard`);
    } else if (selectedRole === "pos") {
      router.push(`/${locale}/staff/pos`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar role={role} locale={locale} />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/80 backdrop-blur-xs">
          <div className="w-64 h-full animate-slide-in-left">
            <Sidebar 
              role={role} 
              locale={locale} 
              onCloseMobile={() => setIsMobileSidebarOpen(false)} 
            />
          </div>
          <div 
            className="flex-grow h-full" 
            onClick={() => setIsMobileSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shadow-2xs shrink-0 select-none">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base font-bold text-foreground font-outfit uppercase tracking-wide">
              {getHeaderTitle()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Role Switcher */}
            <div className="flex items-center space-x-2 bg-muted/60 hover:bg-muted border border-border/80 rounded-lg px-2.5 py-1.5 transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-amber-800 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                Chế độ Test:
              </span>
              <select
                value={role === "admin" ? "admin" : "manager"}
                onChange={handleRoleChange}
                className="bg-transparent text-xs font-bold text-amber-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="admin">Hệ thống Admin</option>
                <option value="manager">Quản lý Cửa hàng</option>
                <option value="pos">Màn hình POS</option>
              </select>
            </div>

            {/* User Profile dropdown */}
            <AccountDropdown 
              onOpenSettings={handleOpenAccountSettings}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-grow overflow-y-auto bg-zinc-50/50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Account Settings Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        defaultTab={defaultAccountTab}
      />
    </div>
  );
}
