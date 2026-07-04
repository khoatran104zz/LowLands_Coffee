import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Product, ProductVariant, Topping } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/store/dashboardStore";

interface ProductCardProps {
  product: Product;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    selectedToppings: Topping[],
    note: string
  ) => void;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, onAddToCart, viewMode = "grid" }: ProductCardProps) {
  const { t } = useTranslation();
  const categories = useDashboardStore((state) => state.categories);
  const categoryName = categories.find((c) => c.id === product.categoryId)?.name || "Coffee & Tea";
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showToppingsView, setShowToppingsView] = useState(false);
  const [toppingSearch, setToppingSearch] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || { id: 0, productId: product.id, size: "S", price: 0, status: "active" }
  );
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [note, setNote] = useState("");

  const hasVariants = product.variants && product.variants.length > 1;
  const globalToppings = useDashboardStore((state) => state.toppings);
  const isFoodOrCake = ["Bánh ngọt", "Đồ ăn nhanh", "Pastries", "Fast Food", "Cake", "Food"].includes(categoryName);
  const displayToppingsList = (product.toppings && product.toppings.length > 0)
    ? product.toppings
    : (!isFoodOrCake ? globalToppings : []);
  const hasToppings = displayToppingsList.length > 0;
  
  // Base display price (usually smallest variant price)
  const displayPrice = product.variants?.[0]?.price || 0;

  // Check if product is out of stock (inactive status or no active variants)
  const isOutOfStock = 
    product.status === "inactive" || 
    !product.variants || 
    product.variants.length === 0 ||
    product.variants.every(v => v.status === "inactive");

  const handleOpenConfig = () => {
    if (isOutOfStock) return;
    
    // Find first active variant to select as default
    const firstActiveVariant = product.variants?.find(v => v.status === "active") || product.variants?.[0];
    setSelectedVariant(firstActiveVariant || { id: 0, productId: product.id, size: "S", price: 0, status: "active" });
    setSelectedToppings([]);
    setNote("");
    setShowToppingsView(false);
    setToppingSearch("");
    setIsConfigOpen(true);
  };

  const handleToggleTopping = (topping: Topping) => {
    if (topping.status === "inactive") return;
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping]
    );
  };

  const handleConfirmAdd = () => {
    onAddToCart(product, selectedVariant, selectedToppings, note);
    setIsConfigOpen(false);
  };

  // Calculate current total price inside configuration modal
  const currentTotal = selectedVariant.price + selectedToppings.reduce((sum, t) => sum + t.price, 0);

  return (
    <>
      {viewMode === "grid" ? (
        <div 
          onClick={isOutOfStock ? undefined : handleOpenConfig}
          className={`group bg-card rounded-xl border border-border/80 p-2 shadow-2xs transition-all duration-200 ease-out flex flex-col select-none ${
            isOutOfStock 
              ? "opacity-60 cursor-not-allowed" 
              : "cursor-pointer hover:bg-[#F5EBE1]/40 hover:shadow-md hover:border-[#C8510A]/30 hover:-translate-y-0.5 active:scale-[0.98]"
          }`}
        >
          {/* Image - Ratio 16:11 */}
          <div className="w-full aspect-[16/11] rounded-lg overflow-hidden bg-muted/40 relative shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isOutOfStock ? "" : "group-hover:scale-105"
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold uppercase">
                {product.name.slice(0, 2)}
              </div>
            )}

            {/* Hover Overlay mờ */}
            {!isOutOfStock && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            )}

            {/* Floating Badges */}
            {!isOutOfStock && (
              <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                {product.id % 6 === 0 && (
                  <span className="bg-amber-500 text-amber-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider leading-none">
                    {t("pos.bestSeller") || "Best Seller"}
                  </span>
                )}
                {product.id % 8 === 0 && (
                  <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider leading-none">
                    {t("pos.new") || "Mới"}
                  </span>
                )}
                {product.id % 9 === 0 && (
                  <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider leading-none">
                    {t("pos.limited") || "Giới hạn"}
                  </span>
                )}
              </div>
            )}

            {/* Badge Hết hàng */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-md tracking-wider">
                  {t("pos.outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Text Area - Compact, no empty space */}
          <div className="mt-1.5 text-left flex justify-between items-end flex-grow">
            <div className="flex flex-col min-w-0 pr-1">
              <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-[#C8510A] transition-colors leading-tight" title={product.name}>
                {product.name}
              </h4>
              <span className="text-[13px] font-extrabold text-[#C8510A] mt-1 block leading-none">
                {displayPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {!isOutOfStock && (
              <div className="rounded-full h-7 w-7 bg-[#C8510A] text-white flex items-center justify-center shadow-xs group-hover:bg-[#B04308] group-hover:scale-105 transition-all duration-300 shrink-0">
                <Plus className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div 
          onClick={isOutOfStock ? undefined : handleOpenConfig}
          className={`group bg-white rounded-xl border border-border/85 p-3.5 shadow-2xs hover:shadow-md hover:border-[#C8510A]/35 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 flex items-center justify-between select-none ${
            isOutOfStock 
              ? "opacity-60 cursor-not-allowed font-medium" 
              : "cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-4 min-w-0 flex-grow pr-4">
            {/* Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/40 relative shrink-0 border border-border/40">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold uppercase">
                  {product.name.slice(0, 2)}
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <span className="text-[9px] text-white font-extrabold uppercase px-1.5 py-0.5 rounded leading-none">
                    {t("pos.outOfStock")}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[#C8510A] uppercase tracking-wider">
                  {categoryName}
                </span>
                {/* Badges */}
                {!isOutOfStock && product.id % 6 === 0 && (
                  <span className="bg-amber-500 text-amber-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm leading-none scale-90">
                    {t("pos.bestSeller") || "Best Seller"}
                  </span>
                )}
                {!isOutOfStock && product.id % 8 === 0 && (
                  <span className="bg-emerald-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm leading-none scale-90">
                    {t("pos.new") || "Mới"}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-zinc-950 leading-snug mt-1 truncate group-hover:text-[#C8510A] transition-colors">
                {product.name}
              </h4>
              {product.description && (
                <p className="text-[10px] text-zinc-500 line-clamp-1 leading-normal mt-1 font-medium">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-sm font-black text-[#C8510A] whitespace-nowrap">
              {displayPrice.toLocaleString("vi-VN")}đ
            </span>
            {!isOutOfStock && (
              <div className="rounded-full h-8 w-8 bg-[#C8510A] text-white flex items-center justify-center shadow-xs group-hover:bg-[#B04308] group-hover:scale-105 transition-all shrink-0">
                <Plus className="h-4.5 w-4.5" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title={showToppingsView ? `${t("pos.toppings")}: ${product.name}` : product.name}
        size="md"
      >
        {showToppingsView ? (
          /* Toppings Sub-View */
          <div className="space-y-4 text-left select-none animate-fade-in">
            {/* Header / Back row */}
            <div className="flex items-center space-x-2.5 pb-2 border-b border-border/40">
              <button
                type="button"
                onClick={() => setShowToppingsView(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-650 hover:text-zinc-900 transition-colors flex items-center justify-center shrink-0 border border-zinc-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">
                  {t("pos.selectToppings") || "Chọn Toppings"}
                </span>
                <span className="text-xs font-black text-zinc-900 truncate mt-0.5 leading-tight">
                  {product.name}
                </span>
              </div>
            </div>

            {/* Toppings Search Input (if list has more than 6 items) */}
            {displayToppingsList && displayToppingsList.length > 6 && (
              <div className="relative">
                <input
                  type="text"
                  value={toppingSearch}
                  onChange={(e) => setToppingSearch(e.target.value)}
                  placeholder={t("pos.searchToppingsPlaceholder") || "Tìm kiếm topping..."}
                  className="w-full pl-9 pr-3.5 py-2 border border-zinc-200 focus:border-[#C8510A] focus:ring-1 focus:ring-[#C8510A] rounded-xl text-xs font-semibold bg-zinc-50/50 transition-all outline-none"
                />
                <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            {/* Scrollable list area */}
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 py-0.5">
              {displayToppingsList && displayToppingsList.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {displayToppingsList
                    .filter((topItem) =>
                      topItem.name.toLowerCase().includes(toppingSearch.toLowerCase())
                    )
                    .map((topItem) => {
                      const isToppingActive = topItem.status === "active";
                      const isChecked = selectedToppings.some((top) => top.id === topItem.id);
                      return (
                        <div
                          key={topItem.id}
                          onClick={isToppingActive ? () => handleToggleTopping(topItem) : undefined}
                          className={`flex items-center justify-between p-3 border rounded-xl text-xs font-semibold transition-all select-none ${
                            !isToppingActive
                              ? "opacity-40 cursor-not-allowed border-dashed bg-muted/20 text-muted-foreground"
                              : isChecked
                                ? "border-[#C8510A] bg-[#C8510A]/5 text-[#C8510A] ring-1 ring-[#C8510A]"
                                : "border-border bg-background hover:bg-zinc-50 text-foreground cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <Checkbox 
                              checked={isChecked} 
                              onCheckedChange={() => {}} 
                              disabled={!isToppingActive}
                              className={`pointer-events-none data-[state=checked]:bg-[#C8510A] data-[state=checked]:border-[#C8510A] h-4 w-4 rounded`} 
                            />
                            <span className="truncate leading-tight pr-1" title={topItem.name}>{topItem.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-550 shrink-0 font-black ml-1">
                            {isToppingActive ? `+${topItem.price.toLocaleString("vi-VN")}đ` : t("pos.outOfStock")}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs font-semibold text-zinc-400">
                  {t("pos.noToppings") || "Không có toppings cho sản phẩm này."}
                </div>
              )}
            </div>

            {/* Topping Sub-view Footer */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-3 select-none">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">
                  {t("pos.toppingsSelected") || "Đã chọn"}
                </span>
                <span className="text-xs font-extrabold text-zinc-800 mt-1">
                  {selectedToppings.length} {t("pos.toppingsCount") || "topping"}
                </span>
              </div>
              <Button 
                onClick={() => setShowToppingsView(false)} 
                className="bg-[#C8510A] hover:bg-[#B04308] text-white rounded-xl h-10 text-xs font-extrabold px-6 shadow-sm shadow-[#C8510A]/10 active:scale-[0.98]"
              >
                {t("pos.confirm") || "Xác nhận"}
              </Button>
            </div>
          </div>
        ) : (
          /* Main Product Config View */
          <div className="space-y-4 text-left select-none animate-fade-in">
            {/* Product Header inside Modal */}
            <div className="flex gap-4 items-start border-b border-border/30 pb-3">
              {product.imageUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted/40 border border-border/60">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-left flex-grow min-w-0">
                <span className="text-[9px] font-black uppercase text-[#C8510A] bg-[#C8510A]/10 px-2 py-0.5 rounded-md border border-[#C8510A]/10 tracking-wider inline-block">
                  {categoryName}
                </span>
                <h3 className="font-outfit font-black text-base text-zinc-950 mt-1 leading-tight truncate">{product.name}</h3>
                {product.description && (
                  <p className="text-[10px] text-zinc-550 mt-1 font-medium line-clamp-2 leading-normal">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* Sizes */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-450 uppercase tracking-wider block">
                  {t("pos.size")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {product.variants.map((v) => {
                    const isVariantActive = v.status === "active";
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!isVariantActive}
                        onClick={() => setSelectedVariant(v)}
                        className={`h-11 border rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                          !isVariantActive
                            ? "opacity-40 cursor-not-allowed border-dashed bg-muted/20 text-muted-foreground"
                            : selectedVariant.id === v.id
                              ? "border-[#C8510A] bg-[#C8510A]/5 text-[#C8510A] ring-1 ring-[#C8510A] shadow-2xs"
                              : "border-border bg-background hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <span className="text-[11px] leading-tight">Size {v.size}</span>
                        <span className={`text-[9px] font-extrabold mt-0.5 ${selectedVariant.id === v.id ? "text-[#C8510A]" : "text-zinc-500"}`}>
                          {v.price.toLocaleString("vi-VN")}đ
                        </span>
                        {!isVariantActive && (
                          <span className="text-[8px] text-rose-500 font-extrabold mt-0.5 leading-none">
                            {t("pos.outOfStock")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Toppings Row Button */}
            {hasToppings && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-450 uppercase tracking-wider block">
                  {t("pos.toppings")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowToppingsView(true)}
                  className="w-full flex items-center justify-between p-3 border border-border rounded-xl bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-all select-none group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3 text-left min-w-0 flex-grow pr-3">
                    <div className="rounded-lg h-8 w-8 bg-amber-500/10 text-[#C8510A] flex items-center justify-center shrink-0 border border-amber-500/10 group-hover:scale-105 transition-transform">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-900 leading-tight">
                        {t("pos.addTopping") || "Thêm Topping"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5 truncate">
                        {selectedToppings.length > 0 
                          ? selectedToppings.map(t => t.name).join(", ") 
                          : t("pos.clickToSelectToppings") || "Nhấp để chọn các loại topping..."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {selectedToppings.length > 0 && (
                      <span className="bg-[#C8510A] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider leading-none shadow-xs">
                        +{selectedToppings.length}
                      </span>
                    )}
                    <svg className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            )}

            {/* Special notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-450 uppercase tracking-wider block">
                {t("pos.note")}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("pos.notePlaceholder")}
                className="w-full p-3 border border-border bg-background text-zinc-800 placeholder-zinc-400 text-xs font-medium rounded-xl h-14 focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] resize-none transition-colors outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-3">
              <div className="text-left">
                <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider leading-none">
                  {t("pos.total")}:
                </span>
                <span className="text-base font-black text-[#C8510A] font-outfit mt-1 block leading-none">
                  {currentTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfigOpen(false)} 
                  className="rounded-xl h-10 text-xs font-bold border-zinc-200"
                >
                  {t("pos.posBack")}
                </Button>
                <Button 
                  onClick={handleConfirmAdd} 
                  className="bg-[#C8510A] hover:bg-[#B04308] text-white rounded-xl h-10 text-xs font-bold px-6 shadow-sm shadow-[#C8510A]/10 active:scale-[0.98]"
                >
                  {t("pos.addToOrder")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
