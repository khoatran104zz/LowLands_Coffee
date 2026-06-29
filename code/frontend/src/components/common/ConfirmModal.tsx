"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  isLoading = false
}: ConfirmModalProps) {
  const { t } = useTranslation();

  const iconMap = {
    danger: <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
    info: <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
  };

  const confirmBtnClasses = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-800",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white"
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-5 text-left py-2">
        <div className="flex items-start space-x-3.5">
          <div className="shrink-0 mt-0.5 select-none">
            {iconMap[variant]}
          </div>
          <div className="flex-grow">
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 border-t border-border/40 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 text-xs font-bold rounded-xl px-4 cursor-pointer"
          >
            {cancelText || t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${confirmBtnClasses[variant]} h-10 text-xs font-bold rounded-xl px-5 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm`}
          >
            {isLoading && (
              <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            )}
            {confirmText || t("common.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
