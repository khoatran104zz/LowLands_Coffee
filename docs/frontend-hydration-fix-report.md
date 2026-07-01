# Frontend Hydration Fix Report

Date: 2026-07-01

## Scope

Scanned the frontend for common Next.js hydration mismatch sources:

- `localStorage`, `window`, and `document` usage during render
- `Date.now()`, `new Date()`, and `Math.random()`
- `toLocaleString`, `toLocaleDateString`, and `toLocaleTimeString`
- Zustand persist hydration before mount
- obvious invalid HTML nesting markers/patterns
- browser-only code in Client Components

## Fixes Applied

### Auth Zustand store

File: `code/frontend/src/store/auth.store.ts`

- Removed render/module-time reads from `localStorage`.
- Added `hasHydrated` and `hydrateFromStorage()`.
- `login`, `logout`, and `updateUser` behavior remains unchanged.

### Auth-gated layouts/pages

Files:

- `code/frontend/src/components/layout/DashboardLayout.tsx`
- `code/frontend/src/components/admin/AdminLayout.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx`
- `code/frontend/src/app/[locale]/(customer)/profile/page.tsx`
- `code/frontend/src/components/features/layout/Header.tsx`

- Hydrate auth after mount before route access checks.
- Keep existing loading shells until client auth state is available.
- Prevent redirect decisions from running against pre-hydrated empty auth state.

### Dashboard Zustand persist

File: `code/frontend/src/store/dashboardStore.ts`

- Added `skipHydration: true`.
- Rehydrated the persisted dashboard store after mount from dashboard layouts/POS.
- Prevents persisted localStorage data from changing the first client render.

### Non-deterministic render values

Files:

- `code/frontend/src/app/[locale]/(dashboard)/manager/dashboard/page.tsx`
- `code/frontend/src/components/features/layout/Footer.tsx`

- Replaced render-time `Math.random()` chart fallback with deterministic index-based fallback values.
- Moved footer year calculation to a mounted effect with a stable initial value.

### Locale-sensitive formatting

Files across dashboard, POS, charts, products, and featured products.

- Replaced no-argument `toLocaleString()` calls with `toLocaleString("vi-VN")`.
- Existing explicit `toLocaleDateString("vi-VN")`, `toLocaleTimeString("vi-VN")`, and `toLocaleString("vi-VN")` were kept.

## Scan Notes

- Remaining `window` and `document` usages are in effects or event handlers.
- Remaining `Math.random()` and `new Date()` in `admin/import-notes` are inside the create action handler, not render.
- Remaining `new Date()` in POS page runs only after the mounted loading gate.
- No `<<<<<<<`, `=======`, or `>>>>>>>` conflict markers found in frontend source.
- No obvious invalid nesting patterns were found by the targeted scan.

## Verification

Passed:

```powershell
npm.cmd --prefix code/frontend run type-check
```

Frontend dev smoke passed:

```powershell
npm.cmd --prefix code/frontend run dev
```

Result:

- Next.js 16.2.9 started successfully.
- Local URL: `http://localhost:3000`
- Ready in 801ms during smoke run.
- The smoke process was stopped after verification.
