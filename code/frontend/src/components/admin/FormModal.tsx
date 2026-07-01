import React from "react";
import { Modal } from "@/components/ui/Modal";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  size = "md"
}: FormModalProps) {
  const content = onSubmit ? (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  ) : (
    <div className="space-y-4">
      {children}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      {content}
    </Modal>
  );
}
