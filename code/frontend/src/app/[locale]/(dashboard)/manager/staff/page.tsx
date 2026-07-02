"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormModal } from "@/components/admin/FormModal";
import { useTranslation } from "@/hooks/useTranslation";
<<<<<<< HEAD
import { getManagerStaff, ManagerStaff } from "@/services/manager-staff.service";
=======
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a

export default function ManagerStaffPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
<<<<<<< HEAD
  const [staff, setStaff] = useState<ManagerStaff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<ManagerStaff | null>(null);
=======

  const employees = useDashboardStore((state) => state.employees);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);
  const updateEmployee = useDashboardStore((state) => state.updateEmployee);
  
  const currentUser = useAuthStore((state) => state.user);
  
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  // Modal controls
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a
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
<<<<<<< HEAD
    { key: "position", header: t("manager.staff.colShift") },
    { key: "phone", header: t("manager.staff.colPhone") },
    { key: "email", header: t("manager.staff.colEmail") },
    {
=======
    { key: "workingShift", header: t("manager.staff.colShift"), render: (item) => item.workingShift || t("manager.staff.colShiftEmpty") },
    { key: "phone", header: t("manager.staff.colPhone") },
    { key: "email", header: t("manager.staff.colEmail") },
    {
      key: "performance",
      header: t("manager.staff.colPerformance"),
      render: (item) => (
        <span className="inline-flex items-center space-x-1 font-bold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2.5 py-0.5 rounded-lg text-xs select-none">
          <Sparkles className="h-3 w-3 text-amber-800" />
          <span>{item.performance || t("manager.staff.perfGood")}</span>
        </span>
      )
    },
    {
>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a
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

<<<<<<< HEAD
=======
  const handleOpenToggleStatus = () => {
    setIsToggleStatusOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedStaff) return;
    setIsActionLoading(true);
    try {
      const nextStatus = selectedStaff.status === "active" ? "inactive" : "active";
      await updateEmployee({
        ...selectedStaff,
        status: nextStatus
      });
      
      const successMsg = nextStatus === "active"
        ? t("manager.staff.toastUnlockSuccess", { name: selectedStaff.fullName })
        : t("manager.staff.toastLockSuccess", { name: selectedStaff.fullName });
      
      toast.success(successMsg);
      setIsToggleStatusOpen(false);
      setIsDetailOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("manager.staff.toastError"));
    } finally {
      setIsActionLoading(false);
    }
  };

>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a
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
<<<<<<< HEAD
        extraActions={[
          {
            icon: Eye,
            onClick: handleOpenDetail,
            color: "text-zinc-600 hover:bg-zinc-50",
            title: "View details",
            visible: () => true,
          },
        ]}
=======
>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a
      />

      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
<<<<<<< HEAD
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
=======
        title={selectedStaff ? t("manager.staff.modalDetailTitle", { name: selectedStaff.fullName }) : ""}
        size="md"
      >
        {selectedStaff && (
          <div className="space-y-5 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center space-x-3 bg-muted/40 p-4 rounded-xl border border-border select-none">
              <div className="bg-amber-850 text-white h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedStaff.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">{selectedStaff.fullName}</h4>
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                  {selectedStaff.employeeCode 
                    ? t("manager.staff.modalEmpCode", { code: selectedStaff.employeeCode })
                    : t("manager.staff.modalEmpNoCode")
                  }
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-xl border border-border">
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelEmail")}</span>
                <span className="text-zinc-800 dark:text-zinc-250 font-bold">{selectedStaff.email}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelPhone")}</span>
                <span className="text-zinc-800 dark:text-zinc-250 font-bold">{selectedStaff.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelBranch")}</span>
                <span className="text-[#c8510a] font-bold">{selectedStaff.branchName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelRole")}</span>
                <span className="text-zinc-800 dark:text-zinc-250 uppercase font-bold">
                  {selectedStaff.role === "manager" ? t("manager.staff.modalRoleManager") : t("manager.staff.modalRoleStaff")}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelShift")}</span>
                <span className="text-zinc-800 dark:text-zinc-250 font-bold">{selectedStaff.workingShift || t("manager.staff.modalShiftEmpty")}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelPerf")}</span>
                <span className="font-extrabold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2 py-0.5 rounded-md text-[10px]">
                  {selectedStaff.performance || t("manager.staff.modalPerfValue")}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">{t("manager.staff.modalLabelStatus")}</span>
                <StatusBadge
                  status={selectedStaff.status}
                  customLabel={selectedStaff.status === "active" ? t("manager.staff.modalStatusActive") : t("manager.staff.modalStatusInactive")}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-border pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="h-10 text-xs font-semibold rounded-lg"
              >
                {t("manager.staff.modalBtnClose")}
              </Button>

              <Button
                onClick={handleOpenToggleStatus}
                className={
                  selectedStaff.status === "active"
                    ? "bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                }
              >
                {selectedStaff.status === "active" ? t("manager.staff.modalBtnLock") : t("manager.staff.modalBtnUnlock")}
              </Button>
>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a
            </div>
          </div>
        )}
      </FormModal>
<<<<<<< HEAD
=======

      {/* Confirm Toggle Status Dialog */}
      <ConfirmDialog
        isOpen={isToggleStatusOpen}
        onClose={() => setIsToggleStatusOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={selectedStaff?.status === "active" ? t("manager.staff.confirmLockTitle") : t("manager.staff.confirmUnlockTitle")}
        message={
          selectedStaff?.status === "active"
            ? t("manager.staff.confirmLockMsg", { name: selectedStaff?.fullName || "" })
            : t("manager.staff.confirmUnlockMsg", { name: selectedStaff?.fullName || "" })
        }
        confirmText={t("manager.staff.confirmBtn")}
        cancelText={t("manager.staff.confirmCancel")}
      />
>>>>>>> 54a6bd0c9437303967cbdf41710e49c89c345a1a
    </div>
  );
}
