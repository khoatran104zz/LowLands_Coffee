"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Employee, useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { FormModal } from "@/components/admin/FormModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminEmployeesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const employees = useDashboardStore((state) => state.employees);
  const addEmployee = useDashboardStore((state) => state.addEmployee);
  const updateEmployee = useDashboardStore((state) => state.updateEmployee);
  const deleteEmployee = useDashboardStore((state) => state.deleteEmployee);
  const hydrateUsers = useDashboardStore((state) => state.hydrateUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<Employee["role"]>("staff");
  const [formStatus, setFormStatus] = useState<Employee["status"]>("active");

  useEffect(() => {
    void hydrateUsers();
  }, [hydrateUsers]);

  const columns: Column<Employee>[] = [
    {
      key: "employeeCode",
      header: "Ma NV",
      render: (item) => item.employeeCode || "Chua co ma"
    },
    { key: "fullName", header: "Ho va ten" },
    {
      key: "role",
      header: "Chuc vu",
      render: (item) => (
        <span className="font-semibold">
          {item.role === "manager" ? "Cua hang truong" : "Nhan vien"}
        </span>
      )
    },
    {
      key: "branchName",
      header: "Chi nhanh",
      render: () => <span className="text-muted-foreground">Backend chua ho tro gan chi nhanh</span>
    },
    { key: "phone", header: "Dien thoai" },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Trang thai",
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setFormRole("staff");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormName(employee.fullName);
    setFormEmail(employee.email);
    setFormPhone(employee.phone);
    setFormPassword("");
    setFormRole(employee.role);
    setFormStatus(employee.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (employee: Employee) => {
    confirm({
      title: t("common.confirmDeleteTitle"),
      message: t("admin.deleteEmployeeConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      onConfirm: async () => {
        try {
          await deleteEmployee(employee.id);
          toast.success("Da xoa tai khoan nhan vien.");
        } catch (error) {
          console.error("Failed to delete employee", error);
          toast.error("Khong the xoa tai khoan nhan vien qua Backend API.");
        }
      }
    });
  };

  const handleSaveEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Vui long nhap ho ten va email.");
      return;
    }
    if (!editingEmployee && !formPassword.trim()) {
      toast.error("Mat khau khoi tao khong duoc de trong.");
      return;
    }

    try {
      const payload = {
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        branchName: "Chua gan",
        status: formStatus,
        password: formPassword
      };

      if (editingEmployee) {
        await updateEmployee({ ...payload, id: editingEmployee.id });
        toast.success("Cap nhat nhan vien thanh cong!");
      } else {
        await addEmployee(payload);
        toast.success("Tao tai khoan nhan vien thanh cong!");
      }

      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save employee", error);
      toast.error("Khong the luu tai khoan nhan vien qua Backend API.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.employees")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Quan ly tai khoan nhan vien theo User API. Gan chi nhanh se duoc bo sung khi backend StoreUser co endpoint.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tao nhan vien</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tim ten nhan vien, so dien thoai, email..."
        />
      </div>

      <DataTable
        data={employees}
        columns={columns}
        searchKey="fullName"
        searchQuery={searchQuery}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEmployee ? t("admin.editEmployee") : t("admin.createEmployee")}
        size="md"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ho va ten *</label>
              <Input
                required
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Dien thoai</label>
              <Input
                value={formPhone}
                onChange={(event) => setFormPhone(event.target.value)}
                className="h-10 text-xs border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email *</label>
            <Input
              required
              type="email"
              value={formEmail}
              onChange={(event) => setFormEmail(event.target.value)}
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          {!editingEmployee && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mat khau khoi tao *</label>
              <Input
                required
                type="password"
                value={formPassword}
                onChange={(event) => setFormPassword(event.target.value)}
                className="h-10 text-xs border-border bg-background"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Vai tro</label>
              <select
                value={formRole}
                onChange={(event) => setFormRole(event.target.value as Employee["role"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Trang thai</label>
              <select
                value={formStatus}
                onChange={(event) => setFormStatus(event.target.value as Employee["status"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="active">Hoat dong</option>
                <option value="inactive">Tam khoa</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs font-semibold text-amber-900">
            Backend chua ho tro gan chi nhanh cho nhan vien trong Admin UI. Thong tin chi nhanh se hien thi la &quot;Chua gan&quot;.
          </div>

          <div className="flex justify-end space-x-2 border-t border-border/40 pt-4 mt-2">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="h-10 text-xs font-semibold rounded-lg">
              {t("common.cancel")}
            </Button>
            <Button type="submit" className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4">
              {t("common.save")}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
