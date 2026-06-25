# Walkthrough - Operation Management Platform (Lowlands Coffee)

We have built a fully featured, premium, production-ready frontend for the **Operation Management Platform** (for Admin, Manager, and Staff POS roles) in the Lowlands Coffee codebase.

## Changes Made

### 1. Customer Route Group Reorganization (`(customer)`)
- Created `src/app/[locale]/(customer)/layout.tsx` to handle consumer-facing `<Header />` and `<Footer />` rendering.
- Re-routed all customer folders (e.g. `menu`, `cart`, `checkout`, `profile`, `login`, `register`, and the homepage `page.tsx`) into the invisible `(customer)` Route Group.
- Removed Header and Footer elements from the root localized layout `src/app/[locale]/layout.tsx` to prevent consumer layout styles from bleeding into administrative systems.

### 2. State Store & Static Database (`src/store/` & `src/mock/`)
- Created `src/store/dashboardStore.ts`, a Zustand state store persisted in `localStorage` to simulate a real-time reactive database.
- Implemented static databases in:
  - `src/mock/branches.ts` — Initial locations.
  - `src/mock/products.ts` — Initial beverage variants and toppings.
  - `src/mock/employees.ts` — Initial shift roster.
  - `src/mock/customers.ts` — Initial member accounts.
  - `src/mock/orders.ts` — Initial order histories.
- Programmed store actions for full CRUD workflows (Branches, Products, Categories, Employees, Promotions, Inventory Restocking, Order processing, and customer spending summaries).

### 3. Reusable UI, Charts & Dashboard Components
- Created `src/components/layout/DashboardLayout.tsx` — Sticky sidebar, responsive mobile drawers, page titles, and a **mode switcher** dropdown to jump between portals during review.
- Created `src/components/layout/Sidebar.tsx` — Menu lists that adapt depending on role logs (Admin vs. Manager).
- Created `src/components/dashboard/StatsCard.tsx` — Metric cards with trend indicators and dark-glass styling.
- Created `src/components/charts/Chart.tsx` — Visualizations for sales trends, branch allocations, and item charts using custom animated SVGs (Line, Bar, Pie) for React 19 compatibility.
- Created `src/components/tables/DataTable.tsx` — Table with search query matches, pagination, custom cells, and action triggers.
- Created `src/components/tables/SearchBar.tsx` & `Filter.tsx` — Table search and dropdown selects.
- Created `src/components/ui/Modal.tsx` — Accessible dialog panels.
- Created `src/components/pos/ProductCard.tsx` & `POSCart.tsx` — POS register components with size selections, topping options, cart item operations, promo coupon verification, cash return calculator, and formatted retail receipt outputs.

### 4. Admin, Manager, & Staff Portals
- **Admin routes (`admin/`)**:
  - `dashboard` — System statistics and HSL Hues sales graphs.
  - `branches` — CRUD locations list.
  - `products` — CRUD beverage options with size S/M/L prices.
  - `categories` — CRUD item classifications.
  - `employees` — CRUD employee rosters and work ca assignments.
  - `customers` — Member ledger.
  - `orders` — Main transaction history with order progress toggles.
  - `promotions` — CRUD discount codes.
  - `reports` — Distribution profiles.
- **Manager routes (`manager/`)**:
  - `dashboard` — Store-specific totals (Hồ Con Rùa branch ID 2).
  - `orders` — Workflow management.
  - `inventory` — Ingredient checklists with restock forms.
  - `staff` — Staff roster.
  - `revenue` & `reports` — Branch financials.
- **Staff routes (`staff/`)**:
  - `pos` — Retail cash register.
  - `orders` — Barista list.
  - `history` — Receipt lookup.

---

## Verification Plan

### Automated Build Checks
Validate Next.js compilation:
```bash
npm run type-check
npm run build
```

### Manual Verification Flow
1. **Launch**: Run `npm run dev`.
2. **Explore Admin Dashboard** (`/vi/admin/dashboard`): Verify charts hover, stats values, and menu options. Try creating or editing a Branch or Product.
3. **Switch Roles**: Use the "Chế độ Test" selector in the header to jump to the **Manager Dashboard** (`/vi/manager/dashboard`). Notice metrics update to show Branch ID 2 (Hồ Con Rùa) values. Check the Inventory stock levels and perform a "Nhập kho bổ sung" (Restock) on an ingredient to watch warnings resolve.
4. **Place a Retail Order**: Switch to the **Màn hình POS** (`/vi/staff/pos`). Click on "Trà Sen Vàng", add toppings, select Size M, add notes, and press Add. Try applying coupon code `COFFEELOVER` or `LOWLANDS50`.
5. **Checkout**: Select payment method (e.g. Cash), input cash received, and hit confirm. Verify that the retail receipt displays correct change return and printing links.
6. **Verify Reactive Updates**: Go back to the **Admin Dashboard** (`/vi/admin/dashboard`). Verify that the totals, order counts, and charts have instantly updated to record the new POS order in real time!
