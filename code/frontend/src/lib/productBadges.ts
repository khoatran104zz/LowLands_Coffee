/**
 * Product badge configuration.
 * Maps productId → badge type and label key.
 * Badge types: "hot" | "new" | "special" | "combo"
 * Consistent with landing page color tokens: #C8510A (hot), emerald (new), #D99A2B (special)
 */

export type BadgeType = "hot" | "new" | "special" | "combo";

export interface ProductBadge {
  type: BadgeType;
  labelKey: string; // i18n key
}

export const PRODUCT_BADGES: Record<number, ProductBadge> = {
  // Coffee — Bán Chạy
  1:  { type: "hot",     labelKey: "product.badge.hot" },      // Phin Sữa Đá
  2:  { type: "hot",     labelKey: "product.badge.hot" },      // Bạc Xỉu
  10: { type: "hot",     labelKey: "product.badge.hot" },      // Cappuccino
  13: { type: "hot",     labelKey: "product.badge.hot" },      // Caramel Macchiato

  // Coffee — Đặc Biệt (Signature)
  3:  { type: "special", labelKey: "product.badge.special" },  // Trà Sen Vàng  (tea cat but signature)
  7:  { type: "special", labelKey: "product.badge.special" },  // Café Latte

  // Coffee — Mới
  15: { type: "new",     labelKey: "product.badge.new" },      // Mocha
  8:  { type: "new",     labelKey: "product.badge.new" },      // Americano
  9:  { type: "new",     labelKey: "product.badge.new" },      // Espresso

  // Tea — Bán Chạy
  18: { type: "hot",     labelKey: "product.badge.hot" },      // Trà Đào Cam Sả
  22: { type: "hot",     labelKey: "product.badge.hot" },      // Trà Xoài

  // Tea — Mới
  20: { type: "new",     labelKey: "product.badge.new" },      // Matcha Latte (nóng)
  19: { type: "new",     labelKey: "product.badge.new" },      // Trà Sữa Matcha

  // Freeze — Mới
  30: { type: "new",     labelKey: "product.badge.new" },      // Freeze Trà Xanh
  31: { type: "new",     labelKey: "product.badge.new" },      // Freeze Cà Phê
  34: { type: "new",     labelKey: "product.badge.new" },      // Freeze Cookies & Cream
};

/** Badge color/style config per type */
export const BADGE_STYLES: Record<BadgeType, string> = {
  hot:     "bg-[#C8510A] text-white",
  new:     "bg-emerald-500 text-white",
  special: "bg-[#D99A2B] text-white",
  combo:   "bg-amber-500 text-[#1A0F08]",
};

/** Badge emoji/icon per type */
export const BADGE_ICONS: Record<BadgeType, string> = {
  hot:     "🔥",
  new:     "✨",
  special: "⭐",
  combo:   "🎁",
};
