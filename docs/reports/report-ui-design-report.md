# Reports Module UI Design Report

This report outlines the layout, design system integration, and components implemented for the "Báo cáo thống kê" (Statistical Reports) UI module of the Lowlands Coffee project.

---

## 1. Layout & Wireframe

The design follows a professional **ERP system layout**, distinguishing it from the realtime dashboard.

```
+-----------------------------------------------------------------------------------+
|  Breadcrumb: Admin or Manager / Báo cáo thống kê                                  |
|  Title: Báo cáo thống kê                                [Refresh] [Export Excel]  |
+-----------------------------------------------------------------------------------+
|  [Calendar Icon] BỘ LỌC BÁO CÁO                                                    |
|  Kỳ báo cáo: [ This Month v ]  Từ ngày: [01/07/2026]   Đến ngày: [07/07/2026]      |
|  Chi nhánh:  [ All Stores v ]  Phương thức: [ All v ]  Trạng thái: [ All v ]       |
|  Từ khóa:    [ Nhập mã đơn, nguyên liệu...         ]  [ Reset ] [ Lọc (Search) ]  |
+-----------------------------------------------------------------------------------+
|  [Doanh thu]  [Đơn hàng]  [Kho hàng]  [Thanh toán]  [Phiếu nhập]  [Tiêu thụ]        |
+-----------------------------------------------------------------------------------+
|  (SUB-VIEW AREA - Dynamic state rendering based on active tab)                   |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Summary Metric Cards (e.g. Total, Completed, Cancelled, Average)             |  |
|  +-----------------------------------------------------------------------------+  |
|  | Visual Charts (Line, Bar, Donut, Horizontal Bar depending on context)        |  |
|  +-----------------------------------------------------------------------------+  |
|  | Detail Tables (Pagination, Sorting, Keyword Search, responsive layout)        |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Components & Structure

To prevent code duplication, we created a single shared container component that dynamically handles permission logic and layout states.

### Reusable Shared Components
* **ReportsContainer**: (`code/frontend/src/components/admin/ReportsContainer.tsx`)
  * Houses all state management for filters (start/end dates, storeId, payment method, order status, search keyword).
  * Houses helper functions to calculate dates dynamically on quick range changes (Today, Yesterday, This Week, Last Week, This Month, Last Month).
  * Consolidates all 6 tab sub-views.
  * Filters raw datasets from APIs client-side in the UI during this Sprint.
* **LineChart, BarChart, PieChart**: (`code/frontend/src/components/charts/Chart.tsx`)
  * Shared drawing components utilizing SVG scaling.
* **HorizontalBarChart**: (Added to `code/frontend/src/components/charts/Chart.tsx`)
  * New reusable chart component to support horizontal bar comparison metrics (Top Consumed Ingredients).
* **StatsCard**: (`code/frontend/src/components/admin/StatsCard.tsx`)
  * Used to display aggregated summary metrics cards (e.g. Total Revenue, Orders, Adjustment, Low Stock).

---

## 3. Tabs & Reports View Details

### Tab 1: Doanh thu (Revenue)
* **Summary Cards**: Doanh thu, Số đơn, Giá trị TB đơn, Đơn hoàn thành, Đơn đã hủy, Hoàn trả (Refund).
* **Chart**: Revenue Trend (Line Chart) showing date-wise revenue trends.
* **Table**: Columns: `Date`, `Store`, `Revenue`, `Orders`, `Completed`, `Cancelled`, `Average Order Value`.

### Tab 2: Đơn hàng (Orders)
* **Summary Cards**: Tổng số đơn, Đơn Hoàn thành, Đang chế biến, Món sẵn sàng, Đơn đã hủy.
* **Chart**: Orders Trend (Bar Chart) showing order counts per day.
* **Table**: List of orders matching filters with status badges and payment methods.

### Tab 3: Kho hàng (Inventory)
* **Summary Cards**: Tồn kho đầu kỳ, Tồn kho hiện tại, Phiếu cân đối (Adjustment), Nguyên liệu sắp hết.
* **Chart**: Inventory Movement (Bar Chart) comparing total IN vs OUT stock changes.
* **Table**: Columns: `Ingredient`, `Opening`, `IN`, `OUT`, `Adjustment`, `Closing`, `Unit`.
  * Computes opening balances dynamically: `Opening = Closing - IN + OUT - Adjustment`.

### Tab 4: Thanh toán (Payment)
* **Summary Cards**: Tiền mặt, Thẻ ngân hàng, Chuyển khoản, Ví MoMo, Hoàn trả cổng.
* **Chart**: Payment Breakdown (Pie Chart / Donut Chart) showing percentage shares of payment methods.
* **Table**: Columns: `Method`, `Orders`, `Revenue`, `Percentage`.

### Tab 5: Phiếu nhập (Goods Receipt)
* **Summary Cards**: Số phiếu nhập hôm nay, Tổng số phiếu nhập, Đối tác cung cấp, Giá trị nhập kho.
* **Table**: Columns: `Receipt Code`, `Supplier`, `Store`, `Created By`, `Status`, `Amount`.

### Tab 6: Tiêu thụ (Ingredient Consumption)
* **Summary Cards**: Tổng lượng tiêu thụ, Nguyên liệu sắp hết, Hệ số hao hụt / hủy món (Waste).
* **Chart**: Top Consumed Ingredients (Horizontal Bar Chart).
* **Table**: Columns: `Ingredient`, `Consumed`, `Current Stock`, `Unit`.

---

## 4. Admin vs Manager Differences

| Feature | Admin View | Manager View |
| :--- | :--- | :--- |
| **Route** | `/[locale]/(dashboard)/admin/reports` | `/[locale]/(dashboard)/manager/reports` |
| **Store Filter** | Enabled (Allows selecting specific stores or "All Stores") | Hidden (Fixed to the manager's store via `user.branchName`) |
| **Data Scope** | Aggregates all stores in the enterprise | Restricts views & details to the manager's assigned branch |

---

## 5. Future Backend Mapping & Integration

* **Export PDF/Excel**:
  * Currently in a disabled UI state with hover tooltip: *"Sẽ triển khai ở Sprint Backend"*.
  * In the next sprint, this will call the backend export endpoints (e.g. `/api/v1/reports/export/excel?tab=revenue` or similar) returning binaries or download links.
* **Server-side Aggregation**:
  * Instead of fetching raw datasets via `getOrders({ page:0, size:2000 })` and filtering/aggregating client-side, the next sprint will define a specific analytics endpoint: `/api/v1/reports/summary?tab=revenue&startDate=2026-07-01&endDate=2026-07-07&storeId=1` to optimize database query performance.

---

## 6. Files Summary

### Created Files
* **[ReportsContainer.tsx](file:///c:/Users/rosek/OneDrive/Documents/LowlandsCF_G10/LowLands_Coffee/code/frontend/src/components/admin/ReportsContainer.tsx)**: Shared reports module UI shell.
* **[report-ui-design-report.md](file:///c:/Users/rosek/OneDrive/Documents/LowlandsCF_G10/LowLands_Coffee/docs/reports/report-ui-design-report.md)**: This documentation report.

### Modified Files
* **[Chart.tsx](file:///c:/Users/rosek/OneDrive/Documents/LowlandsCF_G10/LowLands_Coffee/code/frontend/src/components/charts/Chart.tsx)**: Appended `HorizontalBarChart` reusable component.
* **[page.tsx (Admin)](file:///c:/Users/rosek/OneDrive/Documents/LowlandsCF_G10/LowLands_Coffee/code/frontend/src/app/[locale]/(dashboard)/admin/reports/page.tsx)**: Redesigned to load `ReportsContainer`.
* **[page.tsx (Manager)](file:///c:/Users/rosek/OneDrive/Documents/LowlandsCF_G10/LowLands_Coffee/code/frontend/src/app/[locale]/(dashboard)/manager/reports/page.tsx)**: Redesigned to load `ReportsContainer`.
