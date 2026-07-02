"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Calendar, Coffee, Check, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Shift } from "@/services/shift.service";
import { getManagerShifts, assignManagerShift, deleteManagerShift } from "@/services/manager-shift.service";
import { getManagerStaff, ManagerStaff } from "@/services/manager-staff.service";
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

  const [staff, setStaff] = useState<ManagerStaff[]>([]);
  const branchName = staff[0]?.storeName || "";

  const activeStoreStaff = staff.filter((employee) => employee.status === "active");

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const data = await getManagerShifts({ date: selectedDate });
      setShifts(data);
    } catch (error) {
      console.error("Failed to load shifts", error);
      toast.error(t("manager.shifts.toastLoadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    void getManagerStaff().then(setStaff);
  }, []);

  useEffect(() => {
    if (isMounted) {
      void loadShifts();
    }
  }, [selectedDate, isMounted]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;

  const handleOpenAssign = () => {
    if (activeStoreStaff.length === 0) {
      toast.error(t("manager.shifts.toastActiveStaffRequired"));
      return;
    }
    setFormUserId(String(activeStoreStaff[0].userId));
    setFormShiftName("MORNING");
    setIsAssignOpen(true);
  };

  const handleSaveAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId) {
      toast.error(t("manager.shifts.toastStaffRequired"));
      return;
    }
    setIsActionLoading(true);
    try {
      await assignManagerShift({
        userId: Number(formUserId),
        shiftName: formShiftName,
        shiftDate: selectedDate,
      });
      toast.success(t("manager.shifts.toastAssignSuccess"));
      setIsAssignOpen(false);
      loadShifts();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || t("manager.shifts.toastAssignError");
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
      await deleteManagerShift(shiftToDelete.id);
      toast.success(t("manager.shifts.toastDeleteSuccess", { name: shiftToDelete.userFullName }));
      setIsDeleteOpen(false);
      loadShifts();
    } catch (error) {
      console.error(error);
      toast.error(t("manager.shifts.toastDeleteError"));
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
            {t("manager.shifts.title")} - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("manager.shifts.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenAssign}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("manager.shifts.btnCreate")}</span>
        </Button>
      </div>

      {/* Date selector toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
          <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">{t("manager.shifts.filterLabel")}</span>
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
          {t("common.loading")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Morning Shift */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 select-none">
              <div className="flex items-center space-x-2">
                <Coffee className="h-4 w-4 text-amber-700" />
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 uppercase tracking-wide font-outfit">{t("manager.shifts.shiftMorning")}</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-800/10 text-amber-800 border border-amber-800/10 px-2 py-0.5 rounded-md">06:00 - 12:00</span>
            </div>

            <div className="space-y-2.5">
              {morningShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium italic select-none">{t("manager.shifts.noAssignments")}</div>
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
                      title={t("manager.shifts.actionDeleteTitle")}
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
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 uppercase tracking-wide font-outfit">{t("manager.shifts.shiftAfternoon")}</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-orange-600/10 text-orange-700 border border-orange-600/10 px-2 py-0.5 rounded-md">12:00 - 18:00</span>
            </div>

            <div className="space-y-2.5">
              {afternoonShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium italic select-none">{t("manager.shifts.noAssignments")}</div>
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
                      title={t("manager.shifts.actionDeleteTitle")}
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
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 uppercase tracking-wide font-outfit">{t("manager.shifts.shiftNight")}</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-indigo-650/10 text-indigo-700 border border-indigo-650/10 px-2 py-0.5 rounded-md">18:00 - 23:00</span>
            </div>

            <div className="space-y-2.5">
              {nightShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium italic select-none">{t("manager.shifts.noAssignments")}</div>
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
                      title={t("manager.shifts.actionDeleteTitle")}
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
        title={t("manager.shifts.modalCreateTitle")}
        size="md"
      >
        <form onSubmit={handleSaveAssign} className="space-y-4 text-left">
          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("manager.shifts.modalLabelUser")}</label>
            <select
              value={formUserId}
              onChange={(e) => setFormUserId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              {activeStoreStaff.map((e) => (
                <option key={e.userId} value={e.userId}>
                  {e.fullName} ({e.employeeCode || "Nhân viên"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 select-none">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("manager.shifts.modalLabelShift")}</label>
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
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("manager.shifts.modalLabelDate")}</label>
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
              {t("manager.shifts.modalBtnCancel")}
            </Button>
            <Button
              type="submit"
              disabled={isActionLoading}
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4 cursor-pointer"
            >
              {t("manager.shifts.modalBtnSubmit")}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("manager.shifts.confirmDeleteTitle")}
        message={shiftToDelete ? t("manager.shifts.confirmDeleteMsg", { name: shiftToDelete.userFullName, date: shiftToDelete.shiftDate }) : ""}
        confirmText={t("manager.shifts.confirmDeleteBtn")}
        cancelText={t("manager.shifts.confirmDeleteCancel")}
      />
    </div>
  );
}

