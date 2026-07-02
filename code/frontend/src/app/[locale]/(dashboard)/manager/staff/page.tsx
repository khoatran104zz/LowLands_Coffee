"use client";

import React, { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormModal } from "@/components/admin/FormModal";
import { useTranslation } from "@/hooks/useTranslation";
import { getManagerStaff, ManagerStaff } from "@/services/manager-staff.service";

export default function ManagerStaffPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState<ManagerStaff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<ManagerStaff | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const branchName = staff[0]?.storeName || "";

  const loadStaff = async () => {
    const data = await getManagerStaff();
    setStaff(data);
  };

  useEffect(() => {
    setIsMounted(true);
    void loadStaff();
  }, []);

  if (!isMounted) {
    return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;
  }

  const columns: Column<ManagerStaff>[] = [
    {
      key: "employeeCode",
      header: t("manager.staff.colCode"),
      render: (item) => <span className="font-mono font-bold text-zinc-650">{item.employeeCode || t("manager.staff.noCode")}</span>,
    },
    { key: "fullName", header: t("manager.staff.colName") },
    { key: "position", header: t("manager.staff.colShift") },
    { key: "phone", header: t("manager.staff.colPhone") },
    { key: "email", header: t("manager.staff.colEmail") },
    {
      key: "status",
      header: t("manager.staff.colStatus"),
      render: (item) => (
        <StatusBadge
          status={item.status === "active" ? "active" : "inactive"}
          customLabel={item.status === "active" ? t("manager.staff.statusActive") : t("manager.staff.statusInactive")}
        />
      ),
    },
  ];

  const handleOpenDetail = (item: ManagerStaff) => {
    setSelectedStaff(item);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("manager.staff.title")} {branchName ? `- ${branchName}` : ""}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("manager.staff.subtitle")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("manager.staff.searchPlaceholder")}
        />
      </div>

      <DataTable
        data={staff}
        columns={columns}
        searchKey="fullName"
        searchQuery={searchQuery}
        onView={handleOpenDetail}
      />

      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedStaff?.fullName || ""}
        size="md"
      >
        {selectedStaff && (
          <div className="space-y-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <div className="flex justify-between border-b border-zinc-200/40 pb-2">
              <span className="text-zinc-400 font-bold uppercase text-[9px]">Employee code</span>
              <span>{selectedStaff.employeeCode || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/40 pb-2">
              <span className="text-zinc-400 font-bold uppercase text-[9px]">Email</span>
              <span>{selectedStaff.email}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/40 pb-2">
              <span className="text-zinc-400 font-bold uppercase text-[9px]">Phone</span>
              <span>{selectedStaff.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/40 pb-2">
              <span className="text-zinc-400 font-bold uppercase text-[9px]">Store</span>
              <span>{selectedStaff.storeName}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/40 pb-2">
              <span className="text-zinc-400 font-bold uppercase text-[9px]">Position</span>
              <span>{selectedStaff.position}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-zinc-400 font-bold uppercase text-[9px]">Status</span>
              <StatusBadge status={selectedStaff.status === "active" ? "active" : "inactive"} />
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
