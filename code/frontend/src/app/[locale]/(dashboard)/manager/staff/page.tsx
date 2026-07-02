"use client";

import React, { useState, useEffect } from "react";
import { Employee, useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles, Eye, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

export default function ManagerStaffPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const employees = useDashboardStore((state) => state.employees);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);
  const updateEmployee = useDashboardStore((state) => state.updateEmployee);
  
  const currentUser = useAuthStore((state) => state.user);
  
  // StoreId = 2 Hồ Con Rùa branch employees ONLY (or from auth user)
  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  // Modal controls
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isToggleStatusOpen, setIsToggleStatusOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    void hydrateUsers();
  }, [hydrateUsers]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const branchEmployees = employees.filter((e) => e.branchId === myBranchId);

  const columns: Column<Employee>[] = [
    {
      key: "employeeCode",
      header: t("manager.staff.colCode"),
      render: (item) => <span className="font-mono font-bold text-zinc-650">{item.employeeCode || t("manager.staff.noCode")}</span>
    },
    { key: "fullName", header: t("manager.staff.colName") },
    { key: "workingShift", header: t("manager.staff.colShift"), render: (item) => item.workingShift || "Chưa chia ca" },
    { key: "phone", header: t("manager.staff.colPhone") },
    { key: "email", header: t("manager.staff.colEmail") },
    {
      key: "performance",
      header: t("manager.staff.colPerformance"),
      render: (item) => (
        <span className="inline-flex items-center space-x-1 font-bold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2.5 py-0.5 rounded-lg text-xs select-none">
          <Sparkles className="h-3 w-3 text-amber-800" />
          <span>{item.performance || "Khá Tốt"}</span>
        </span>
      )
    },
    {
      key: "status",
      header: t("manager.staff.colStatus"),
      render: (item) => {
        const isActive = item.status === "active";
        return (
          <StatusBadge
            status={isActive ? "active" : "inactive"}
            customLabel={isActive ? t("manager.staff.statusActive") : t("manager.staff.statusInactive")}
          />
        );
      }
    }
  ];

  const handleOpenDetail = (staff: Employee) => {
    setSelectedStaff(staff);
    setIsDetailOpen(true);
  };

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
      toast.success(
        nextStatus === "active"
          ? `Đã mở khóa hoạt động cho nhân viên ${selectedStaff.fullName}`
          : `Đã khóa tạm thời tài khoản của nhân viên ${selectedStaff.fullName}`
      );
      setIsToggleStatusOpen(false);
      setIsDetailOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật trạng thái nhân viên.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
          {t("manager.staff.title")} - {branchName}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          {t("manager.staff.subtitle")}
        </p>
      </div>

      {/* Filter search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("manager.staff.searchPlaceholder")}
        />
      </div>

      {/* Table */}
      <DataTable
        data={branchEmployees}
        columns={columns}
        searchKey="fullName"
        searchQuery={searchQuery}
        onView={handleOpenDetail}
        extraActions={[
          {
            icon: Eye,
            onClick: handleOpenDetail,
            color: "text-zinc-600 hover:bg-zinc-50",
            title: "Xem chi tiết & quản lý",
            visible: () => true
          }
        ]}
      />

      {/* Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Thông tin nhân viên: ${selectedStaff?.fullName || ""}`}
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
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Mã NV: {selectedStaff.employeeCode || "Chưa cấp"}</div>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-xl border border-border">
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Email nội bộ</span>
                <span className="text-zinc-800 dark:text-zinc-250 font-bold">{selectedStaff.email}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Số điện thoại</span>
                <span className="text-zinc-800 dark:text-zinc-250 font-bold">{selectedStaff.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Chi nhánh làm việc</span>
                <span className="text-[#c8510a] font-bold">{selectedStaff.branchName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Vị trí trực quầy</span>
                <span className="text-zinc-800 dark:text-zinc-250 uppercase font-bold">
                  {selectedStaff.role === "manager" ? "Cửa hàng trưởng" : "Barista / Thu ngân"}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Lịch làm ca hiện tại</span>
                <span className="text-zinc-800 dark:text-zinc-250 font-bold">{selectedStaff.workingShift || "Chưa phân lịch"}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/40 pb-2">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Đánh giá hiệu suất</span>
                <span className="font-extrabold text-amber-900 bg-amber-800/10 border border-amber-800/10 px-2 py-0.5 rounded-md text-[10px]">
                  {selectedStaff.performance || "Khá Tốt (85/100)"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-400 font-bold uppercase text-[9px] select-none">Trạng thái tài khoản</span>
                <StatusBadge
                  status={selectedStaff.status}
                  customLabel={selectedStaff.status === "active" ? "Đang hoạt động" : "Khóa tạm thời"}
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
                Đóng
              </Button>

              <Button
                onClick={handleOpenToggleStatus}
                className={
                  selectedStaff.status === "active"
                    ? "bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
                }
              >
                {selectedStaff.status === "active" ? "Khóa tài khoản" : "Kích hoạt lại"}
              </Button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Confirm Toggle Status Dialog */}
      <ConfirmDialog
        isOpen={isToggleStatusOpen}
        onClose={() => setIsToggleStatusOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={selectedStaff?.status === "active" ? "Khóa tài khoản nhân viên" : "Mở khóa tài khoản nhân viên"}
        message={
          selectedStaff?.status === "active"
            ? `Bạn có chắc chắn muốn khóa tạm thời tài khoản của nhân viên ${selectedStaff?.fullName}? Nhân viên này sẽ không thể đăng nhập vào POS.`
            : `Kích hoạt lại tài khoản cho nhân viên ${selectedStaff?.fullName}?`
        }
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
      />
    </div>
  );
}
