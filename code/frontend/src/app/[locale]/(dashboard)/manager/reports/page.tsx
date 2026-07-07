"use client";

import React from "react";
import { ReportsContainer } from "@/components/admin/ReportsContainer";

export default function ManagerReportsPage() {
  return <ReportsContainer isAdmin={false} />;
}
