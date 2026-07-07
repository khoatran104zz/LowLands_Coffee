"use client";

import React from "react";
import { ReportsContainer } from "@/components/admin/ReportsContainer";

export default function AdminReportsPage() {
  return <ReportsContainer isAdmin={true} />;
}
