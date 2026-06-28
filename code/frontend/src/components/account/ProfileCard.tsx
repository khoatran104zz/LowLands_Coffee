"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { updateProfile } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";
import { User as UserIcon, Mail, Phone, Shield, Calendar, RefreshCw } from "lucide-react";
import Image from "next/image";

export function ProfileCard() {
  const user = useAuthStore((state) => state.user);
  const updateUserStore = useAuthStore((state) => state.updateUser);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Họ và tên không được để trống!");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      updateUserStore(updatedUser);
      toast.success(UI_TEXT.account.saveSuccess);
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Không thể cập nhật hồ sơ cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Left Column: Avatar & Logo Card */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
        {/* Brand Watermark logo */}
        <div className="absolute top-2 left-2 relative h-6 w-20 opacity-20 dark:opacity-10 select-none">
          <img src="/logo/logo.svg" alt="Lowlands Coffee" className="object-contain w-full h-full invert dark:invert-0" />
        </div>

        <div className="h-24 w-24 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-3xl shadow-md uppercase select-none ring-4 ring-amber-100 dark:ring-amber-950 mt-4">
          {getInitials(user.fullName)}
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.fullName}</h3>
          <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/30 px-2 py-0.5 rounded-full uppercase mt-1.5 tracking-wider font-outfit">
            {user.roleName || "Nhân viên"}
          </span>
        </div>

        <div className="w-full border-t border-zinc-200/60 dark:border-zinc-800/80 pt-4 mt-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>{UI_TEXT.account.joinedDate}: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}</span>
        </div>
      </div>

      {/* Right Column: Editable Profile fields */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-2xl flex flex-col gap-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 mb-2 select-none">
          {UI_TEXT.account.profileInfo}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{UI_TEXT.account.fullName} *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                <UserIcon className="h-4 w-4" />
              </span>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="h-10 text-xs border-zinc-200 dark:border-zinc-800 bg-background text-foreground pl-9 rounded-lg"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="flex flex-col gap-1.5 opacity-75">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{UI_TEXT.account.email} (Định danh)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                disabled
                readOnly
                value={user.email}
                type="email"
                className="h-10 text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 pl-9 rounded-lg select-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{UI_TEXT.account.phone}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                <Phone className="h-4 w-4" />
              </span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx.xxx.xxx"
                className="h-10 text-xs border-zinc-200 dark:border-zinc-800 bg-background text-foreground pl-9 rounded-lg"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-2 shrink-0">
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 px-5 text-xs font-bold flex items-center space-x-2"
            >
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{loading ? "Đang lưu..." : UI_TEXT.account.editProfile}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
