"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV_LINKS } from "@/constants/routes";
import { ShoppingBag, User, Menu, X, MapPin } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const MEGA_MENU_CATEGORIES = [
  {
    categoryId: 1,
    title: { vi: "CÀ PHÊ", en: "COFFEE" },
    subcategories: [
      { name: { vi: "Cà Phê Truyền Thống", en: "Traditional Coffee" }, search: "Phin" },
      { name: { vi: "PhinĐi", en: "PhinDi" }, search: "Phindi" },
    ]
  },
  {
    categoryId: 2,
    title: { vi: "TRÀ", en: "TEA" },
    subcategories: [
      { name: { vi: "Trà Sen Vàng", en: "Golden Lotus Tea" }, search: "Sen" },
      { name: { vi: "Trà Thạch Đào", en: "Peach Jelly Tea" }, search: "Đào" },
      { name: { vi: "Trà Thanh Đào", en: "Peach Lemongrass Tea" }, search: "Thanh Đào" },
    ]
  },
  {
    categoryId: 3,
    title: { vi: "FREEZE", en: "FREEZE" },
    subcategories: [
      { name: { vi: "Freeze Trà Xanh", en: "Green Tea Freeze" }, search: "Trà Xanh" },
      { name: { vi: "Freeze Cà Phê Phin", en: "Coffee Freeze" }, search: "Cà Phê Phin" },
    ]
  },
  {
    categoryId: 4,
    title: { vi: "KHÁC", en: "OTHERS" },
    subcategories: [
      { name: { vi: "Bánh Mì Que", en: "Crispy Stick Bread" }, search: "Bánh Mì" },
      { name: { vi: "Bánh Ngọt", en: "Cheesecake" }, search: "Bánh Phô Mai" },
      { name: { vi: "Cà Phê Đóng Gói", en: "Packaged Coffee" }, search: "Đóng Gói" },
    ]
  }
];

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  
  // Zustand State hooks
  const cartItemsCount = useCartStore((state) => 
    state.items.reduce((count, item) => count + item.quantity, 0)
  );
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-secondary/95 backdrop-blur-md transition-all shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Navigation Group - Left aligned on Desktop */}
        <div className="flex items-center gap-4 xl:gap-6 h-full">
          <Link href="/" className="flex items-center py-2 shrink-0">
            <div className="relative h-9 w-32 xl:w-36">
              <Image
                src="/logo/logo.svg"
                alt={t("common.brandName")}
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Left Navigation (informational menu) */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-4 h-full">
            {NAV_LINKS.map((link) => {
              const isMenu = link.labelKey === "common.menu";
              if (isMenu) {
                return (
                  <div 
                    key={link.href}
                    className="relative flex items-center h-full cursor-pointer"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className="text-xs xl:text-sm font-extrabold text-primary hover:text-accent transition-colors uppercase tracking-wider h-full flex items-center"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs xl:text-sm font-extrabold text-primary hover:text-accent transition-colors uppercase tracking-wider"
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls - Right on Desktop */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
          {/* ĐẶT HÀNG Button */}
          <Link href="/menu">
            <Button variant="default" size="sm" className="rounded-full font-extrabold text-xs px-3.5 py-1.5 uppercase tracking-wider bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm transition-all">
              {t("common.order")}
            </Button>
          </Link>

          {/* Tìm kiếm cửa hàng Link */}
          <Link 
            href="/#store-locator" 
            className="flex items-center gap-1.5 text-xs xl:text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span className="hidden 2xl:inline">{t("common.findStore")}</span>
          </Link>

          {/* Language Switcher flags */}
          <LanguageSwitcher />

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-1.5 text-primary hover:text-accent transition-colors">
            <ShoppingBag className="h-5 w-5 xl:h-6 xl:w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-accent text-[9px] xl:text-[10px] font-extrabold text-accent-foreground animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Auth Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 xl:gap-3 border-l border-border/60 pl-3 xl:pl-4">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-primary hover:text-accent"
              >
                <User className="h-4.5 w-4.5" />
                <span className="hidden 2xl:inline max-w-[100px] truncate font-bold">{user?.fullName}</span>
              </Link>
              <button
                onClick={logout}
                className="text-[10px] xl:text-xs font-extrabold text-destructive hover:underline cursor-pointer"
              >
                {t("common.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs xl:text-sm font-bold text-primary hover:text-accent border-l border-border/60 pl-3 xl:pl-4"
            >
              <User className="h-4.5 w-4.5" />
              <span className="hidden 2xl:inline">{t("common.login")}</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Icon & Actions */}
        <div className="flex items-center gap-3 lg:hidden">
          {/* Cart Icon Mobile */}
          <Link href="/cart" className="relative p-2 text-primary hover:text-accent">
            <ShoppingBag className="h-5.5 w-5.5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-extrabold text-accent-foreground">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-primary"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mega Menu Dropdown for THỰC ĐƠN */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 w-full bg-[#2A1815] text-[#F7F3E9] border-t border-white/10 shadow-xl z-40 hidden lg:block"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="container mx-auto max-w-7xl px-8 py-8 grid grid-cols-4 gap-8">
              {MEGA_MENU_CATEGORIES.map((category) => (
                <div key={category.categoryId} className="flex flex-col gap-3">
                  <Link 
                    href={`/menu?category=${category.categoryId}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="font-heading font-extrabold text-sm text-accent hover:text-accent/80 transition-colors border-b border-white/10 pb-2 tracking-wider uppercase"
                  >
                    {category.title[locale as "vi" | "en"]}
                  </Link>
                  <ul className="flex flex-col gap-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub.search}>
                        <Link
                          href={`/menu?category=${category.categoryId}&search=${encodeURIComponent(sub.search)}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="text-xs text-white/70 hover:text-accent hover:translate-x-1 transition-all duration-150 inline-block font-medium"
                        >
                          {sub.name[locale as "vi" | "en"]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-[#211210] border-t border-white/5 py-3 text-center text-[10px] text-white/40 tracking-wider font-semibold">
              LOWLANDS COFFEE & TEA • TRẢI NGHIỆM PHIN HIỆN ĐẠI
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-6 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            {/* Mobile Navigation Links */}
            {NAV_LINKS.map((link) => {
              const isMenu = link.labelKey === "common.menu";
              if (isMenu) {
                return (
                  <div key={link.href} className="border-b border-border/50 pb-4">
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-extrabold text-primary hover:text-accent transition-colors py-2 block uppercase"
                    >
                      {t(link.labelKey)}
                    </Link>
                    {/* Collapsed simple grid of main categories on mobile */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {MEGA_MENU_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.categoryId}
                          href={`/menu?category=${cat.categoryId}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-bold text-muted-foreground hover:text-primary hover:bg-accent/15 bg-secondary/50 px-3 py-2.5 rounded-xl border border-border/60 transition-all flex items-center justify-between"
                        >
                          <span>{cat.title[locale as "vi" | "en"]}</span>
                          <span className="text-[10px] opacity-40">➔</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-extrabold text-primary hover:text-accent transition-colors py-3 block border-b border-border/50 uppercase"
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            
            {/* Mobile Actions */}
            <div className="flex flex-col gap-4 pt-4 border-b border-border/50 pb-4">
              {/* Mobile Store Locator Link */}
              <Link
                href="/#store-locator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
              >
                <MapPin className="h-5 w-5 text-accent" />
                <span>{t("common.findStore")}</span>
              </Link>
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{t("common.vietnam")}/{t("common.english")}</span>
                <LanguageSwitcher />
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-4 pt-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-base font-semibold text-primary hover:text-accent"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.fullName}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-md bg-secondary text-destructive text-sm font-bold py-2 hover:bg-secondary/80 cursor-pointer"
                >
                  {t("common.logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-full bg-primary text-primary-foreground text-sm font-bold py-2.5 mt-2 hover:bg-primary/95 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>{t("common.login")}</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
