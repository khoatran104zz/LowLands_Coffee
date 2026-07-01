import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    type: "up" | "down";
    value: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md hover:border-amber-800/40 transition-all duration-300 flex flex-col justify-between",
        className
      )}
    >
      {/* Decorative Accent on Hover */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-900 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between">
        <div className="text-left">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider select-none font-outfit">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-zinc-850 dark:text-zinc-100 font-outfit mt-1 select-none">
            {value}
          </h3>
        </div>
        <div className="rounded-lg p-2.5 bg-amber-50 dark:bg-amber-950/20 group-hover:bg-amber-800/10 transition-colors duration-300">
          <Icon className="h-5 w-5 text-amber-800 dark:text-amber-500" />
        </div>
      </div>

      {(description || trend) && (
        <div className="flex items-center space-x-2 mt-4 text-xs font-semibold text-zinc-500">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md font-bold select-none text-[10px]",
                trend.type === "up" 
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200" 
                  : "text-rose-700 bg-rose-50 border border-rose-200"
              )}
            >
              {trend.type === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
          {description && <span className="select-none text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{description}</span>}
        </div>
      )}
    </div>
  );
}
