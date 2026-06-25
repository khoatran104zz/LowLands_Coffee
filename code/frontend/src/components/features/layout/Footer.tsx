"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link
              href="/"
              className="inline-block relative h-10 w-44"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.location.reload();
                }
              }}
            >
              <Image
                src="/logo/logo.svg"
                alt={t("common.brandName")}
                fill
                className="object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
              {t("common.footerDesc")}
            </p>
          </div>

          {/* Navigation Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
              {t("common.brandName")}
            </h4>
            <nav className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                {t("common.home")}
              </Link>
              <Link href="/menu" className="hover:text-primary transition-colors">
                {t("common.menu")}
              </Link>
            </nav>
          </div>

          {/* Social / Contact Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
              {t("common.stores")}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hotline: 1900 xxxx (8:00 - 22:00)
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Email: contact@lowlandscoffee.com
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Lowlands Coffee. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="w-12 h-[2px] bg-accent rounded-full"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
