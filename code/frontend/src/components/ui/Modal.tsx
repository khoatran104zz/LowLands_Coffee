import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md"
}: ModalProps) {
  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
    full: "sm:max-w-[95vw] sm:max-h-[95vh] h-full"
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent 
        className={cn(
          "max-h-[90vh] overflow-y-auto duration-200 border border-border/80 shadow-2xl bg-background/95 backdrop-blur-md",
          sizeClasses[size], 
          className
        )}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-bold text-primary font-outfit border-b border-border/60 pb-2">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-foreground">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
