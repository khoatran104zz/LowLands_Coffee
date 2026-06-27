"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { User as UserIcon, Settings, Key, LogOut, ChevronDown, Bell } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text";

interface AccountDropdownProps {
  onOpenSettings: (defaultTab?: string) => void;
  onLogout: () => void;
}

export function AccountDropdown({ onOpenSettings, onLogout }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  // Map roles to displays
  const getRoleLabel = (roleName: string) => {
    switch (roleName?.toUpperCase()) {
      case "ADMIN":
        return "Admin Tổng";
      case "MANAGER":
        return "Cửa hàng trưởng";
      case "STAFF":
        return "Nhân viên";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return "Nhân viên";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 pr-3 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-2xs hover:shadow-xs transition-all duration-200 focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-amber-800 hover:bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0 select-none uppercase transition-colors">
          {getInitials(user.fullName)}
        </div>
        <div className="hidden sm:block text-left max-w-[120px] select-none">
          <span className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
            {user.fullName}
          </span>
          <span className="block text-[9px] text-zinc-500 font-semibold uppercase leading-none mt-0.5 tracking-wider">
            {getRoleLabel(user.roleName || "")}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-fade-in-down p-1 text-left">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
            <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
              {user.fullName}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5 truncate font-medium">
              {user.email}
            </span>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings("profile");
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-500 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-zinc-400 group-hover:text-amber-700" />
              <span>{UI_TEXT.account.profileInfo}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings("preferences");
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-500 transition-colors"
            >
              <Settings className="h-4 w-4 text-zinc-400 group-hover:text-amber-700" />
              <span>{UI_TEXT.account.preferences}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings("security");
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-500 transition-colors"
            >
              <Key className="h-4 w-4 text-zinc-400 group-hover:text-amber-700" />
              <span>{UI_TEXT.account.changePassword}</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings("permissions");
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-500 transition-colors"
            >
              <Bell className="h-4 w-4 text-zinc-400 group-hover:text-amber-700" />
              <span>{UI_TEXT.account.permissions}</span>
            </button>

            <div className="border-t border-zinc-100 dark:border-zinc-800/80 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/5 transition-colors"
            >
              <LogOut className="h-4 w-4 text-rose-500/80" />
              <span>{UI_TEXT.common.logout}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
