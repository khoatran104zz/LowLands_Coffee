import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Tìm kiếm..." }: SearchBarProps) {
  return (
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 h-10 text-xs border-border bg-background focus-visible:ring-1 focus-visible:ring-amber-800 focus-visible:border-amber-800 rounded-lg w-full"
      />
    </div>
  );
}
