"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Store } from "@/types";
import { createStore, deleteStore, getStores, updateStore } from "@/services/store.service";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { FormModal } from "@/components/admin/FormModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminBranchesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Store | null>(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState("active");

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const data = await getStores();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load stores", error);
      toast.error(t("admin.branchesPage.errorLoad"));
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    void loadBranches();
  }, []);

  if (!isMounted) {
    return <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>;
  }

  const filteredBranches = branches.filter((branch) => {
    if (!statusFilter) return true;
    return branch.status === statusFilter;
  });

  const columns: Column<Store>[] = [
    { key: "id", header: t("admin.branchesPage.colId") },
    { key: "name", header: t("admin.branchesPage.colName") },
    { key: "address", header: t("admin.branchesPage.colAddress") },
    { key: "phone", header: t("admin.branchesPage.colPhone") },
    {
      key: "status",
      header: t("admin.branchesPage.colStatus"),
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setFormName("");
    setFormAddress("");
    setFormPhone("");
    setFormStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (branch: Store) => {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormAddress(branch.address);
    setFormPhone(branch.phone || "");
    setFormStatus(branch.status);
    setIsFormOpen(true);
  };

  const handleOpenDelete = async (branch: Store) => {
    const isConfirmed = await confirm({
      title: t("common.confirmDeleteTitle"),
      message: t("admin.deleteBranchConfirm"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel")
    });

    if (!isConfirmed) return;

    try {
      await deleteStore(branch.id);
      toast.success(t("admin.branchesPage.successDelete"));
      await loadBranches();
    } catch (error) {
      console.error("Failed to delete store", error);
      toast.error(t("admin.branchesPage.errorDelete"));
    }
  };

  const handleSaveBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      toast.error(t("admin.branchesPage.errorValidation"));
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        status: formStatus
      };

      if (editingBranch) {
        await updateStore(editingBranch.id, payload);
        toast.success(t("admin.branchesPage.successUpdate"));
      } else {
        await createStore(payload);
        toast.success(t("admin.branchesPage.successCreate"));
      }

      setIsFormOpen(false);
      await loadBranches();
    } catch (error) {
      console.error("Failed to save store", error);
      toast.error(t("admin.branchesPage.errorSave"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {t("common.branches")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {t("admin.branchesPage.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.createBranch")}</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.branchesPage.searchPlaceholder")}
        />
        <Filter
          label={t("admin.branchesPage.statusFilter")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: t("common.active") },
            { value: "inactive", label: t("common.inactive") }
          ]}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground text-xs font-semibold">
          {t("common.loading")}
        </div>
      ) : (
        <DataTable
          data={filteredBranches}
          columns={columns}
          searchKey="name"
          searchQuery={searchQuery}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingBranch ? t("admin.editBranch") : t("admin.createBranch")}
        size="md"
      >
        <form onSubmit={handleSaveBranch} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.branchesPage.labelName")}</label>
            <Input
              required
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              placeholder={t("admin.branchesPage.placeholderName")}
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.branchesPage.labelAddress")}</label>
            <Input
              required
              value={formAddress}
              onChange={(event) => setFormAddress(event.target.value)}
              placeholder={t("admin.branchesPage.placeholderAddress")}
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.branchesPage.labelPhone")}</label>
              <Input
                value={formPhone}
                onChange={(event) => setFormPhone(event.target.value)}
                placeholder={t("admin.branchesPage.placeholderPhone")}
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("admin.branchesPage.labelStatus")}</label>
              <select
                value={formStatus}
                onChange={(event) => setFormStatus(event.target.value)}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-800"
              >
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-4"
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
