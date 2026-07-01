import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Receipt,
  LineChart,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  X,
  FileDown,
  History,
  Clock,
  Coins,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/auth.store";

interface SidebarProps {
  locale: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export function Sidebar({ locale, isCollapsed, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const branchName = user?.branchName || "Hồ Con Rùa";

  const menuGroups = [
    {
      id: "main",
      title: "",
      items: [
        { href: `/${locale}/manager/dashboard`, label: t("common.sidebar.dashboard"), icon: LayoutDashboard }
      ]
    },
    {
      id: "business",
      title: t("common.sidebar.groups.business"),
      items: [
        { href: `/${locale}/manager/orders`, label: t("common.sidebar.orders"), icon: Receipt }
      ]
    },
    {
      id: "inventory",
      title: t("common.sidebar.groups.inventory"),
      items: [
        { href: `/${locale}/manager/inventory`, label: t("common.sidebar.stockBalance"), icon: Warehouse },
        { href: `/${locale}/manager/inventory/import-notes`, label: t("common.sidebar.importNotes"), icon: FileDown },
        { href: `/${locale}/manager/inventory/history`, label: t("common.sidebar.stockHistory"), icon: History }
      ]
    },
    {
      id: "staff",
      title: t("common.sidebar.groups.staff"),
      items: [
        { href: `/${locale}/manager/staff`, label: t("common.sidebar.employees"), icon: Users2 },
        { href: `/${locale}/manager/shifts`, label: t("common.sidebar.shifts"), icon: Clock }
      ]
    },
    {
      id: "reports",
      title: t("common.sidebar.groups.reports"),
      items: [
        { href: `/${locale}/manager/revenue`, label: t("common.sidebar.revenue"), icon: Coins },
        { href: `/${locale}/manager/reports`, label: t("common.sidebar.statisticalReports"), icon: LineChart }
      ]
    }
  ];

  return (
    <aside
      className={cn(
        "bg-[#241a15] text-[#f7f2ed] border-r border-[#3d2e27] flex flex-col h-full shrink-0 select-none transition-all duration-300 relative z-30",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#3d2e27] shrink-0">
        <Link
          href={`/${locale}/manager/dashboard`}
          className="flex items-center hover:opacity-90 transition-opacity w-full overflow-hidden"
        >
          {isCollapsed ? (
            <div className="relative h-8 w-8 mx-auto">
              <Image
                src="/logo/logo-icon-white.svg"
                alt="Logo Icon"
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="relative h-10 w-40">
              <Image
                src="/logo/logo-white.svg"
                alt="Lowlands Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-zinc-400 hover:text-white transition-colors ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Rùa Store Name info header */}
      {!isCollapsed && (
        <div className="px-5 py-3 border-b border-[#3d2e27]/50 bg-[#1f1612]/35 flex flex-col text-left shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#948175]">{t("common.branchManagement")}</span>
          <span className="text-xs font-bold text-[#c8510a] truncate mt-0.5" title={branchName}>
            {branchName}
          </span>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-grow py-4 overflow-y-auto space-y-5 px-3 custom-scrollbar">
        {menuGroups.map((group) => (
          <div key={group.id} className="space-y-1.5">
            {group.title && !isCollapsed && (
              <span className="px-4 text-[9px] uppercase font-bold tracking-widest text-[#948175] select-none block">
                {group.title}
              </span>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-lg py-2 px-3 text-xs font-bold transition-all group relative",
                      isActive
                        ? "bg-[#c8510a] text-white shadow-sm"
                        : "text-[#cab5a7] hover:text-white hover:bg-[#342721]/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                        isCollapsed ? "mx-auto" : "mr-3",
                        isActive ? "text-white" : "text-[#948175] group-hover:text-[#cab5a7]"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 bg-zinc-950 text-white text-[10px] font-bold py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick shortcuts to POS */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#3d2e27] bg-[#1f1612] space-y-2 shrink-0">
          <Link
            href={`/${locale}/staff/pos`}
            className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-bold text-white bg-[#c8510a] hover:bg-[#b04507] transition-all w-full shadow-sm hover:scale-[1.02]"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">{t("common.goToPOS")}</span>
          </Link>
        </div>
      )}

      {/* Floating Toggle Button on Right Border (Desktop only) */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-1/2 -right-3 -translate-y-1/2 bg-[#c8510a] hover:bg-[#b04507] text-[#f7f2ed] rounded-full p-1 shadow-md border border-[#3d2e27] hidden lg:flex items-center justify-center cursor-pointer h-6 w-6 z-50 transition-all hover:scale-105"
        title={isCollapsed ? t("common.sidebar.expandMenu") : t("common.sidebar.collapseMenu")}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
