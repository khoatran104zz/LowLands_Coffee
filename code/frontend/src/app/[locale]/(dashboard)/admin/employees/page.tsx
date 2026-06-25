"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Employee } from "@/mock/employees";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Filter } from "@/components/tables/Filter";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";

export default function AdminEmployeesPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Filters & searches
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  // Store data & actions
  const employees = useDashboardStore((state) => state.employees);
  const branches = useDashboardStore((state) => state.branches);
  const addEmployee = useDashboardStore((state) => state.addEmployee);
  const updateEmployee = useDashboardStore((state) => state.updateEmployee);
  const deleteEmployee = useDashboardStore((state) => state.deleteEmployee);

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(null);

  // Form input states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<Employee["role"]>("staff");
  const [formBranchId, setFormBranchId] = useState("");
  const [formShift, setFormShift] = useState("Ca Sáng (06:00 - 14:00)");
  const [formStatus, setFormStatus] = useState<Employee["status"]>("active");
  const [formPerf, setFormPerf] = useState("Chưa đánh giá");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  // Filter employees by branch
  const filteredEmployees = employees.filter((e) => {
    if (!branchFilter) return true;
    return e.branchId === parseInt(branchFilter);
  });

  const branchFilterOptions = branches.map((b) => ({
    value: String(b.id),
    label: b.name
  }));

  // Columns definition
  const columns: Column<Employee>[] = [
    { key: "id", header: "Mã NV" },
    { key: "fullName", header: "Họ và tên" },
    {
      key: "role",
      header: "Chức vụ",
      render: (item) => {
        const labels = {
          admin: "Admin Tổng",
          manager: "Cửa hàng trưởng",
          staff: "Nhân viên quầy"
        };
        return <span className="font-semibold">{labels[item.role]}</span>;
      }
    },
    { key: "branchName", header: "Chi nhánh" },
    { key: "workingShift", header: "Ca làm việc" },
    { key: "phone", header: "Điện thoại" },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none ${
            item.status === "active"
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-zinc-500/10 text-zinc-650"
          }`}
        >
          {item.status === "active" ? "Đang trực" : "Đã nghỉ"}
        </span>
      )
    }
  ];

  // Open creation form
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("staff");
    setFormBranchId(branches[0]?.id ? String(branches[0].id) : "");
    setFormShift("Ca Sáng (06:00 - 14:00)");
    setFormStatus("active");
    setFormPerf("Khá");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.fullName);
    setFormEmail(emp.email);
    setFormPhone(emp.phone);
    setFormRole(emp.role);
    setFormBranchId(String(emp.branchId));
    setFormShift(emp.workingShift || "");
    setFormStatus(emp.status);
    setFormPerf(emp.performance || "Khá");
    setIsFormOpen(true);
  };

  const handleOpenDelete = (emp: Employee) => {
    setDeletingEmployeeId(emp.id);
    setIsDeleteOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formBranchId) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (editingEmployee) {
      updateEmployee({
        id: editingEmployee.id,
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        branchId: parseInt(formBranchId),
        branchName: "", // will be calculated by store action
        workingShift: formShift,
        status: formStatus,
        performance: formPerf
      });
      toast.success("Cập nhật nhân viên thành công!");
    } else {
      addEmployee({
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        branchId: parseInt(formBranchId),
        branchName: "", // will be calculated by store action
        workingShift: formShift,
        status: formStatus,
        performance: formPerf
      });
      toast.success("Tuyển dụng nhân viên mới thành công!");
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingEmployeeId) {
      deleteEmployee(deletingEmployeeId);
      toast.success("Đã thôi việc nhân viên thành công!");
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {UI_TEXT.common.employees}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Quản lý tài khoản nội bộ, lịch ca làm việc và phân quyền của toàn chuỗi cửa hàng.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tuyển dụng nhân sự</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên nhân viên, số điện thoại..."
        />
        <Filter
          label="Chi nhánh"
          value={branchFilter}
          onChange={setBranchFilter}
          options={branchFilterOptions}
          placeholder="Tất cả chi nhánh"
        />
      </div>

      {/* Employees Table */}
      <DataTable
        data={filteredEmployees}
        columns={columns}
        searchKey="fullName"
        searchQuery={searchQuery}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEmployee ? UI_TEXT.admin.editEmployee : UI_TEXT.admin.createEmployee}
        size="md"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Họ và tên NV *</label>
              <Input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Lê Thị Hoa"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại *</label>
              <Input
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Ví dụ: 0905.777.666"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase font-outfit">Địa chỉ Email *</label>
            <Input
              required
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="hoa.le@lowlandscoffee.com.vn"
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Phân quyền chức vụ</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as Employee["role"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="admin">Admin Tổng (HQ)</option>
                <option value="manager">Cửa hàng trưởng (Manager)</option>
                <option value="staff">Thu ngân / Pha chế (Staff)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Nơi làm việc (Chi nhánh) *</label>
              <select
                value={formBranchId}
                onChange={(e) => setFormBranchId(e.target.value)}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ca đăng ký làm việc</label>
              <select
                value={formShift}
                onChange={(e) => setFormShift(e.target.value)}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                <option value="Ca Tối (18:00 - 23:00)">Ca Tối (18:00 - 23:00)</option>
                <option value="Fulltime - Hành chính">Fulltime - Hành chính</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái nhân sự</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as Employee["status"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="active">Đang hoạt động / đi làm</option>
                <option value="inactive">Đã thôi việc / nghỉ phép</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              {UI_TEXT.common.cancel}
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4"
            >
              {UI_TEXT.common.save}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác nhận dừng hợp đồng làm việc"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-foreground/80">
            {UI_TEXT.admin.deleteEmployeeConfirm}
          </p>
          <div className="flex justify-end space-x-2 border-t border-border/40 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="h-10 text-xs font-semibold rounded-lg"
            >
              {UI_TEXT.common.cancel}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-10 text-xs font-semibold px-4"
            >
              {UI_TEXT.common.confirm}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
