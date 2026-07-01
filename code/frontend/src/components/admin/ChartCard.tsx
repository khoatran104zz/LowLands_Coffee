import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartCard({ title, description, children, className, actions }: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/85 pb-4 mb-4 select-none">
        <div className="text-left">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-outfit">
            {title}
          </h4>
          {description && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="flex-grow w-full flex items-center justify-center min-h-[240px]">
        {children}
      </div>
    </div>
  );
}
