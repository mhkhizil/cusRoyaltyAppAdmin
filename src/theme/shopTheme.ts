/**
 * Shop brand theme tokens.
 *
 * To rebrand for a new shop: add or update an entry in SHOP_THEMES.
 * All UI should consume Tailwind shop-* utilities (from CSS vars), not hardcoded hex values.
 */
export type ShopTheme = {
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarMuted: string;
  sidebarBorder: string;
  accent: string;
  accentForeground: string;
  ring: string;
};

/** Default Customer Royalty admin palette (slate sidebar, high-contrast primary). */
export const DEFAULT_SHOP_THEME: ShopTheme = {
  primary: "#0f172a",
  primaryHover: "#020617",
  primaryForeground: "#ffffff",
  sidebarBackground: "#0f172a",
  sidebarForeground: "#ffffff",
  sidebarMuted: "#94a3b8",
  sidebarBorder: "rgba(255, 255, 255, 0.1)",
  accent: "#2563eb",
  accentForeground: "#ffffff",
  ring: "rgba(15, 23, 42, 0.3)",
};

/**
 * Per-shop themes. Keys should match backend shop / tenant identifiers.
 * Only edit this map (or DEFAULT_SHOP_THEME) to change brand colors — not individual pages.
 */
export const SHOP_THEMES: Record<string, ShopTheme> = {
  default: DEFAULT_SHOP_THEME,
};

export function getShopTheme(shopId?: string | null): ShopTheme {
  if (!shopId) {
    return DEFAULT_SHOP_THEME;
  }

  return SHOP_THEMES[shopId] ?? DEFAULT_SHOP_THEME;
}
