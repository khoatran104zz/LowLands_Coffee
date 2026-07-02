"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Calendar, Coffee, Check, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useDashboardStore } from "@/store/dashboardStore";
import { useTranslation } from "@/hooks/useTranslation";
import { getShifts, assignShift, deleteShift, Shift } from "@/services/shift.service";
import { FormModal } from "@/components/admin/FormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ManagerShiftsPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [formUserId, setFormUserId] = useState<string>("");
  const [formShiftName, setFormShiftName] = useState<string>("MORNING");

  // Stores
  const currentUser = useAuthStore((state) => state.user);
  const employees = useDashboardStore((state) => state.employees);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);

  const myBranchId = currentUser?.branchId || 2;
  const branchName = currentUser?.branchName || "Hồ Con Rùa";

  // Filter active staff at our store
  const activeStoreStaff = employees.filter(
    (e) => e.branchId === myBranchId && e.status === "active"
  );

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const data = await getShifts(myBranchId, { date: selectedDate });
      setShifts(data);
    } catch (error) {
      console.error("Failed to load shifts", error);
      toast.error("Không thể tải danh sách ca làm việc.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    void hydrateUsers();
  }, [hydrateUsers]);

  useEffect(() => {
    if (isMounted) {
      void loadShifts();
    }
  }, [selectedDate, isMounted]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">Đang tải...</div>;

  const handleOpenAssign = () => {
    if (activeStoreStaff.length === 0) {
      toast.error("Vui lòng kích hoạt/thêm nhân viên cho chi nhánh trước.");
      return;
    }
    setFormUserId(String(activeStoreStaff[0].id));
    setFormShiftName("MORNING");
    setIsAssignOpen(true);
  };

  const handleSaveAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId) {
      toast.error("Vui lòng chọn nhân sự.");
      return;
    }
    setIsActionLoading(true);
    try {
      await assignShift(myBranchId, {
        userId: Number(formUserId),
        shiftName: formShiftName,
        shiftDate: selectedDate,
      });
      toast.success("Phân ca làm việc thành công!");
      setIsAssignOpen(false);
      loadShifts();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Không thể phân ca làm việc.";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDelete = (shift: Shift) => {
    setShiftToDelete(shift);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;
    setIsActionLoading(true);
    try {
      await deleteShift(shiftToDelete.id);
      toast.success(`Đã xóa ca của ${shiftToDelete.userFullName}`);
      setIsDeleteOpen(false);
      loadShifts();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa ca làm việc.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Group shifts for UI display
  const morningShifts = shifts.filter((s) => s.shiftName === "MORNING");
  const afternoonShifts = shifts.filter((s) => s.shiftName === "AFTERNOON");
  const nightShifts = shifts.filter((s) => s.shiftName === "NIGHT");

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-850" />
            Ca Làm Việc & Lịch Trực - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Phân bổ ca trực và gán barista làm việc cho chi nhánh của bạn.
          </p>
        </div>
        <Button
          onClick={handleOpenAssign}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Gán ca trực mới</span>
        </Button>
      </div>

      {/* Date selector toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
          <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Chọn ngày xem lịch:</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 text-xs border-border bg-background w-full sm:w-48 font-bold text-amber-900"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground font-semibold">
          Đang tải lịch trực ca...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Morning Shift */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 select-none">
              <div className="flex items-center space-x-2">
                <Coffee className="h-4 w-4 text-amber-700" />
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 uppercase tracking-wide font-outfit">Ca Sáng (Morning)</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-800/10 text-amber-800 border border-amber-800/10 px-2 py-0.5 rounded-md">06:00 - 12:00</span>
            </div>

            <div className="space-y-2.5">
              {morningShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium italic select-none">Chưa gán nhân sự</div>
              ) : (
                morningShifts.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 rounded-xl">
                    <div>
                      <div className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs">{s.userFullName}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">{s.userEmail}</div>
                    </div>
                    <button
                      onClick={() => handleOpenDelete(s)}
                      className="text-zinc-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa phân ca"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Afternoon Shift */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 select-none">
              <div className="flex items-center space-x-2">
                <Coffee className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 uppercase tracking-wide font-outfit">Ca Chiều (Afternoon)</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-orange-600/10 text-orange-700 border border-orange-600/10 px-2 py-0.5 rounded-md">12:00 - 18:00</span>
            </div>

            <div className="space-y-2.5">
              {afternoonShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium italic select-none">Chưa gán nhân sự</div>
              ) : (
                afternoonShifts.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 rounded-xl">
                    <div>
                      <div className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs">{s.userFullName}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">{s.userEmail}</div>
                    </div>
                    <button
                      onClick={() => handleOpenDelete(s)}
                      className="text-zinc-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa phân ca"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Night Shift */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 select-none">
              <div className="flex items-center space-x-2">
                <Coffee className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 uppercase tracking-wide font-outfit">Ca Tối (Night)</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-indigo-650/10 text-indigo-700 border border-indigo-650/10 px-2 py-0.5 rounded-md">18:00 - 23:00</span>
            </div>

            <div className="space-y-2.5">
              {nightShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium italic select-none">Chưa gán nhân sự</div>
              ) : (
                nightShifts.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 rounded-xl">
                    <div>
                      <div className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs">{s.userFullName}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">{s.userEmail}</div>
                    </div>
                    <button
                      onClick={() => handleOpenDelete(s)}
                      className="text-zinc-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa phân ca"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <FormModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Gán phân ca làm việc"
        size="md"
      >
        <form onSubmit={handleSaveAssign} className="space-y-4 text-left">
          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">Chọn nhân sự chi nhánh *</label>
            <select
              value={formUserId}
              onChange={(e) => setFormUserId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              {activeStoreStaff.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeCode || "Nhân viên"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">Chọn ca trực *</label>
            <select
              value={formShiftName}
              onChange={(e) => setFormShiftName(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="MORNING">Ca Sáng (06:00 - 12:00)</option>
              <option value="AFTERNOON">Ca Chiều (12:00 - 18:00)</option>
              <option value="NIGHT">Ca Tối (18:00 - 23:00)</option>
            </select>
          </div>

          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">Ngày trực trực quan</label>
            <Input
              readOnly
              disabled
              value={selectedDate}
              className="h-10 text-xs border-border bg-muted/65 font-bold"
            />
          </div>

          <div className="flex justify-end space-x-2 border-t border-border pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignOpen(false)}
              disabled={isActionLoading}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isActionLoading}
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
            >
              Xác nhận gán
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa phân ca làm việc"
        message={`Bạn có chắc chắn muốn xóa ca làm việc của nhân sự ${shiftToDelete?.userFullName} vào ngày ${shiftToDelete?.shiftDate}?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
      />
    </div>
  );
}
