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
        "group relative overflow-hidden bg-card/60 backdrop-blur-md rounded-xl border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between",
        className
      )}
    >
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-800 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground font-outfit uppercase tracking-wider select-none">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-foreground font-outfit mt-1 select-none">
            {value}
          </h3>
        </div>
        <div className="rounded-lg p-2.5 bg-muted/40 group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="h-5 w-5 text-amber-800/80 group-hover:text-primary transition-colors duration-300" />
        </div>
      </div>

      {(description || trend) && (
        <div className="flex items-center space-x-2 mt-4 text-xs font-medium text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md font-semibold select-none",
                trend.type === "up" 
                  ? "text-emerald-700 bg-emerald-500/10" 
                  : "text-rose-700 bg-rose-500/10"
              )}
            >
              {trend.type === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
          {description && <span className="select-none text-[11px]">{description}</span>}
        </div>
      )}
    </div>
  );
}
