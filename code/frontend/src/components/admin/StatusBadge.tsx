import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = status?.toLowerCase() || "";
  
  let label = status;
  let theme = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  if (norm === "active" || norm === "in_stock" || norm === "completed" || norm === "đang trực") {
    label = norm === "active" ? "Đang hoạt động" : norm === "in_stock" ? "Còn hàng" : norm === "completed" ? "Hoàn thành" : "Đang trực";
    theme = "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
  } else if (norm === "inactive" || norm === "out_of_stock" || norm === "cancelled" || norm === "đã nghỉ") {
    label = norm === "inactive" ? "Ngưng hoạt động" : norm === "out_of_stock" ? "Hết hàng" : norm === "cancelled" ? "Đã hủy" : "Đã nghỉ";
    theme = "bg-rose-500/10 text-rose-700 border border-rose-500/20";
  } else if (norm === "low_stock") {
    label = "Sắp hết hàng";
    theme = "bg-amber-500/10 text-amber-700 border border-amber-500/20";
  } else if (norm === "pending") {
    label = "Chờ xử lý";
    theme = "bg-yellow-500/10 text-yellow-800 border border-yellow-500/20";
  } else if (norm === "processing") {
    label = "Đang chế biến";
    theme = "bg-orange-500/10 text-orange-700 border border-orange-500/20";
  } else if (norm === "draft") {
    label = "Nháp";
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
