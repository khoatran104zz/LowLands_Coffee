import React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const norm = status?.toLowerCase() || "";
  
  let label = status;
  let theme = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  if (norm === "active" || norm === "in_stock" || norm === "completed" || norm === "đang trực" || norm === "working") {
    theme = "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
    if (norm === "active") label = t("common.statuses.active");
    else if (norm === "in_stock") label = t("common.statuses.in_stock");
    else if (norm === "completed") label = t("common.statuses.completed");
    else label = t("common.statuses.working");
  } else if (norm === "inactive" || norm === "out_of_stock" || norm === "cancelled" || norm === "đã nghỉ" || norm === "off") {
    theme = "bg-rose-500/10 text-rose-700 border border-rose-500/20";
    if (norm === "inactive") label = t("common.statuses.inactive");
    else if (norm === "out_of_stock") label = t("common.statuses.out_of_stock");
    else if (norm === "cancelled") label = t("common.statuses.cancelled");
    else label = t("common.statuses.off");
  } else if (norm === "low_stock") {
    label = t("common.statuses.low_stock");
    theme = "bg-amber-500/10 text-amber-700 border border-amber-500/20";
  } else if (norm === "pending") {
    label = t("common.statuses.pending");
    theme = "bg-yellow-500/10 text-yellow-800 border border-yellow-500/20";
  } else if (norm === "processing") {
    label = t("common.statuses.processing");
    theme = "bg-orange-500/10 text-orange-700 border border-orange-500/20";
  } else if (norm === "draft") {
    label = t("common.statuses.draft");
    theme = "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none shrink-0 font-outfit",
        theme,
        className
      )}
    >
      {label}
    </span>
  );
}
