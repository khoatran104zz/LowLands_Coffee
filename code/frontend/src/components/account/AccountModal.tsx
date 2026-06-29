"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ProfileCard } from "./ProfileCard";
import { SecuritySettings } from "./SecuritySettings";
import { PermissionList } from "./PermissionList";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";
import { User, Shield, Sliders, KeyRound, Check, RefreshCw, Moon, Sun, Bell, Mail, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export function AccountModal({ isOpen, onClose, defaultTab = "profile" }: AccountModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const user = useAuthStore((state) => state.user);

  // Preference tab states
  const [language, setLanguage] = useState("vi");
  const [darkMode, setDarkMode] = useState(false);
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);

  // Reset active tab when defaultTab changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!user) return null;

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefLoading(true);
    setTimeout(() => {
      setPrefLoading(false);
      toast.success("Đã lưu các cấu hình ứng dụng thành công!");
    }, 800);
  };

  const tabs = [
    { id: "profile", label: t("auth.account.profileInfo"), icon: User },
    { id: "security", label: t("auth.account.security"), icon: KeyRound },
    { id: "preferences", label: t("auth.account.preferences"), icon: Sliders },
    { id: "permissions", label: t("auth.account.permissions"), icon: Shield },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("auth.account.title")}
      size="xl"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[560px] lg:h-[480px] -m-1 text-zinc-800 dark:text-zinc-200">
        
        {/* Navigation Sidebar (Vertical tabs) */}
        <div className="w-full lg:w-48 flex lg:flex-col gap-1 border-b lg:border-b-0 lg:border-r border-zinc-150 dark:border-zinc-800/80 pb-3 lg:pb-0 lg:pr-4 shrink-0 text-left overflow-x-auto whitespace-nowrap lg:overflow-x-visible lg:whitespace-normal scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all w-full select-none ${
                  isActive
                    ? "bg-amber-850 text-white shadow-sm"
                    : "text-zinc-650 dark:text-zinc-400 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-500"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-amber-700"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Container */}
        <div className="flex-grow overflow-y-auto pr-1">
          {activeTab === "profile" && <ProfileCard />}

          {activeTab === "security" && <SecuritySettings />}

          {activeTab === "permissions" && <PermissionList />}

          {activeTab === "preferences" && (
            <div className="bg-white dark:bg-zinc-900/45 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-2xl text-left flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 mb-2 select-none flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-zinc-400" />
                <span>{t("auth.account.preferences")}</span>
              </h3>

              <form onSubmit={handleSavePreferences} className="space-y-4">
                {/* Language selection */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                      <Languages className="h-4 w-4 text-zinc-400" />
                      <span>{t("auth.account.language")}</span>
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-medium">Ngôn ngữ giao diện hệ thống</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    <option value="vi">Tiếng Việt (VI)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                {/* Theme toggle */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                      {darkMode ? <Moon className="h-4 w-4 text-zinc-400" /> : <Sun className="h-4 w-4 text-zinc-400" />}
                      <span>{t("auth.account.darkMode")}</span>
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-medium">Bật chế độ giao diện tối</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      darkMode ? "bg-amber-800" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        darkMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Order Notifications toggle */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-zinc-400" />
                      <span>{t("auth.account.notifyOrders")}</span>
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-medium">Nhận thông báo âm thanh và pop-up đơn mới</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyOrders(!notifyOrders)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifyOrders ? "bg-amber-800" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifyOrders ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing Email toggle */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      <span>{t("auth.account.notifyMarketing")}</span>
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-medium">Nhận thông tin cập nhật chương trình khuyến mãi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyMarketing(!notifyMarketing)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifyMarketing ? "bg-amber-800" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifyMarketing ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2 mt-2 shrink-0">
                  <Button
                    type="submit"
                    disabled={prefLoading}
                    className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 px-5 text-xs font-bold flex items-center space-x-2"
                  >
                    {prefLoading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>{prefLoading ? "Đang lưu..." : "Lưu các tùy chọn"}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
