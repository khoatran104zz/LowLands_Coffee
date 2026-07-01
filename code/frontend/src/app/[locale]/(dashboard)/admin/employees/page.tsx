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
import { getStores } from "@/services/store.service";
import { Store } from "@/types";


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
  const [branches, setBranches] = useState<Store[]>([]);
  const [formBranchId, setFormBranchId] = useState<number | "">("");

  useEffect(() => {
    void hydrateUsers();

    const fetchBranches = async () => {
      try {
        const data = await getStores();
        setBranches(data);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    void fetchBranches();
  }, [hydrateUsers]);

  const columns: Column<Employee>[] = [
    {
      key: "employeeCode",
      header: t("admin.employeesPage.colCode") || "Mã NV",
      render: (item) => item.employeeCode || t("admin.employeesPage.noCode") || "Chưa có mã"
    },
    { key: "fullName", header: t("admin.employeesPage.colName") },
    {
      key: "role",
      header: t("admin.employeesPage.colRole"),
      render: (item) => (
        <span className="font-semibold">
          {item.role === "manager"
            ? t("admin.employeesPage.roleManager")
            : t("admin.employeesPage.roleStaff")}
        </span>
      )
    },
    {
      key: "branchName",
      header: t("admin.employeesPage.colBranch"),
      render: (item) => (
        <span className="font-semibold text-amber-900">
          {item.branchName || t("admin.employeesPage.unassigned")}
        </span>
      )
    },
    { key: "phone", header: t("admin.employeesPage.colPhone") },
    { key: "email", header: t("admin.employeesPage.colEmail") },
    {
      key: "status",
      header: t("admin.employeesPage.colStatus"),
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
    setFormBranchId("");
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
    setFormBranchId(employee.branchId || "");
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
          toast.success(t("admin.employeesPage.successDelete"));
        } catch (error) {
          console.error("Failed to delete employee", error);
          toast.error(t("admin.employeesPage.errorDelete"));
        }
      }
    });
  };

  const handleSaveEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error(t("admin.employeesPage.errorNameEmail"));
      return;
    }
    if (!editingEmployee && !formPassword.trim()) {
      toast.error(t("admin.employeesPage.errorPassword"));
      return;
    }

    try {
      const selectedBranch = formBranchId ? branches.find(b => b.id === Number(formBranchId)) : null;
      const payload = {
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        branchId: formBranchId ? Number(formBranchId) : 0,
        branchName: selectedBranch ? selectedBranch.name : t("admin.employeesPage.unassigned"),
        status: formStatus,
        password: formPassword
      };

      if (editingEmployee) {
        await updateEmployee({ ...payload, id: editingEmployee.id });
        toast.success(t("admin.employeesPage.successUpdate"));
      } else {
        await addEmployee(payload);
        toast.success(t("admin.employeesPage.successCreate"));
      }

      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save employee", error);
      toast.error(t("admin.employeesPage.errorSave"));
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("admin.employeesPage.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.employeesPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.employeesPage.createBtn")}</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.employeesPage.searchPlaceholder")}
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
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelName")}</label>
              <Input
                required
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelPhone")}</label>
              <Input
                value={formPhone}
                onChange={(event) => setFormPhone(event.target.value)}
                className="h-10 text-xs border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelEmail")}</label>
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
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelPassword")}</label>
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
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelRole")}</label>
              <select
                value={formRole}
                onChange={(event) => setFormRole(event.target.value as Employee["role"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="manager">{t("admin.employeesPage.roleManager")}</option>
                <option value="staff">{t("admin.employeesPage.roleStaff")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelStatus")}</label>
              <select
                value={formStatus}
                onChange={(event) => setFormStatus(event.target.value as Employee["status"])}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="active">{t("admin.employeesPage.statusActive")}</option>
                <option value="inactive">{t("admin.employeesPage.statusInactive")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.employeesPage.labelBranch")}</label>
            <select
              value={formBranchId}
              onChange={(event) => setFormBranchId(event.target.value ? Number(event.target.value) : "")}
              className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="">{t("admin.employeesPage.allBranches")}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
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
