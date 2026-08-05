import { getShopTheme, type ShopTheme } from "./shopTheme";

const SHOP_THEME_CSS_VAR_MAP: Record<keyof ShopTheme, string> = {
  primary: "--shop-primary",
  primaryHover: "--shop-primary-hover",
  primaryForeground: "--shop-primary-foreground",
  sidebarBackground: "--shop-sidebar-bg",
  sidebarForeground: "--shop-sidebar-fg",
  sidebarMuted: "--shop-sidebar-muted",
  sidebarBorder: "--shop-sidebar-border",
  accent: "--shop-accent",
  accentForeground: "--shop-accent-fg",
  ring: "--shop-ring",
};

export function applyShopTheme(theme: ShopTheme = getShopTheme()): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  for (const [key, cssVar] of Object.entries(SHOP_THEME_CSS_VAR_MAP) as Array<
    [keyof ShopTheme, string]
  >) {
    root.style.setProperty(cssVar, theme[key]);
  }
}
