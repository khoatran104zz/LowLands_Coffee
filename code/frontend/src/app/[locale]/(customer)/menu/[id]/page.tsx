"use client";

import { useEffect, use, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, MessageSquare, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import {
  getProductById,
  getProductReviewEligibility,
  getProductReviews,
  getProducts,
  ProductReviewEligibility,
  ProductReviewSummary,
  submitProductReview,
} from "@/services/product.service";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { Product, ProductVariant, Topping, ComboSelection } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PRODUCT_BADGES, BADGE_STYLES } from "@/lib/productBadges";

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

const emptyReviewSummary: ProductReviewSummary = {
  averageRating: 0,
  reviewCount: 0,
  reviews: [],
};

const getReviewErrorMessage = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || "Không thể gửi đánh giá lúc này.";
};

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary>(emptyReviewSummary);
  const [reviewEligibility, setReviewEligibility] = useState<ProductReviewEligibility | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  // Combo: per-item variant selections (keyed by product ID)
  const [comboSelections, setComboSelections] = useState<Record<number, ProductVariant>>({});

  const addItemToCart = useCartStore((state) => state.addItem);
  const { isAuthenticated, hasHydrated } = useAuthStore();

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const reviews = await getProductReviews(productId);
      setReviewSummary(reviews);
    } catch (reviewError) {
      console.error("Failed to load product reviews", reviewError);
      setReviewSummary(emptyReviewSummary);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, productsList] = await Promise.all([
          getProductById(productId),
          getProducts(),
        ]);
        setProduct(data);
        setAllProducts(productsList || []);
        setSelectedVariant(data.variants?.[0] ?? null);
        setSelectedToppings(data.toppings?.map((topping) => ({ topping, quantity: 0 })) ?? []);
        // Init combo selections: default to size M (or first available active) variant of each combo product
        if (data.comboProductIds && data.comboProductIds.length > 0) {
          const comboProducts = productsList?.filter((p) => data.comboProductIds!.includes(p.id)) ?? [];
          const defaultSelections: Record<number, ProductVariant> = {};
          comboProducts.forEach((cp) => {
            const sizeMVariant = cp.variants?.find((v) => v.size === "M" && v.status === "active");
            const firstVariant = sizeMVariant ?? cp.variants?.find((v) => v.status === "active") ?? cp.variants?.[0];
            if (firstVariant) defaultSelections[cp.id] = firstVariant;
          });
          setComboSelections(defaultSelections);
        }
        void loadReviews();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      setReviewEligibility(null);
      setReviewRating(5);
      setReviewComment("");
      return;
    }

    let active = true;
    const loadEligibility = async () => {
      try {
        const eligibility = await getProductReviewEligibility(productId);
        if (!active) return;
        setReviewEligibility(eligibility);
        if (eligibility.review) {
          setReviewRating(eligibility.review.rating);
          setReviewComment(eligibility.review.comment || "");
        }
      } catch (eligibilityError) {
        console.error("Failed to load product review eligibility", eligibilityError);
        if (active) {
          setReviewEligibility(null);
        }
      }
    };

    void loadEligibility();
    return () => {
      active = false;
    };
  }, [productId, hasHydrated, isAuthenticated]);

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

  const isCombo = (product?.comboProductIds?.length ?? 0) > 0;

  // Calculate combo price based on the combo product's own variant price and fix-sized components
  const calculateComboPrice = (): { comboPrice: number; originalPrice: number; savingsPct: number } => {
    if (!isCombo || !product) return { comboPrice: 0, originalPrice: 0, savingsPct: 0 };
    
    // Original price is the sum of the fixed variants of the combo components
    const originalPrice = Object.values(comboSelections).reduce(
      (sum, v) => sum + Number(v.price), 0
    );
    
    // Savings percentage defined in DB
    const savingsPct = Number(product.discountPercentage ?? 10);
    
    // Combo price is calculated dynamically from originalPrice and savingsPct
    const comboPrice = Math.round(originalPrice * (1 - savingsPct / 100));
      
    return { comboPrice, originalPrice, savingsPct };
  };

  const calculateSinglePrice = () => {
    if (isCombo) return calculateComboPrice().comboPrice;
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
    if (!product) return;

    if (isCombo) {
      const { comboPrice, savingsPct } = calculateComboPrice();
      const comboSelectionsArr: ComboSelection[] = Object.entries(comboSelections).map(
        ([productIdStr, variant]) => ({
          product: allProducts.find((p) => p.id === parseInt(productIdStr))!,
          variant,
        })
      ).filter((s) => s.product != null);

      // Synthetic variant to represent the combo price
      const syntheticVariant: ProductVariant = {
        id: product.variants?.[0]?.id ?? -1,
        productId: product.id,
        size: "M",
        price: comboPrice,
        status: "active",
      };

      addItemToCart(
        product,
        syntheticVariant,
        quantity,
        [],
        note,
        comboSelectionsArr,
        savingsPct
      );
    } else {
      if (!selectedVariant) return;
      addItemToCart(
        product,
        selectedVariant,
        quantity,
        selectedToppings.filter((item) => item.quantity > 0),
        note
      );
    }

    toast.success(t("product.addedToCart"));
    router.push("/cart");
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm.");
      router.push("/login");
      return;
    }
    if (!reviewEligibility?.canReview) {
      toast.error(reviewEligibility?.message || "Bạn chưa đủ điều kiện đánh giá sản phẩm này.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const savedReview = await submitProductReview(productId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewEligibility({
        canReview: true,
        hasReviewed: true,
        message: "Bạn đã đánh giá sản phẩm này và có thể cập nhật lại.",
        review: savedReview,
      });
      await loadReviews();
      toast.success("Đã lưu đánh giá của bạn.");
    } catch (submitError) {
      console.error("Failed to submit product review", submitError);
      toast.error(getReviewErrorMessage(submitError));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating: number, className = "h-4 w-4") =>
    Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.round(rating);
      return (
        <Star
          key={index}
          className={`${className} ${filled ? "fill-[#D99A2B] text-[#D99A2B]" : "text-muted-foreground/30"}`}
        />
      );
    });

  const formatReviewDate = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));

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
          <>
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
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary">
                    {t(`product.items.${product.id}.name`, { defaultValue: product.name })}
                  </h1>
                  {/* Badge on product detail page */}
                  {(() => {
                    const badge = PRODUCT_BADGES[product.id];
                    if (!badge) return null;
                    return (
                      <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm ${BADGE_STYLES[badge.type]}`}>
                        {t(badge.labelKey)}
                      </span>
                    );
                  })()}
                </div>
                <div className="w-12 h-1 bg-accent rounded-full mt-3" />
              </div>

              {product.description && (
                <div className="w-full">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
                    {t("product.description")}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`product.items.${product.id}.description`, { defaultValue: product.description })}
                  </p>
                </div>
              )}

              {isCombo && (
                <div className="w-full space-y-4">
                  {/* Savings badge */}
                  {(() => {
                    const { comboPrice, originalPrice, savingsPct } = calculateComboPrice();
                    return (
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-400/10 to-yellow-400/15 border border-amber-400/40 p-4">
                        {/* Shimmer animation */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{animation: 'shimmer 2.5s infinite'}} />
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">🎁 Combo tiết kiệm</p>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-2xl font-black text-primary">{formatPrice(comboPrice)}</span>
                              {originalPrice > comboPrice && (
                                <span className="text-sm text-muted-foreground line-through font-semibold">{formatPrice(originalPrice)}</span>
                              )}
                            </div>
                          </div>
                          {savingsPct > 0 && (
                            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl px-4 py-2 shadow-lg shadow-green-500/30">
                              <span className="text-[10px] font-black uppercase tracking-widest">Tiết kiệm</span>
                              <span className="text-2xl font-black leading-none">{savingsPct}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Per-item size description */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Thông tin các món đi kèm</h4>
                    {allProducts
                      .filter((p) => product.comboProductIds?.includes(p.id))
                      .map((cp) => {
                        const selected = comboSelections[cp.id];
                        return (
                          <div key={cp.id} className="border border-border/60 rounded-xl p-3 bg-card flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {cp.imageUrl && (
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/40 shrink-0">
                                  <img src={cp.imageUrl} alt={cp.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className="text-xs font-bold text-foreground">
                                {t(`product.items.${cp.id}.name`, { defaultValue: cp.name })}
                              </span>
                            </div>
                            {selected ? (
                              <div className="text-xs font-bold text-[#C8510A]">
                                Size {selected.size} - {formatPrice(Number(selected.price))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Không có size khả dụng</span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {!isCombo && product.variants && product.variants.length > 0 && (
                <div className="w-full">
                  <>
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
                  </>
                </div>
              )}

              {!isCombo && selectedToppings.length > 0 && (
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
                  {isCombo ? "Ghi chú cho combo" : t("product.cart.note")}
                </h4>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    isCombo
                      ? t("product.cart.notePlaceholderCombo")
                      : t("product.cart.notePlaceholderDrink")
                  }
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
                    disabled={isCombo ? Object.keys(comboSelections).length === 0 : !selectedVariant}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t("common.addToCart")}</span>
                    <span className="sm:hidden">({formatPrice(totalPrice)})</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>


          <section className="mt-14 border-t border-border/60 pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent/10 p-3 text-accent">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Đánh giá sản phẩm
                    </p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-3xl font-black text-primary">
                        {reviewSummary.averageRating.toFixed(1)}
                      </span>
                      <span className="pb-1 text-xs font-semibold text-muted-foreground">
                        / 5
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {renderStars(reviewSummary.averageRating, "h-5 w-5")}
                </div>
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  {reviewSummary.reviewCount > 0
                    ? `${reviewSummary.reviewCount} đánh giá từ khách hàng đã mua sản phẩm.`
                    : "Chưa có đánh giá nào cho sản phẩm này."}
                </p>

                <div className="mt-6 rounded-xl border border-border/70 bg-secondary/20 p-4">
                  {!isAuthenticated ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        Đăng nhập để đánh giá sau khi hoàn tất đơn hàng.
                      </p>
                      <Button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="h-10 rounded-full px-5 text-sm font-bold"
                      >
                        Đăng nhập
                      </Button>
                    </div>
                  ) : reviewEligibility?.canReview ? (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Chọn số sao
                        </p>
                        <div className="flex gap-1.5">
                          {Array.from({ length: 5 }, (_, index) => {
                            const value = index + 1;
                            const selected = value <= reviewRating;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewRating(value)}
                                className="rounded-full p-1 transition hover:scale-105"
                                aria-label={`${value} sao`}
                              >
                                <Star
                                  className={`h-7 w-7 ${
                                    selected ? "fill-[#D99A2B] text-[#D99A2B]" : "text-muted-foreground/30"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        maxLength={500}
                        placeholder="Chia sẻ cảm nhận của bạn về hương vị, đóng gói hoặc trải nghiệm..."
                        className="min-h-[96px] w-full resize-none rounded-xl border border-border bg-card p-3 text-sm focus:outline-primary/50"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {reviewComment.length}/500 ký tự
                        </span>
                        <Button
                          type="button"
                          onClick={handleReviewSubmit}
                          disabled={reviewSubmitting}
                          className="h-10 rounded-full px-5 text-sm font-bold"
                        >
                          {reviewSubmitting
                            ? "Đang lưu..."
                            : reviewEligibility.hasReviewed
                              ? "Cập nhật"
                              : "Gửi đánh giá"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-muted-foreground">
                      {reviewEligibility?.message || "Bạn cần hoàn tất đơn hàng có sản phẩm này trước khi đánh giá."}
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-black text-primary">
                      Nhận xét của khách hàng
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      Các đánh giá được gửi bởi tài khoản đã hoàn tất đơn hàng.
                    </p>
                  </div>
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>

                {reviewsLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-20 rounded-xl bg-muted" />
                    <div className="h-20 rounded-xl bg-muted" />
                  </div>
                ) : reviewSummary.reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-semibold text-muted-foreground">
                      Sản phẩm này đang chờ đánh giá đầu tiên.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewSummary.reviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-xl border border-border/70 bg-background/60 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold text-primary">{review.reviewerName}</p>
                            <div className="mt-1 flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {formatReviewDate(review.updatedAt || review.createdAt)}
                          </span>
                        </div>
                        {review.comment ? (
                          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                            {review.comment}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm italic text-muted-foreground">
                            Khách hàng chưa để lại bình luận.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          </>
        )}
      </div>
    </div>
  );
}
