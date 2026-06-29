"use client";

import { useEffect, use, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { getProductById } from "@/services/product.service";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart.store";
import { Product, ProductVariant, Topping } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const productId = parseInt(id, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<{ topping: Topping; quantity: number }[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(productId);
        setProduct(data);
        setSelectedVariant(data.variants?.[0] ?? null);
        setSelectedToppings(data.toppings?.map((topping) => ({ topping, quantity: 0 })) ?? []);
      } catch (loadError) {
        console.error("Failed to load product details from backend", loadError);
        setProduct(null);
        setSelectedVariant(null);
        setSelectedToppings([]);
        setError("api_error");
      } finally {
        setLoading(false);
      }
    };

    void loadProductDetails();
  }, [productId]);

  const handleToppingToggle = (topping: Topping, checked: boolean) => {
    setSelectedToppings((prev) =>
      prev.map((item) =>
        item.topping.id === topping.id
          ? { ...item, quantity: checked ? 1 : 0 }
          : item
      )
    );
  };

  const incrementQuantity = () => setQuantity((current) => current + 1);
  const decrementQuantity = () => setQuantity((current) => (current > 1 ? current - 1 : 1));

  const calculateSinglePrice = () => {
    if (!selectedVariant) return 0;
    const basePrice = Number(selectedVariant.price);
    const toppingsPrice = selectedToppings.reduce(
      (sum, item) => sum + Number(item.topping.price) * item.quantity,
      0
    );
    return basePrice + toppingsPrice;
  };

  const totalPrice = calculateSinglePrice() * quantity;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItemToCart(
      product,
      selectedVariant,
      quantity,
      selectedToppings.filter((item) => item.quantity > 0),
      note
    );

    toast.success(t("product.addedToCart"));
    router.push("/cart");
  };

  const showContent = !loading && error === null && product;

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.menu")}</span>
        </Link>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-pulse">
            <div className="md:col-span-5 aspect-square rounded-2xl bg-muted" />
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="h-8 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-20 w-full rounded bg-muted" />
            </div>
          </div>
        )}

        {error === "api_error" && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-xl mx-auto border border-border/80 rounded-3xl bg-card shadow-sm gap-4">
            <div className="rounded-full bg-accent/15 p-4 text-accent">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-primary">Backend API error</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Không thể tải chi tiết sản phẩm từ backend API. Frontend không dùng mock product thay thế, vui lòng kiểm tra Spring Boot API và seed data.
            </p>
            <div className="w-full text-left bg-secondary/35 p-4 rounded-xl font-mono text-xs text-foreground/80 leading-relaxed border border-border">
              GET http://localhost:8080/api/v1/products/{productId}
            </div>
          </div>
        )}

        {showContent && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5 relative aspect-square w-full rounded-2xl bg-secondary/20 overflow-hidden border border-border/60">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover animate-fade-in"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 text-muted-foreground">
                  <ShoppingBag className="h-20 w-20 opacity-20" />
                </div>
              )}
            </div>

            <div className="md:col-span-7 flex flex-col items-start text-left gap-6">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary">
                  {product.name}
                </h1>
                <div className="w-12 h-1 bg-accent rounded-full mt-3" />
              </div>

              {product.description && (
                <div className="w-full">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
                    {t("product.description")}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.variants && product.variants.length > 0 && (
                <div className="w-full">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
                    {t("product.menu.size")} ({t("product.sizeS")} / {t("product.sizeM")} / {t("product.sizeL")})
                  </h4>
                  <div className="flex gap-4">
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`flex-grow sm:flex-grow-0 min-w-[100px] border rounded-xl py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                              : "border-border hover:border-primary/50 text-foreground"
                          }`}
                        >
                          <span className="text-xs font-bold uppercase">Size {variant.size}</span>
                          <span className="text-xs font-semibold opacity-80">{formatPrice(Number(variant.price))}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedToppings.length > 0 && (
                <div className="w-full border-t border-border/50 pt-6">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
                    {t("product.menu.topping")} ({t("common.price")})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedToppings.map(({ topping, quantity: toppingQty }) => (
                      <div
                        key={topping.id}
                        className="flex items-center gap-3 border border-border/80 rounded-xl p-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleToppingToggle(topping, toppingQty === 0)}
                      >
                        <Checkbox
                          checked={toppingQty > 0}
                          onCheckedChange={(checked) => handleToppingToggle(topping, !!checked)}
                        />
                        <div className="flex justify-between items-center w-full text-xs">
                          <span className="font-semibold text-foreground">{topping.name}</span>
                          <span className="text-muted-foreground font-semibold">+{formatPrice(Number(topping.price))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full border-t border-border/50 pt-6">
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
                  {t("product.cart.note")}
                </h4>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t("product.cart.note")}
                  className="w-full min-h-[70px] border border-border rounded-xl p-3 text-xs focus:outline-primary/50 bg-card resize-none"
                />
              </div>

              <div className="w-full border-t border-border/50 pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center border border-border rounded-full p-1 bg-card">
                  <button
                    onClick={decrementQuantity}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-primary">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="text-right hidden sm:flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {t("common.total")}
                    </span>
                    <span className="text-lg font-black text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="w-full sm:w-auto rounded-full font-bold gap-2 text-sm"
                    disabled={!selectedVariant}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t("common.addToCart")}</span>
                    <span className="sm:hidden">({formatPrice(totalPrice)})</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
