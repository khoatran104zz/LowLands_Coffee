import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface ConfirmDialogProps {
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

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  isLoading = false
}: ConfirmDialogProps) {
  const iconMap = {
    danger: <AlertCircle className="h-6 w-6 text-rose-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <Info className="h-6 w-6 text-amber-800" />
  };

  const confirmBtnClasses = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    info: "bg-amber-850 hover:bg-amber-800 text-white"
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
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 text-xs font-semibold rounded-lg px-4 cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${confirmBtnClasses[variant]} h-10 text-xs font-semibold rounded-lg px-5 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm`}
          >
            {isLoading && (
              <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            )}
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
