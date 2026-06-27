"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";
import { Lock, KeyRound, ShieldCheck, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(UI_TEXT.account.passwordError);
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);

    // Simulate API request to change password
    setTimeout(() => {
      setLoading(false);
      toast.success("Thay đổi mật khẩu tài khoản thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1200);
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    if (nextState) {
      toast.success("Đã kích hoạt Xác thực 2 yếu tố (2FA) thành công!");
    } else {
      toast.info("Đã tắt Xác thực 2 yếu tố (2FA).");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      {/* Change Password Card */}
      <div className="bg-white dark:bg-zinc-900/45 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-2xl flex flex-col gap-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 mb-2 select-none flex items-center gap-1.5">
          <KeyRound className="h-4 w-4 text-zinc-400" />
          <span>{UI_TEXT.account.changePassword}</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{UI_TEXT.account.currentPassword} *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                className="h-10 text-xs border-zinc-200 dark:border-zinc-800 bg-background text-foreground pl-9 rounded-lg"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{UI_TEXT.account.newPassword} *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="h-10 text-xs border-zinc-200 dark:border-zinc-800 bg-background text-foreground pl-9 rounded-lg"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{UI_TEXT.account.confirmNewPassword} *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="h-10 text-xs border-zinc-200 dark:border-zinc-800 bg-background text-foreground pl-9 rounded-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2 mt-2 shrink-0">
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 px-5 text-xs font-bold flex items-center space-x-2 w-full sm:w-auto"
            >
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="bg-white dark:bg-zinc-900/45 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-2xl flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 mb-2 select-none flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-zinc-400" />
            <span>{UI_TEXT.account.twoFactor}</span>
          </h3>

          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
            Kích hoạt xác thực 2 lớp bằng cách sử dụng ứng dụng Google Authenticator hoặc Microsoft Authenticator để tạo mã OTP xác minh danh tính khi đăng nhập.
          </p>

          <div className="flex items-center justify-between border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-950 mt-4 select-none">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-zinc-850 dark:text-zinc-200">Trạng thái bảo vệ</span>
              <span className={`text-[10px] font-bold ${twoFactorEnabled ? "text-emerald-600" : "text-zinc-400"}`}>
                {twoFactorEnabled ? "Đang bật" : "Đang tắt"}
              </span>
            </div>
            <button
              onClick={handleToggle2FA}
              className="text-zinc-450 hover:text-amber-800 focus:outline-none transition-colors"
            >
              {twoFactorEnabled ? (
                <ToggleRight className="h-9 w-9 text-amber-700" />
              ) : (
                <ToggleLeft className="h-9 w-9 text-zinc-350" />
              )}
            </button>
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 italic bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 mt-2">
          Lưu ý: Đây là phiên bản cấu hình bảo mật thử nghiệm. Hãy giữ an toàn cho khóa thiết lập của bạn.
        </div>
      </div>
    </div>
  );
}
