import React from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
  placeholder?: string;
}

export function Filter({
  value,
  onChange,
  options,
  label,
  placeholder = "Tất cả"
}: FilterProps) {
  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{label}:</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
