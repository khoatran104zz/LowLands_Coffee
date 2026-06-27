import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Product, ProductVariant, Topping } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/checkbox";
import { UI_TEXT } from "@/constants/ui-text";

interface ProductCardProps {
  product: Product;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    selectedToppings: Topping[],
    note: string
  ) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || { id: 0, productId: product.id, size: "S", price: 0, status: "active" }
  );
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [note, setNote] = useState("");

  const hasVariants = product.variants && product.variants.length > 1;
  const hasToppings = product.toppings && product.toppings.length > 0;
  
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
      <div 
        onClick={isOutOfStock ? undefined : handleOpenConfig}
        className={`group bg-card rounded-xl border border-border/80 p-2 shadow-xs transition-all duration-300 flex flex-col select-none ${
          isOutOfStock 
            ? "opacity-60 cursor-not-allowed" 
            : "cursor-pointer hover:bg-muted/10 hover:shadow-md"
        }`}
      >
        {/* Image - Ratio 4:3 */}
        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted/40 relative shrink-0">
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

          {/* Badge Hết hàng */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-md tracking-wider">
                Hết hàng
              </span>
            </div>
          )}

          {/* Nút '+' góc dưới phải */}
          {!isOutOfStock && (
            <div className="absolute right-2 bottom-2 rounded-full h-7 w-7 bg-[#C8510A] text-white flex items-center justify-center shadow-md group-hover:bg-[#B04308] group-hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Text Area - Compact, no empty space */}
        <div className="mt-2 text-left flex flex-col justify-between flex-grow">
          <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-[#C8510A] transition-colors leading-tight" title={product.name}>
            {product.name}
          </h4>
          <span className="text-xs font-extrabold text-[#C8510A] mt-0.5 block leading-none">
            {displayPrice.toLocaleString()}đ
          </span>
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title={product.name}
        size="md"
      >
        <div className="space-y-5">
          {/* Sizes */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block text-left">
                Kích cỡ:
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
                      className={`h-10 border rounded-lg text-xs font-semibold transition-all ${
                        !isVariantActive
                          ? "opacity-40 cursor-not-allowed border-dashed bg-muted/20 text-muted-foreground"
                          : selectedVariant.id === v.id
                            ? "border-[#C8510A] bg-[#C8510A]/10 text-[#C8510A] shadow-xs"
                            : "border-border bg-background hover:bg-muted/10 text-foreground"
                      }`}
                    >
                      Size {v.size} ({v.price.toLocaleString()}đ)
                      {!isVariantActive && " - Hết"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toppings */}
          {hasToppings && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block text-left">
                Topping thêm:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.toppings!.map((t) => {
                  const isToppingActive = t.status === "active";
                  const isChecked = selectedToppings.some((top) => top.id === t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={isToppingActive ? () => handleToggleTopping(t) : undefined}
                      className={`flex items-center justify-between p-3 border rounded-lg text-xs font-semibold transition-all ${
                        !isToppingActive
                          ? "opacity-40 cursor-not-allowed border-dashed bg-muted/20 text-muted-foreground"
                          : isChecked
                            ? "border-[#C8510A] bg-[#C8510A]/5 text-[#C8510A]"
                            : "border-border bg-background hover:bg-muted/10 text-foreground cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={isChecked} 
                          onCheckedChange={() => {}} 
                          disabled={!isToppingActive}
                          className={`pointer-events-none data-[state=checked]:bg-[#C8510A] data-[state=checked]:border-[#C8510A]`} 
                        />
                        <span>{t.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {isToppingActive ? `+${t.price.toLocaleString()}đ` : "Hết hàng"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block text-left">
              {UI_TEXT.pos.addNote}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Ít sữa, nhiều đá, chia 2 ly..."
              className="w-full p-3 border border-border bg-background text-foreground text-xs font-medium rounded-lg h-16 focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] resize-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
            <div className="text-left">
              <span className="text-xs text-muted-foreground block font-medium">Tổng số tiền:</span>
              <span className="text-base font-black text-[#C8510A] font-outfit">
                {currentTotal.toLocaleString()}đ
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)} className="rounded-lg h-9 text-xs font-semibold">
                {UI_TEXT.common.cancel}
              </Button>
              <Button 
                onClick={handleConfirmAdd} 
                className="bg-[#C8510A] hover:bg-[#B04308] text-white rounded-lg h-9 text-xs font-semibold px-5"
              >
                + Thêm vào đơn
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
