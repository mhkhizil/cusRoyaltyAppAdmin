# AI coding standards (read this first)

**Every AI agent and contributor must read and follow this file before making changes.**

This project is the **Customer Royalty admin dashboard** frontend. All new work must match the layered architecture, strict TypeScript rules, responsive UI patterns, and shop-aware theme tokens defined here.

---

## 1. Architecture (required)

Always follow [architecture.md](./architecture.md). Do not skip layers or invent parallel patterns.

### Layer flow

1. **Domain** — `src/core/domain` — entities and interfaces only. No React, no HTTP.
2. **Application** — `src/core/application` — DTOs and service implementations.
3. **Infrastructure** — `src/core/infrastructure` — `HttpClient`, `Api*Repository`, DI container.
4. **Presentation** — `src/core/presentation/hooks` — React hooks that call services.
5. **UI** — `src/pages`, `src/components`, `src/widgets` — thin screens that call hooks only.

### Hard rules

- Pages and components **must not** import `HttpClient`, Axios, or repositories directly.
- Do **not** add `src/features/<feature>/<feature>Api.ts` bypass APIs.
- Normalize API response shapes in repositories or application services, not in pages.
- Register new repositories and services in `src/core/infrastructure/di/container.ts`.
- Mirror existing features (Auth, Users, Customers) when adding new resources.

---

## 2. TypeScript and type safety (required)

Run a full typecheck after meaningful changes:

```bash
npm run build
```

This runs `tsc -b` before the Vite build. Fix every type error your change introduces.

### Forbidden and discouraged types

| Avoid | Use instead |
|--------|-------------|
| `any` | A concrete type, generic, or `unknown` with narrowing |
| `as any` | Fix the type at the source or add a typed mapper |
| Untyped function params | Explicit parameter and return types on exported APIs |
| `@ts-ignore` / `@ts-expect-error` | Fix the underlying type issue (only use with a short comment if truly unavoidable) |
| Empty `object` or `{}` for data | A named interface or type alias |

### Required practices

- Type all **exported** functions, hooks, service methods, and component props.
- Type API payloads with DTOs in `src/core/application/dtos` — never guess field names.
- Prefer `unknown` + type guards over `any` when handling errors or external data.
- Use union types and `as const` for fixed sets of values (status, variant, role, etc.).
- Reuse domain entities and DTOs; do not duplicate shapes with slightly different names.

### ESLint

`@typescript-eslint/no-explicit-any` is enabled. Do not disable it for new code.

---

## 3. Responsive UI (required for every page)

Every page and layout must work on **mobile (320px+)**, **tablet**, and **desktop**.

### Layout rules

- Use a **mobile-first** approach: base styles for small screens, then `sm:`, `md:`, `lg:` breakpoints.
- Page content padding: `p-4 sm:p-6` (match `AppShell`).
- Use `flex-wrap`, `min-w-0`, and `overflow-x-auto` so content does not break narrow viewports.
- Grids: start single-column (`grid-cols-1`), expand at `md:` or `lg:` (e.g. `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4`).
- Tables: wrap in `overflow-x-auto` or provide a stacked/card fallback on small screens.
- Forms: full-width inputs on mobile (`w-full`); side-by-side fields only from `sm:` or `md:` upward.
- Toolbars: `flex flex-wrap items-center gap-2` so actions wrap instead of overflowing.
- Hide non-essential labels on small screens with `hidden sm:block` when the shell already shows context.
- Test mentally at 320px, 768px, and 1280px before finishing a page.

### Shell consistency

Follow patterns in `src/widgets/layout/AppShell.tsx`:

- Collapsible sidebar width transition
- Sticky header with `flex-wrap` and responsive padding
- Scrollable main content area

---

## 4. Theme and visual identity (required)

This admin dashboard shares the **Customer Royalty** product family look:

- Dark branded sidebar, light (or dark-mode) content canvas
- Slate neutrals for surfaces and text hierarchy
- Rounded corners (`rounded-xl` cards, `rounded-lg` controls)
- Subtle borders and shadows on cards
- Compact, data-focused admin layout — not marketing-style pages

### Shop-aware theme tokens (required)

Brand colors **change per shop**. Do not hardcode shop-specific hex values in pages or one-off components.

**Single source of truth:** `src/theme/shopTheme.ts`

- `DEFAULT_SHOP_THEME` — default palette for this repo
- `SHOP_THEMES` — optional map of shop id → theme (add entries when onboarding a shop)
- `getShopTheme(shopId?)` — resolve the active theme

**Apply at runtime:** `applyShopTheme()` in `src/theme/applyShopTheme.ts` (called on app startup).

**CSS variables** are defined in `src/index.css` under `:root` (e.g. `--shop-primary`, `--shop-sidebar-bg`).

**Tailwind utilities** mapped from those variables (e.g. `bg-shop-primary`, `text-shop-primary`, `bg-shop-sidebar`).

### When writing UI

| Do | Don't |
|----|--------|
| Use `bg-shop-primary`, `text-shop-primary-foreground`, `bg-shop-sidebar`, `ring-shop-ring` | Hardcode `bg-blue-600`, `bg-[#...]`, or per-page brand hex |
| Use slate utilities for neutral surfaces/text (`bg-slate-50`, `text-slate-600`, `dark:...`) | Invent a new color system per page |
| Reuse `src/components/ui/*` (`Button`, `MetricCard`, etc.) | Duplicate button/card styles inline |
| Support light and dark mode via existing `ThemeProvider` / `dark:` variants | Light-only pages in an admin shell |
| Add new brand slots to `ShopTheme` + CSS vars if a new semantic color is needed | Scatter new CSS variables across random files |

### Changing colors for a new shop

1. Add or update an entry in `SHOP_THEMES` inside `src/theme/shopTheme.ts`.
2. Call `applyShopTheme(getShopTheme(shopId))` when shop context is known (e.g. after login or tenant load).
3. Do **not** edit individual pages — the token swap should rebrand the whole app.

---

## 5. i18n, permissions, and API

- Add user-visible strings to `src/lib/i18n/locales/en.json`.
- Route and sidebar access: use `usePermissions` and `PAGE_PERMISSIONS` — same source for both.
- Do not invent permission keys unless the backend provides them.
- Match backend request/response shapes exactly.

---

## 6. Validation before finishing

1. `npm run build` — must pass (typecheck + compile).
2. Confirm new pages are responsive at mobile, tablet, and desktop widths.
3. Confirm no raw brand hex / non-token brand colors were added.
4. Confirm architecture layers were respected (no HTTP in pages).
5. Keep changes surgical — no unrelated refactors.

---

## Quick reference

| Topic | Location |
|--------|----------|
| Architecture guide | [architecture.md](./architecture.md) |
| Agent entry point | [AGENTS.md](./AGENTS.md) |
| Shop theme tokens | `src/theme/shopTheme.ts` |
| Apply theme to DOM | `src/theme/applyShopTheme.ts` |
| Light/dark mode | `src/theme/ThemeProvider.tsx` |
| CSS variables | `src/index.css` |
| Shared UI | `src/components/ui/` |
| App shell / responsive reference | `src/widgets/layout/AppShell.tsx` |

If this document conflicts with code, fix the code to match these standards, then update this file.
