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

  const handleOpenConfig = () => {
    // Reset state
    setSelectedVariant(product.variants?.[0] || { id: 0, productId: product.id, size: "S", price: 0, status: "active" });
    setSelectedToppings([]);
    setNote("");
    setIsConfigOpen(true);
  };

  const handleToggleTopping = (topping: Topping) => {
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
        onClick={handleOpenConfig}
        className="group bg-card hover:bg-muted/10 cursor-pointer rounded-xl border border-border/80 p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted/40 relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold uppercase">
              {product.name.slice(0, 2)}
            </div>
          )}
          <div className="absolute right-2 bottom-2 rounded-full h-7 w-7 bg-amber-800 text-white flex items-center justify-center shadow-md group-hover:bg-primary transition-colors">
            <Plus className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 text-left">
          <h4 className="text-sm font-bold text-foreground truncate">{product.name}</h4>
          <span className="text-xs font-bold text-amber-800 mt-1 block">
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Kích cỡ:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`h-10 border rounded-lg text-sm font-semibold transition-all ${
                      selectedVariant.id === v.id
                        ? "border-amber-800 bg-amber-800/10 text-amber-900"
                        : "border-border bg-background hover:bg-muted/10 text-foreground"
                    }`}
                  >
                    Size {v.size} ({v.price.toLocaleString()}đ)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toppings */}
          {hasToppings && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Topping thêm:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.toppings!.map((t) => {
                  const isChecked = selectedToppings.some((top) => top.id === t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTopping(t)}
                      className={`flex items-center justify-between p-3 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? "border-amber-800 bg-amber-800/5 text-amber-900"
                          : "border-border bg-background hover:bg-muted/10 text-foreground"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={isChecked} onCheckedChange={() => {}} className="pointer-events-none" />
                        <span>{t.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">+{t.price.toLocaleString()}đ</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {UI_TEXT.pos.addNote}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Ít sữa, nhiều đá, chia 2 ly..."
              className="w-full p-3 border border-border bg-background text-foreground text-xs font-medium rounded-lg h-16 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 resize-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
            <div className="text-left">
              <span className="text-xs text-muted-foreground block font-medium">Tổng số tiền:</span>
              <span className="text-lg font-bold text-amber-900 font-outfit">
                {currentTotal.toLocaleString()}đ
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)} className="rounded-lg h-10 text-xs font-semibold">
                {UI_TEXT.common.cancel}
              </Button>
              <Button onClick={handleConfirmAdd} className="bg-amber-850 hover:bg-amber-800 text-white rounded-lg h-10 text-xs font-semibold px-5">
                + Thêm vào đơn
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
