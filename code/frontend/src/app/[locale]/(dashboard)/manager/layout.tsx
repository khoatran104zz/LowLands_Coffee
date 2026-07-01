import React from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";

export default function ManagerLayoutComponent({ children }: { children: React.ReactNode }) {
  return <ManagerLayout>{children}</ManagerLayout>;
}
