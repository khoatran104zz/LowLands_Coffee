"use client";

import { useState, useEffect, use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getProductById } from "@/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { Product, ProductVariant, Topping } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft, Plus, Minus, AlertCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { MOCK_PRODUCTS } from "@/constants/mock";

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const tCart = useTranslations("cart");
  const tMenu = useTranslations("menu");
  const router = useRouter();
  const locale = useLocale();
  const productId = parseInt(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<{ topping: Topping; quantity: number }[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zustand Cart Add hook
  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(productId);
        setProduct(data);
        
        // Select first available variant by default
        if (data?.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        
        // Initialize toppings list with 0 quantity
        if (data?.toppings) {
          setSelectedToppings(data.toppings.map((topping) => ({ topping, quantity: 0 })));
        }
      } catch {
        console.warn("Failed to load product details from backend. Loading offline fallback product.");
        const fallbackProduct = MOCK_PRODUCTS.find((p) => p.id === productId);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
          if (fallbackProduct.variants && fallbackProduct.variants.length > 0) {
            setSelectedVariant(fallbackProduct.variants[0]);
          }
          if (fallbackProduct.toppings) {
            setSelectedToppings(fallbackProduct.toppings.map((topping) => ({ topping, quantity: 0 })));
          }
          setError("offline_fallback");
        } else {
          setError("api_not_connected");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);

  // Localized helpers for mock product data in offline mode
  function getProductName(p: Product) {
    if (locale === "en" && error === "offline_fallback") {
      if (p.name === "Phin Sữa Đá") return "Iced Milk Coffee (Phin)";
      if (p.name === "Phin Đen Đá") return "Iced Black Coffee (Phin)";
      if (p.name === "Bạc Xỉu") return "Bac Xiu Coffee";
      if (p.name === "PhinĐi Hạnh Nhân") return "PhinDi Almond";
      if (p.name === "Trà Sen Vàng") return "Golden Lotus Tea";
      if (p.name === "Trà Thạch Đào") return "Peach Jelly Tea";
      if (p.name === "Trà Thanh Đào") return "Peach Lemongrass Tea";
      if (p.name === "Freeze Trà Xanh") return "Green Tea Freeze";
      if (p.name === "Freeze Cà Phê Phin") return "Coffee Freeze";
      if (p.name === "Bánh Mì Que Pate") return "Pate Stick Bread";
      if (p.name === "Bánh Phô Mai Việt Quất") return "Blueberry Cheesecake";
      if (p.name === "Cà Phê Phin Giấy Lowlands") return "Lowlands Drip Bag Coffee";
    }
    return p.name;
  }

  function getProductDescription(p: Product) {
    if (locale === "en" && error === "offline_fallback") {
      if (p.description?.includes("Robusta đậm đặc")) return "Traditional Robusta coffee brewed in phin filter with sweet condensed milk.";
      if (p.description?.includes("Cà phê đen phin")) return "Rich traditional black filter coffee for true coffee connoisseurs.";
      if (p.description?.includes("Cà phê phin hòa quyện")) return "Phin filtered coffee combined with fresh milk and condensed milk.";
      if (p.description?.includes("Sự kết hợp mới mẻ")) return "A refreshing mix of phin coffee, creamy almond milk, and chewy grass jelly.";
      if (p.description?.includes("Trà Ô Long")) return "Fragrant Oolong tea blended with rich lotus seeds and crispy water chestnut jelly.";
      if (p.description?.includes("Trà đào thơm lừng")) return "Fragrant peach tea combined with crispy pickled peach slices and peach jelly.";
      if (p.description?.includes("Trà đào thanh mát")) return "Refreshing peach tea with a perfect hint of fragrant lemongrass.";
      if (p.description?.includes("Matcha trà xanh xay")) return "Finely blended green tea matcha with rich cream, matcha jelly, and red beans.";
      if (p.description?.includes("Cà phê phin xay đá")) return "Blended phin coffee ice blended with rich cream and chewy coffee jelly.";
      if (p.description?.includes("Bánh mì que giòn")) return "Crispy stick bread stuffed with delicious rich pate, Central Vietnam style.";
      if (p.description?.includes("Bánh phô mai nướng")) return "Creamy baked cheesecake topped with sweet and sour blueberry sauce.";
      if (p.description?.includes("Hộp cà phê phin")) return "Convenient drip bag coffee box from Lowlands Coffee.";
    }
    return p.description || "";
  }

  function getToppingName(topping: Topping) {
    if (locale === "en" && error === "offline_fallback") {
      if (topping.name === "Thạch Cà Phê") return "Coffee Jelly";
      if (topping.name === "Trân Châu Trắng") return "White Tapioca";
      if (topping.name === "Thạch Củ Năng") return "Water Chestnut Jelly";
      if (topping.name === "Hạt Sen") return "Lotus Seeds";
    }
    return topping.name;
  }

  // Handle Topping selection changes
  const handleToppingToggle = (topping: Topping, checked: boolean) => {
    setSelectedToppings((prev) =>
      prev.map((item) =>
        item.topping.id === topping.id
          ? { ...item, quantity: checked ? 1 : 0 }
          : item
      )
    );
  };

  // Quantity helpers
  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Compute live price
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

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Submit to Zustand Store
  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItemToCart(
      product,
      selectedVariant,
      quantity,
      selectedToppings.filter((item) => item.quantity > 0),
      note
    );

    toast.success(t("addedToCart"));
    router.push("/cart");
  };

  const showContent = !loading && (error === null || error === "offline_fallback") && product;

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{tCommon("menu")}</span>
        </Link>

        {/* Offline notice banner */}
        {error === "offline_fallback" && (
          <div className="flex items-start gap-2.5 bg-accent/10 border border-accent/20 px-4 py-3 rounded-xl mb-6 max-w-7xl mx-auto shadow-xs">
            <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-foreground/80 leading-normal">
              <strong>Chế độ Xem thử (Offline):</strong> API chi tiết sản phẩm đang ngoại tuyến. Dữ liệu tùy chọn được tải từ danh mục mẫu. Khởi động Spring Boot API để đồng bộ dữ liệu thực tế.
            </span>
          </div>
        )}

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

        {error === "api_not_connected" && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-xl mx-auto border border-border/80 rounded-3xl bg-card shadow-sm gap-4">
            <div className="rounded-full bg-accent/15 p-4 text-accent">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-primary">Backend API Connection Needed</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chi tiết sản phẩm được tải động từ cơ sở dữ liệu. Vui lòng kết nối Spring Boot API để xem chi tiết tùy chọn đồ uống của mặt hàng này.
            </p>
          </div>
        )}

        {showContent && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Product Image Column */}
            <div className="md:col-span-5 relative aspect-square w-full rounded-2xl bg-secondary/20 overflow-hidden border border-border/60">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={getProductName(product)}
                  fill
                  className="object-cover animate-fade-in"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 text-muted-foreground">
                  <ShoppingBag className="h-20 w-20 opacity-20" />
                </div>
              )}
            </div>

            {/* Product Customizations Column */}
            <div className="md:col-span-7 flex flex-col items-start text-left gap-6">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary">
                  {getProductName(product)}
                </h1>
                <div className="w-12 h-1 bg-accent rounded-full mt-3" />
              </div>

              {getProductDescription(product) && (
                <div className="w-full">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
                    {t("description")}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getProductDescription(product)}
                  </p>
                </div>
              )}

              {/* Size Select (Product Variants) */}
              {product.variants && product.variants.length > 0 && (
                <div className="w-full">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
                    {tMenu("size")} ({t("sizeS")} / {t("sizeM")} / {t("sizeL")})
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

              {/* Toppings Checklist */}
              {selectedToppings.length > 0 && (
                <div className="w-full border-t border-border/50 pt-6">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
                    {tMenu("topping")} ({tCommon("price")})
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
                          <span className="font-semibold text-foreground">{getToppingName(topping)}</span>
                          <span className="text-muted-foreground font-semibold">+{formatPrice(Number(topping.price))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Note Input */}
              <div className="w-full border-t border-border/50 pt-6">
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
                  {tCart("note")}
                </h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={tCart("note")}
                  className="w-full min-h-[70px] border border-border rounded-xl p-3 text-xs focus:outline-primary/50 bg-card resize-none"
                />
              </div>

              {/* Add to Cart Actions */}
              <div className="w-full border-t border-border/50 pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                
                {/* Quantity Incrementor */}
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

                {/* Total Price & CTA Button */}
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="text-right hidden sm:flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {tCommon("total")}
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
                    <span>{tCommon("addToCart")}</span>
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
