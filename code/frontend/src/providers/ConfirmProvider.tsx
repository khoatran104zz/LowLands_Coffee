"use client";

import React, { createContext, useState, useRef } from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm?: () => Promise<void> | void;
}

export type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "", message: "" });
  
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    setIsLoading(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = async () => {
    if (options.onConfirm) {
      setIsLoading(true);
      try {
        await options.onConfirm();
        if (resolveRef.current) resolveRef.current(true);
        setIsOpen(false);
      } catch (err) {
        console.error("Action error in confirm modal:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (resolveRef.current) resolveRef.current(true);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    if (resolveRef.current) resolveRef.current(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        isLoading={isLoading}
      />
    </ConfirmContext.Provider>
  );
}
