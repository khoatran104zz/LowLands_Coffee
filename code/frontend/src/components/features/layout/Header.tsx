"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV_LINKS } from "@/constants/routes";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, User, Menu, X, MapPin } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const MEGA_MENU_CATEGORIES = [
  {
    categoryId: 1,
    title: { vi: "CÀ PHÊ", en: "COFFEE" },
    subcategories: [
      { name: { vi: "Phin Sữa Đá", en: "Phin Condensed Milk Coffee" }, search: "Phin Sữa Đá" },
      { name: { vi: "Phin Đen Đá", en: "Phin Black Coffee" }, search: "Phin Đen Đá" },
      { name: { vi: "Bạc Xỉu", en: "Bac Xiu" }, search: "Bạc Xỉu" },
      { name: { vi: "Cà Phê Ý (Latte/Capu)", en: "Espresso Drinks" }, search: "Latte" },
    ]
  },
  {
    categoryId: 2,
    title: { vi: "TRÀ", en: "TEA" },
    subcategories: [
      { name: { vi: "Trà Đào Cam Sả", en: "Peach Lemongrass Tea" }, search: "Đào" },
      { name: { vi: "Trà Sen Vàng", en: "Golden Lotus Tea" }, search: "Sen" },
      { name: { vi: "Trà Sữa Trân Châu", en: "Pearl Milk Tea" }, search: "Trân Châu" },
      { name: { vi: "Trà Ô Long Kem Cheese", en: "Oolong Cheese Tea" }, search: "Ô Long" },
    ]
  },
  {
    categoryId: 3,
    title: { vi: "FREEZE", en: "FREEZE" },
    subcategories: [
      { name: { vi: "Freeze Trà Xanh", en: "Green Tea Freeze" }, search: "Trà Xanh" },
      { name: { vi: "Freeze Cà Phê", en: "Coffee Freeze" }, search: "Cà Phê" },
      { name: { vi: "Freeze Socola", en: "Chocolate Freeze" }, search: "Socola" },
      { name: { vi: "Freeze Cookies and Cream", en: "Cookies & Cream" }, search: "Cookies" },
    ]
  },
  {
    categoryId: 4,
    title: { vi: "KHÁC (BÁNH)", en: "OTHERS (BAKERY)" },
    subcategories: [
      { name: { vi: "Bánh Mì Que", en: "Crispy Stick Bread" }, search: "Bánh Mì Que" },
      { name: { vi: "Bánh Ngọt (Tiramisu/Cheese)", en: "Sweet Cakes" }, search: "Bánh" },
      { name: { vi: "Bánh Mì Sài Gòn", en: "Saigon Bread" }, search: "Sài Gòn" },
    ]
  }
];

