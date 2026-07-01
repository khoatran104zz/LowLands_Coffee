import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Coffee,
  LayoutDashboard,
  Store,
  FolderTree,
  Sparkles,
  Users2,
  UserCheck,
  Receipt,
  Tag,
  LineChart,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  X,
  Sprout,
  Truck,
  FileDown,
  BookOpen,
  ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarProps {
  locale: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export function Sidebar({ locale, isCollapsed, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Defined structure based on user request
  const menuGroups = [
    {
      id: "main",
      title: "",
      items: [
        { href: `/${locale}/admin/dashboard`, label: t("common.dashboard"), icon: LayoutDashboard }
      ]
    },
    {
      id: "org",
      title: "Tổ chức",
      items: [
        { href: `/${locale}/admin/branches`, label: t("common.branches"), icon: Store },
        { href: `/${locale}/admin/employees`, label: t("common.employees"), icon: Users2 }
      ]
    },
    {
      id: "menu",
      title: "Menu",
      items: [
        { href: `/${locale}/admin/categories`, label: t("common.categories"), icon: FolderTree },
        { href: `/${locale}/admin/products`, label: t("common.products"), icon: Coffee },
        { href: `/${locale}/admin/toppings`, label: t("common.toppings"), icon: Sparkles }
      ]
    },
    {
      id: "kho",
      title: "Kho hàng",
      items: [
        { href: `/${locale}/admin/ingredients`, label: "Nguyên liệu", icon: Sprout },
        { href: `/${locale}/admin/suppliers`, label: "Nhà cung cấp", icon: Truck },
        { href: `/${locale}/admin/import-notes`, label: "Phiếu nhập kho", icon: FileDown },
        { href: `/${locale}/admin/stock`, label: "Tồn kho", icon: Warehouse }
      ]
    },
    {
      id: "recipe",
      title: "Công thức",
      items: [
        { href: `/${locale}/admin/recipes`, label: "Recipes", icon: BookOpen }
      ]
    },
    {
      id: "business",
      title: "Kinh doanh",
      items: [
        { href: `/${locale}/admin/orders`, label: t("common.orders"), icon: Receipt },
        { href: `/${locale}/admin/customers`, label: t("common.customers"), icon: UserCheck },
        { href: `/${locale}/admin/promotions`, label: t("common.promotions"), icon: Tag }
      ]
    },
    {
      id: "reports",
      title: "Báo cáo",
      items: [
        { href: `/${locale}/admin/reports`, label: "Báo cáo thống kê", icon: LineChart }
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
          href={`/${locale}/admin/dashboard`}
          className="flex items-center space-x-2.5 overflow-hidden hover:opacity-90 transition-opacity"
        >
          <div className="relative h-9 w-9 rounded-full bg-[#f7f2ed] p-1 flex items-center justify-center shrink-0">
            <div className="relative w-7 h-7">
              <Image
                src="/logo/logo.svg"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-sm tracking-wider uppercase font-outfit text-[#f7f2ed] truncate">
              Lowlands Admin
            </span>
          )}
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

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

      {/* Collapse/Expand Toggle (Desktop only) */}
      <div className="p-3 border-t border-[#3d2e27] shrink-0 bg-[#1f1612] hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-2 rounded-lg text-[#cab5a7] hover:text-white hover:bg-[#342721] transition-all cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center space-x-2 text-xs font-bold">
              <ChevronLeft className="h-4 w-4" />
              <span>Thu gọn menu</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
