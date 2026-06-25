import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Tìm kiếm..." }: SearchBarProps) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-4 h-10 w-full bg-background border-border focus-visible:ring-primary focus-visible:border-primary rounded-lg text-sm"
      />
    </div>
  );
}
