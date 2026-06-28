"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Product, Category, ProductVariant } from "@/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/tables/DataTable";
import { SearchBar } from "@/components/tables/SearchBar";
import { Filter } from "@/components/tables/Filter";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UI_TEXT } from "@/constants/ui-text";

export default function AdminProductsPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Filters & searches
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Store data
  const products = useDashboardStore((state) => state.products);
  const categories = useDashboardStore((state) => state.categories);
  const productCatalogError = useDashboardStore((state) => state.productCatalogError);
  const hydrateProductCatalog = useDashboardStore((state) => state.hydrateProductCatalog);
  const addProduct = useDashboardStore((state) => state.addProduct);
  const updateProduct = useDashboardStore((state) => state.updateProduct);
  const deleteProduct = useDashboardStore((state) => state.deleteProduct);

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("active");
  
  // Prices for variants
  const [priceS, setPriceS] = useState<number>(0);
  const [priceM, setPriceM] = useState<number>(0);
  const [priceL, setPriceL] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
    void hydrateProductCatalog("admin");
  }, [hydrateProductCatalog]);

  if (!isMounted) return <div className="text-center py-20 text-muted-foreground">{UI_TEXT.common.loading}</div>;

  // Filter products by category
  const filteredProducts = products.filter((p) => {
    if (!categoryFilter) return true;
    return p.categoryId === parseInt(categoryFilter);
  });

  // Category filter dropdown options
  const categoryFilterOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name
  }));

  // Columns definition
  const columns: Column<Product>[] = [
    { key: "id", header: "ID" },
    {
      key: "imageUrl",
      header: "Ảnh",
      render: (item) => (
        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border/40 select-none">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground">NULL</span>
          )}
        </div>
      )
    },
    { key: "name", header: "Tên món" },
    {
      key: "categoryId",
      header: "Danh mục",
      render: (item) => {
        const cat = categories.find((c) => c.id === item.categoryId);
        return <span>{cat?.name || "Khác"}</span>;
      }
    },
    {
      key: "variants",
      header: "Giá bán",
      render: (item) => {
        if (!item.variants || item.variants.length === 0) return <span>N/A</span>;
        // Show base price (usually size S, or list range)
        const prices = item.variants.map((v) => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) return <span>{minPrice.toLocaleString()}đ</span>;
        return <span>{minPrice.toLocaleString()}đ - {maxPrice.toLocaleString()}đ</span>;
      }
    },
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
          {item.status === "active" ? UI_TEXT.common.active : UI_TEXT.common.inactive}
        </span>
      )
    }
  ];

  // Open modals handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDesc("");
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : "");
    setFormImageUrl("");
    setFormStatus("active");
    setPriceS(29000);
    setPriceM(35000);
    setPriceL(39000);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description || "");
    setFormCategoryId(String(product.categoryId));
    setFormImageUrl(product.imageUrl || "");
    setFormStatus(product.status);
    
    // Read prices from variants
    const sVar = product.variants?.find((v) => v.size === "S");
    const mVar = product.variants?.find((v) => v.size === "M");
    const lVar = product.variants?.find((v) => v.size === "L");
    
    setPriceS(sVar ? sVar.price : 0);
    setPriceM(mVar ? mVar.price : 0);
    setPriceL(lVar ? lVar.price : 0);
    
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProductId(product.id);
    setIsDeleteOpen(true);
  };

  // Submit product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryId) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Build variants
    const tempProductId = editingProduct?.id || Math.max(...products.map(p => p.id), 0) + 1;
    const variants: ProductVariant[] = [];
    if (priceS > 0) {
      variants.push({ id: tempProductId * 100 + 1, productId: tempProductId, size: "S", price: priceS, status: "active" });
    }
    if (priceM > 0) {
      variants.push({ id: tempProductId * 100 + 2, productId: tempProductId, size: "M", price: priceM, status: "active" });
    }
    if (priceL > 0) {
      variants.push({ id: tempProductId * 100 + 3, productId: tempProductId, size: "L", price: priceL, status: "active" });
    }

    if (editingProduct) {
      updateProduct({
        id: editingProduct.id,
        categoryId: parseInt(formCategoryId),
        name: formName.trim(),
        description: formDesc.trim(),
        imageUrl: formImageUrl.trim() || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
        status: formStatus,
        variants,
        toppings: editingProduct.toppings
      });
      toast.success("Cập nhật sản phẩm thành công!");
    } else {
      addProduct({
        categoryId: parseInt(formCategoryId),
        name: formName.trim(),
        description: formDesc.trim(),
        imageUrl: formImageUrl.trim() || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
        status: formStatus,
        variants,
        toppings: [
          { id: 1, name: "Thạch Cà Phê", price: 6000, status: "active" },
          { id: 2, name: "Trân Châu Trắng", price: 8000, status: "active" }
        ]
      });
      toast.success("Thêm sản phẩm mới thành công!");
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      toast.success("Xóa sản phẩm thành công!");
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-xl font-bold text-amber-900 font-outfit uppercase tracking-wide">
            {UI_TEXT.common.products}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Thiết lập menu đồ uống, bánh ngọt và thông số giá cho toàn bộ cửa hàng.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg px-4 h-10 text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{UI_TEXT.common.add} món mới</span>
        </Button>
      </div>

      {productCatalogError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{productCatalogError}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm tên món nước, mô tả..."
        />
        <Filter
          label="Danh mục"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryFilterOptions}
          placeholder="Tất cả danh mục"
        />
      </div>

      {/* Products Table */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        searchKey="name"
        searchQuery={searchQuery}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Product Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? UI_TEXT.admin.editProduct : UI_TEXT.admin.createProduct}
        size="md"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tên món *</label>
              <Input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Phin Sữa Đá Xay"
                className="h-10 text-xs border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Danh mục *</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase font-outfit">Mô tả sản phẩm</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Cà phê phin hòa quyện sữa tươi đá xay mát lạnh..."
              className="w-full p-3 border border-border bg-background text-foreground text-xs font-medium rounded-lg h-16 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Đường dẫn hình ảnh (URL)</label>
            <Input
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="h-10 text-xs border-border bg-background"
            />
          </div>

          {/* Pricing settings */}
          <div className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Thiết lập giá theo Size (để 0 nếu không bán size đó):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Size S</label>
                <Input
                  type="number"
                  value={priceS || ""}
                  onChange={(e) => setPriceS(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Size M</label>
                <Input
                  type="number"
                  value={priceM || ""}
                  onChange={(e) => setPriceM(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Size L</label>
                <Input
                  type="number"
                  value={priceL || ""}
                  onChange={(e) => setPriceL(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Trạng thái món</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full h-10 px-3 py-1 bg-background border border-border text-foreground hover:bg-muted/10 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="active">{UI_TEXT.common.active}</option>
              <option value="inactive">{UI_TEXT.common.inactive}</option>
            </select>
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

      {/* Delete product */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác nhận xóa sản phẩm"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-foreground/80">
            {UI_TEXT.admin.deleteProductConfirm}
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
