"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV_LINKS } from "@/constants/routes";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import Image from "next/image";

export function Header() {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Zustand State hooks
  const cartItemsCount = useCartStore((state) => 
    state.items.reduce((count, item) => count + item.quantity, 0)
  );
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-44">
            <Image
              src="/logo/logo.svg"
              alt={t("common.brandName")}
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-foreground/80 hover:text-primary transition-colors">
            <ShoppingBag className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-accent-foreground animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Auth Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-primary"
              >
                <User className="h-5 w-5" />
                <span className="max-w-[120px] truncate">{user?.fullName}</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs font-bold text-destructive hover:underline"
              >
                {t("common.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-primary"
            >
              <User className="h-5 w-5" />
              <span>{t("common.login")}</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Icon & Actions */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Cart Icon Mobile */}
          <Link href="/cart" className="relative p-2 text-foreground/80 hover:text-primary">
            <ShoppingBag className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-extrabold text-accent-foreground">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground/85"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-6 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-foreground/80 hover:text-primary transition-colors py-2 border-b border-border/50"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            
            <div className="flex items-center justify-between py-4 border-b border-border/50">
              <span className="text-sm font-semibold text-muted-foreground">{t("common.stores")}</span>
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-4 pt-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-base font-semibold text-foreground/80 hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.fullName}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-md bg-secondary text-destructive text-sm font-bold py-2 hover:bg-secondary/80"
                >
                  {t("common.logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-primary text-primary-foreground text-sm font-bold py-2.5 mt-2 hover:bg-primary/95 transition-colors"
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