export function Header() {
  const { t } = useTranslation();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrateFromStorage();
    useCartStore.getState().hydrateFromStorage();
    setIsMounted(true);
  }, []);
  
  // Zustand State hooks
  const cartItemsCount = useCartStore((state) => 
    state.items.reduce((count, item) => count + item.quantity, 0)
  );
  const cartItems = useCartStore((state) => state.items);
  const updateCartQuantity = useCartStore((state) => state.updateQuantity);
  const removeCartItem = useCartStore((state) => state.removeItem);
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const { isAuthenticated, user, logout } = useAuthStore();
  const showAuth = isMounted && isAuthenticated;
  const cartPreviewItems = cartItems.slice(0, 3);
  const extraCartItemsCount = Math.max(cartItems.length - cartPreviewItems.length, 0);
  const cartPreviewLabels = locale === "en"
    ? {
        title: "Your cart",
        empty: "Your cart is waiting for something delicious.",
        continueShopping: "Browse menu",
        viewCart: "View cart",
        checkout: "Checkout",
        moreItems: `+${extraCartItemsCount} more item${extraCartItemsCount > 1 ? "s" : ""}`,
      }
    : {
        title: "Giỏ hàng của bạn",
        empty: "Giỏ hàng đang chờ món ngon đầu tiên.",
        continueShopping: "Xem thực đơn",
        viewCart: "Xem giỏ hàng",
        checkout: "Thanh toán",
        moreItems: `+${extraCartItemsCount} món khác`,
      };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-secondary/95 backdrop-blur-md transition-all shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Navigation Group - Left aligned on Desktop */}
        <div className="flex items-center gap-4 xl:gap-6 h-full">
          <Link
            href="/"
            className="flex items-center py-2 shrink-0"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
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
          <Link href="/menu?view=all">
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
          <div
            className="relative flex items-center"
            onMouseEnter={() => setCartPreviewOpen(true)}
            onMouseLeave={() => setCartPreviewOpen(false)}
          >
            <Link
              href="/cart"
              className="relative p-1.5 text-primary hover:text-accent transition-colors"
              aria-label={t("common.cart")}
            >
              <ShoppingBag className="h-5 w-5 xl:h-6 xl:w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-accent text-[9px] xl:text-[10px] font-extrabold text-accent-foreground animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <AnimatePresence>
              {cartPreviewOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-[-132px] xl:right-[-112px] top-full z-50 mt-3 w-[360px] rounded-2xl border border-[#E8DCCA] bg-[#FFFCF8] text-left shadow-2xl before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  <div className="absolute right-[142px] xl:right-[122px] -top-2 h-4 w-4 rotate-45 border-l border-t border-[#E8DCCA] bg-[#FFFCF8]" />
                  <div className="relative border-b border-[#E9DED1] bg-[#F7F0E4] px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9B7653]">
                          Lowlands Coffee
                        </p>
                        <h3 className="mt-0.5 font-heading text-base font-black text-[#3A1D14]">
                          {cartPreviewLabels.title}
                        </h3>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C69A5B]/40 bg-[#C69A5B]/15 text-[#C8510A]">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="px-5 py-7 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4E8D7] text-[#C69A5B]">
                        <ShoppingBag className="h-7 w-7" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-[#3A1D14]">
                        {cartPreviewLabels.empty}
                      </p>
                      <Link
                        href="/menu"
                        onClick={() => setCartPreviewOpen(false)}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#3A1D14] px-5 text-sm font-black text-[#FFF8EC] transition-colors hover:bg-[#2B130D]"
                      >
                        {cartPreviewLabels.continueShopping}
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[330px] overflow-y-auto px-4 py-3">
                        <div className="space-y-3">
                          {cartPreviewItems.map((item) => {
                            const toppingsPrice = item.toppings.reduce(
                              (sum, cartTopping) => sum + Number(cartTopping.topping.price) * cartTopping.quantity,
                              0
                            );
                            const singleItemPrice = Number(item.variant.price) + toppingsPrice;
                            const totalItemPrice = singleItemPrice * item.quantity;
                            const visibleToppings = item.toppings.filter((cartTopping) => cartTopping.quantity > 0);

                            return (
                              <div
                                key={item.id}
                                className="grid grid-cols-[64px_1fr_auto] gap-3 rounded-xl border border-[#E9DED1] bg-white/80 p-3 shadow-sm"
                              >
                                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#F4E8D7]">
                                  {item.product.imageUrl ? (
                                    <Image
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      fill
                                      sizes="64px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[#C69A5B]">
                                      <ShoppingBag className="h-7 w-7" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="line-clamp-2 text-sm font-black leading-snug text-[#3A1D14]">
                                    {t(`product.items.${item.product.id}.name`, { defaultValue: item.product.name })}
                                  </h4>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    <span className="rounded-full bg-[#F4E8D7] px-2 py-0.5 text-[10px] font-black text-[#7B4A2A]">
                                      Size {item.variant.size}
                                    </span>
                                    {visibleToppings.slice(0, 2).map(({ topping, quantity }) => (
                                      <span
                                        key={topping.id}
                                        className="rounded-full bg-[#C8510A]/10 px-2 py-0.5 text-[10px] font-bold text-[#C8510A]"
                                      >
                                        +{topping.name} x{quantity}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                      className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E0CCB5] text-[#7B4A2A] transition-colors hover:border-[#C8510A] hover:bg-[#C8510A]/10 hover:text-[#C8510A]"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="min-w-5 text-center text-xs font-black text-[#3A1D14]">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                      className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E0CCB5] text-[#7B4A2A] transition-colors hover:border-[#C8510A] hover:bg-[#C8510A]/10 hover:text-[#C8510A]"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end justify-between">
                                  <button
                                    type="button"
                                    onClick={() => removeCartItem(item.id)}
                                    className="rounded-full p-1.5 text-[#B4A090] transition-colors hover:bg-[#C8510A]/10 hover:text-[#C8510A]"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <div className="text-right">
                                    <p className="text-sm font-black text-[#C8510A]">
                                      {formatPrice(totalItemPrice)}
                                    </p>
                                    <p className="text-[10px] font-semibold text-[#8A7568]">
                                      {formatPrice(singleItemPrice)}/món
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {extraCartItemsCount > 0 && (
                          <Link
                            href="/cart"
                            onClick={() => setCartPreviewOpen(false)}
                            className="mt-3 block rounded-xl border border-dashed border-[#D8C3AA] bg-[#F7F0E4]/70 px-4 py-2 text-center text-xs font-black text-[#7B4A2A] hover:border-[#C8510A] hover:text-[#C8510A]"
                          >
                            {cartPreviewLabels.moreItems}
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-[#E9DED1] bg-[#F7F0E4] px-5 py-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-black text-[#6F5A4F]">
                            {t("product.cart.total")}
                          </span>
                          <span className="text-xl font-black text-[#C8510A]">
                            {formatPrice(cartSubtotal)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/cart"
                            onClick={() => setCartPreviewOpen(false)}
                            className="inline-flex h-11 items-center justify-center rounded-full border border-[#C69A5B]/45 bg-white text-sm font-black text-[#3A1D14] transition-colors hover:bg-[#FFF8EC] hover:text-[#C8510A]"
                          >
                            {cartPreviewLabels.viewCart}
                          </Link>
                          <Link
                            href="/checkout"
                            onClick={() => setCartPreviewOpen(false)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#3A1D14] text-sm font-black text-[#FFF8EC] shadow-sm transition-colors hover:bg-[#2B130D]"
                          >
                            {cartPreviewLabels.checkout}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Menu */}
          {showAuth ? (
            <div 
              className="relative flex items-center h-full border-l border-border/60 pl-3 xl:pl-4"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 text-xs xl:text-sm font-extrabold text-primary hover:text-accent transition-colors uppercase tracking-wider h-full cursor-pointer focus:outline-none"
              >
                <div className="h-7 w-7 rounded-full bg-accent/15 flex items-center justify-center border border-accent/25">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <span className="max-w-[100px] truncate">{user?.fullName}</span>
                <span className="text-[8px] opacity-60">▼</span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-0.5 w-44 bg-white dark:bg-[#1C1211] border border-border/80 rounded-xl shadow-lg py-2 z-50 text-left font-semibold text-xs text-foreground"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-foreground hover:bg-[#C8510A]/10 hover:text-[#C8510A] transition-colors"
                    >
                      {t("header.profile")}
                    </Link>
                    <Link
                      href="/profile#orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-foreground hover:bg-[#C8510A]/10 hover:text-[#C8510A] transition-colors"
                    >
                      {t("header.orders")}
                    </Link>
                    {user?.roleName?.toUpperCase() === "ADMIN" || user?.roleName?.toUpperCase() === "STAFF" ? (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-foreground hover:bg-[#C8510A]/10 hover:text-[#C8510A] transition-colors"
                      >
                        {t("header.adminPortal")}
                      </Link>
                    ) : null}
                    <div className="border-t border-border/40 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-bold"
                    >
                      {t("header.logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
              {t("common.brandName").toUpperCase()} • {t("header.mobileExperience")}
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

            {showAuth ? (
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
