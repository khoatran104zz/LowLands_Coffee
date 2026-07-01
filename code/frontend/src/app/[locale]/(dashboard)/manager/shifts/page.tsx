"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function ManagerShiftsPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            {t("manager.shifts.title")} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("manager.shifts.subtitle")}
          </p>
        </div>
      </div>

      {/* Alert Card */}
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <Clock className="h-10 w-10 text-amber-850 animate-pulse mb-3" />
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide font-outfit">{t("manager.shifts.waitingBE")}</h3>
        <p className="text-xs text-muted-foreground mt-2 text-center max-w-sm font-medium">
          {t("manager.shifts.waitingBEDesc")}
        </p>
      </div>
    </div>
  );
}
