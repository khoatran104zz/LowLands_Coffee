"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Inline vector SVG for the Vietnamese flag
function VietnamFlag() {
  return (
    <svg viewBox="0 0 30 20" className="h-3.5 w-5 rounded-sm shadow-sm inline-block mr-2 shrink-0">
      <rect width="30" height="20" fill="#da251d"/>
      <polygon points="15,4 16.2,8.5 20.8,8.5 17.1,11.2 18.5,15.7 15,13 11.5,15.7 12.9,11.2 9.2,8.5 13.8,8.5" fill="#ffff00"/>
    </svg>
  );
}

// Inline vector SVG for the United Kingdom flag (English representation)
function UKFlag() {
  return (
    <svg viewBox="0 0 30 20" className="h-3.5 w-5 rounded-sm shadow-sm inline-block mr-2 shrink-0">
      <rect width="30" height="20" fill="#012169"/>
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="3"/>
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" stroke-width="2"/>
      <path d="M15,0 L15,20 M0,10 L30,10" stroke="#fff" stroke-width="5"/>
      <path d="M15,0 L15,20 M0,10 L30,10" stroke="#C8102E" stroke-width="3"/>
    </svg>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");

  const handleLanguageChange = (value: string | null) => {
    if (!value) return;

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const search = window.location.search;
      
      const parts = currentPath.split("/");
      // Path format is /[locale]/path...
      if (parts.length > 1 && (parts[1] === "vi" || parts[1] === "en")) {
        parts[1] = value;
      } else {
        parts.splice(1, 0, value);
      }
      
      const newPath = parts.join("/") + search;
      window.location.href = newPath; // Perform full page reload to switch language and update HTML attributes
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px] h-9 bg-card text-xs font-bold border-border rounded-full hover:bg-muted/30 transition-colors shadow-sm focus:ring-1 focus:ring-primary/30">
          <SelectValue placeholder={t("vietnam")}>
            <div className="flex items-center">
              {locale === "vi" ? <VietnamFlag /> : <UKFlag />}
              <span>{locale === "vi" ? "Tiếng Việt" : "English"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="vi" className="text-xs font-semibold cursor-pointer">
            <div className="flex items-center py-0.5">
              <VietnamFlag />
              <span>Tiếng Việt</span>
            </div>
          </SelectItem>
          <SelectItem value="en" className="text-xs font-semibold cursor-pointer">
            <div className="flex items-center py-0.5">
              <UKFlag />
              <span>English</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
