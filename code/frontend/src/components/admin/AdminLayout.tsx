"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/store/auth.store";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "vi";
  const { t } = useTranslation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setIsMounted(true);
    
    // Load collapse state from local storage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lowlands_admin_sidebar_collapsed");
      if (saved) {
        setIsCollapsed(saved === "true");
      }
    }

    if (!isAuthenticated || !user) {
      router.push(`/${locale}/portal/login`);
      return;
    }

    const userRole = user.roleName?.toLowerCase();
    if (userRole !== "admin") {
      if (userRole === "manager") {
        router.push(`/${locale}/manager/dashboard`);
      } else if (userRole === "staff") {
        router.push(`/${locale}/staff/pos`);
      } else {
        router.push(`/${locale}/portal/login`);
      }
    }
  }, [isMounted, isAuthenticated, user, router, locale]);

  const handleToggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("lowlands_admin_sidebar_collapsed", String(nextVal));
    }
  };

  const hasAccess = isAuthenticated && user && user.roleName?.toLowerCase() === "admin";

  if (!isMounted || !hasAccess) {
    return (
      <div className="h-screen w-screen bg-[#241a15] flex flex-col items-center justify-center gap-3 text-amber-500 font-sans select-none">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar
          locale={locale}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/80 backdrop-blur-xs">
          <div className="w-64 h-full animate-slide-in-left shrink-0">
            <Sidebar
              locale={locale}
              isCollapsed={false}
              onToggleCollapse={() => {}}
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
        <Header
          locale={locale}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-grow overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;
