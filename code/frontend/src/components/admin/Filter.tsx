import React from "react";

interface FilterProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Filter({ label, value, onChange, options, placeholder = "Tất cả" }: FilterProps) {
  return (
    <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
      {label && (
        <span className="text-xs font-bold text-muted-foreground uppercase select-none whitespace-nowrap">
          {label}:
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full md:w-48 h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-800"
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
