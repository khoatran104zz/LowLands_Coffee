"use client";

import React from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-left select-none">
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("common.reports")}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Bao cao doanh thu chi tiet se duoc kich hoat khi Order/Payment backend va report endpoint san sang.
        </p>
      </div>

      <div className="min-h-[360px] rounded-xl border border-dashed border-amber-300 bg-amber-50/40 flex flex-col items-center justify-center text-center px-6">
        <FileText className="h-10 w-10 text-amber-800 mb-3" />
        <h2 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
          Order/Payment backend chua trien khai
        </h2>
        <p className="text-xs text-muted-foreground font-semibold mt-2 max-w-md">
          Trang reports khong con dung INITIAL_ORDERS, mock branch revenue, hay random data. Khi backend co report endpoint that, cac bieu do doanh thu va thanh toan se duoc ket noi tai day.
        </p>
      </div>
    </div>
  );
}
