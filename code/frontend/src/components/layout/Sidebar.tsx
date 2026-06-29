import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Coffee,
  LayoutDashboard,
  Store,
  FolderTree,
  Users2,
  UserCheck,
  Receipt,
  Tag,
  LineChart,
  Settings,
  Warehouse,
  Coins,
  History,
  Smartphone,
  ChevronLeft,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarProps {
  role: "admin" | "manager";
  locale: string;
  onCloseMobile?: () => void;
}

export function Sidebar({ role, locale, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Navigation configurations based on role
  const adminLinks = [
    { href: `/${locale}/admin/dashboard`, label: t("common.dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/admin/branches`, label: t("common.branches"), icon: Store },
    { href: `/${locale}/admin/products`, label: t("common.products"), icon: Coffee },
    { href: `/${locale}/admin/categories`, label: t("common.categories"), icon: FolderTree },
    { href: `/${locale}/admin/employees`, label: t("common.employees"), icon: Users2 },
    { href: `/${locale}/admin/customers`, label: t("common.customers"), icon: UserCheck },
    { href: `/${locale}/admin/orders`, label: t("common.orders"), icon: Receipt },
    { href: `/${locale}/admin/promotions`, label: t("common.promotions"), icon: Tag },
    { href: `/${locale}/admin/reports`, label: t("common.reports"), icon: LineChart },
  ];

  const managerLinks = [
    { href: `/${locale}/manager/dashboard`, label: t("common.dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/manager/orders`, label: t("common.orders"), icon: Receipt },
    { href: `/${locale}/manager/inventory`, label: t("common.inventory"), icon: Warehouse },
    { href: `/${locale}/manager/staff`, label: t("staff.manager.workingShift"), icon: Users2 },
    { href: `/${locale}/manager/revenue`, label: t("common.revenue"), icon: Coins },
    { href: `/${locale}/manager/reports`, label: t("common.reports"), icon: LineChart },
  ];

  const links = role === "admin" ? adminLinks : managerLinks;

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-200 border-r border-zinc-900 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900">
        <Link 
          href={`/${locale}`}
          className="flex items-center py-2 shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="relative h-8 w-28 brightness-0 invert opacity-90">
            <Image
              src="/logo/logo.svg"
              alt="Lowlands Coffee"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden text-zinc-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Role Tag */}
      <div className="px-6 py-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 flex items-center justify-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 font-outfit">
            {role === "admin" ? t("common.adminSystem") : t("common.branchManagement")}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow px-4 py-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          // Exact active check or prefix check for child pages
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all group",
                isActive
                  ? "bg-amber-800 text-white font-bold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick shortcuts to POS & Customer portals */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950 space-y-2">
        <Link
          href={`/${locale}/staff/pos`}
          className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[11px] font-bold text-amber-500 border border-amber-850 hover:bg-amber-800/10 transition-colors w-full"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>{t("common.goToPOS")}</span>
        </Link>
        <Link
          href={`/${locale}`}
          className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors w-full"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>{t("common.backToCustomer")}</span>
        </Link>
      </div>
    </aside>
  );
}
