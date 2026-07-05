import { Order } from "@/types";

export interface OrderPrintOptions {
  cashierName?: string;
  storeName?: string;
  branchAddress?: string;
  branchPhone?: string;
  trackingUrl?: string;
  generatedAt?: Date;
}

const BRAND = {
  name: "Lowlands Coffee & Tea",
  primary: "#3A1D14",
  accent: "#C8510A",
  paper: "#FFFDF8",
  muted: "#8A7469",
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatCurrency = (value?: number) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const formatDateTime = (value?: string | Date) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const normalizeStatus = (status?: string) => status?.toLowerCase() || "pending";

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "pending") return "Chờ xác nhận";
  if (normalized === "confirmed") return "Đã xác nhận";
  if (normalized === "preparing") return "Đang pha chế";
  if (normalized === "ready") return "Sẵn sàng";
  if (normalized === "completed") return "Hoàn tất";
  if (normalized === "cancelled") return "Đã hủy";
  return status || "Chờ xác nhận";
};

const getOrderTypeLabel = (orderType: Order["orderType"]) => {
  if (orderType === "delivery") return "Giao hàng";
  if (orderType === "pickup") return "Khách đến nhận";
  if (orderType === "dine_in") return "Dùng tại bàn";
  return "Mang đi";
};

const getPaymentLabel = (paymentMethod: Order["paymentMethod"]) => {
  if (paymentMethod === "bank_transfer") return "Chuyển khoản ngân hàng";
  if (paymentMethod === "e_wallet") return "Ví điện tử / thẻ";
  return "Tiền mặt/COD";
};

const getPaymentStatusLabel = (status?: string) => {
  const normalized = status?.toUpperCase();
  if (normalized === "PAID") return "Đã thanh toán";
  if (normalized === "UNPAID") return "Chưa thanh toán";
  if (normalized === "PENDING") return "Đang chờ";
  if (normalized === "FAILED") return "Thanh toán lỗi";
  return status || "Theo phương thức đã chọn";
};

const buildItemRows = (order: Order) =>
  order.items
    .map((item, index) => {
      const toppings = item.toppings
        .map(
          (topping) => `
            <div class="item-subrow">
              <span>+ ${escapeHtml(topping.toppingName)} x${escapeHtml(topping.quantity)}</span>
              <span>${escapeHtml(formatCurrency(topping.totalPrice))}</span>
            </div>
          `,
        )
        .join("");
      const note = item.note
        ? `<div class="item-note">Ghi chú món: ${escapeHtml(item.note)}</div>`
        : "";

      return `
        <tr>
          <td class="index">${index + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(item.productName)} - Size ${escapeHtml(item.size)}</div>
            <div class="item-meta">${escapeHtml(formatCurrency(item.unitPrice))} x ${escapeHtml(item.quantity)}</div>
            ${toppings}
            ${note}
          </td>
          <td class="qty">${escapeHtml(item.quantity)}</td>
          <td class="money">${escapeHtml(formatCurrency(item.totalPrice))}</td>
        </tr>
      `;
    })
    .join("");

export const buildOrderTrackingUrl = (order: Order, locale = "vi") => {
  if (typeof window === "undefined" || !order.orderCode || !order.receiverPhone) return undefined;

  const normalizedLocale = locale.replace(/^\/+/, "") || "vi";
  const code = encodeURIComponent(order.orderCode);
  const phone = encodeURIComponent(order.receiverPhone);
  return `${window.location.origin}/${normalizedLocale}/track-order?code=${code}&phone=${phone}`;
};

export const buildOrderPrintHtml = (order: Order, options: OrderPrintOptions = {}) => {
  const generatedAt = options.generatedAt || new Date();
  const orderCode = order.orderCode || `#${order.id || "TEMP"}`;
  const storeName = options.storeName || order.storeName || "Lowlands Coffee - Default Store";
  const paymentStatus = getPaymentStatusLabel(order.payment?.paymentStatus);
  const branchAddress = options.branchAddress || "Hồ Con Rùa, Quận 3, TP. Hồ Chí Minh";
  const branchPhone = options.branchPhone || "Hotline: 028.3822.4466";

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hoa don ${escapeHtml(orderCode)}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #f5f0ea;
      color: ${BRAND.primary};
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.45;
    }

    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: ${BRAND.paper};
      padding: 16mm;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #eaded3;
      padding-bottom: 18px;
    }

    .brand {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .brand-mark {
      width: 54px;
      height: 54px;
      border: 2px solid #d7b982;
      border-radius: 18px;
      display: grid;
      place-items: center;
      color: ${BRAND.accent};
      font-size: 26px;
      font-weight: 900;
      background: #fff7ea;
    }

    .brand h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: .02em;
      text-transform: uppercase;
    }

    .brand p,
    .meta p {
      margin: 3px 0 0;
      color: ${BRAND.muted};
      font-size: 12px;
      font-weight: 700;
    }

    .meta {
      text-align: right;
      min-width: 190px;
    }

    .meta h2 {
      margin: 0;
      color: ${BRAND.accent};
      font-size: 22px;
      text-transform: uppercase;
    }

    .badge {
      display: inline-flex;
      margin-top: 8px;
      border-radius: 999px;
      border: 1px solid #e7c798;
      background: #fff6e7;
      color: ${BRAND.accent};
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 18px;
    }

    .card {
      border: 1px solid #eaded3;
      border-radius: 14px;
      background: #fffaf3;
      padding: 14px;
    }

    .card h3,
    .section-title {
      margin: 0 0 10px;
      color: ${BRAND.muted};
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .line {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 7px;
      font-size: 13px;
    }

    .line span:first-child {
      color: ${BRAND.muted};
      font-weight: 700;
    }

    .line strong {
      text-align: right;
      font-weight: 900;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      border: 1px solid #eaded3;
      border-radius: 14px;
      overflow: hidden;
    }

    thead {
      background: #f5ebe1;
      color: ${BRAND.muted};
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: .06em;
    }

    th,
    td {
      padding: 11px 12px;
      border-bottom: 1px solid #efe5dc;
      vertical-align: top;
      font-size: 12px;
    }

    th {
      text-align: left;
      font-weight: 900;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .index,
    .qty {
      width: 56px;
      text-align: center;
      color: ${BRAND.muted};
      font-weight: 900;
    }

    .money {
      width: 130px;
      text-align: right;
      color: ${BRAND.accent};
      font-weight: 900;
      white-space: nowrap;
    }

    .item-name {
      font-weight: 900;
      color: ${BRAND.primary};
    }

    .item-meta,
    .item-subrow,
    .item-note {
      margin-top: 4px;
      color: ${BRAND.muted};
      font-size: 11px;
      font-weight: 700;
    }

    .item-subrow {
      display: flex;
      justify-content: space-between;
      max-width: 360px;
      padding-left: 10px;
      border-left: 2px solid #eaded3;
    }

    .totals {
      margin-left: auto;
      margin-top: 16px;
      width: 310px;
      border: 1px solid #eaded3;
      border-radius: 14px;
      padding: 12px 14px;
      background: #fffaf3;
    }

    .total {
      margin-top: 9px;
      padding-top: 10px;
      border-top: 1px solid #eaded3;
      font-size: 19px;
    }

    .total strong:last-child {
      color: ${BRAND.accent};
    }

    .note {
      margin-top: 14px;
      border: 1px solid #f3d4a3;
      border-radius: 14px;
      background: #fff7ea;
      padding: 12px;
      color: #75513d;
      font-size: 12px;
      font-weight: 700;
    }

    .footer {
      display: grid;
      grid-template-columns: 1fr 210px;
      gap: 18px;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 2px solid #eaded3;
      color: ${BRAND.muted};
      font-size: 11px;
      font-weight: 700;
    }

    .track {
      border: 1px dashed #d7b982;
      border-radius: 14px;
      padding: 12px;
      word-break: break-word;
      background: #fffaf3;
    }

    .signature {
      text-align: center;
      min-height: 86px;
    }

    .signature-line {
      margin: 48px auto 0;
      width: 150px;
      border-top: 1px solid #bfae9f;
      padding-top: 6px;
      color: ${BRAND.primary};
      font-weight: 900;
    }

    .actions {
      position: sticky;
      bottom: 0;
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 14px;
      background: rgba(245, 240, 234, .92);
      border-top: 1px solid #eaded3;
    }

    .actions button {
      border: 0;
      border-radius: 999px;
      background: ${BRAND.accent};
      color: white;
      padding: 11px 22px;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
    }

    .actions button.secondary {
      background: white;
      color: ${BRAND.primary};
      border: 1px solid #d8c8bc;
    }

    @media print {
      body {
        background: white;
      }

      .sheet {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
      }

      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <section class="header">
      <div class="brand">
        <div class="brand-mark">L</div>
        <div>
          <h1>${escapeHtml(BRAND.name)}</h1>
          <p>${escapeHtml(storeName)}</p>
          <p>${escapeHtml(branchAddress)} - ${escapeHtml(branchPhone)}</p>
        </div>
      </div>
      <div class="meta">
        <h2>Hóa đơn</h2>
        <p>Mã đơn: <strong>${escapeHtml(orderCode)}</strong></p>
        <p>Ngày tạo: ${escapeHtml(formatDateTime(order.createdAt))}</p>
        <span class="badge">${escapeHtml(getStatusLabel(order.status))}</span>
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <h3>Khách hàng</h3>
        <div class="line"><span>Người nhận</span><strong>${escapeHtml(order.receiverName || "Khách")}</strong></div>
        <div class="line"><span>Số điện thoại</span><strong>${escapeHtml(order.receiverPhone || "-")}</strong></div>
        <div class="line"><span>Nhận hàng</span><strong>${escapeHtml(getOrderTypeLabel(order.orderType))}</strong></div>
        <div class="line"><span>Địa chỉ</span><strong>${escapeHtml(order.deliveryAddress || "-")}</strong></div>
      </div>
      <div class="card">
        <h3>Thanh toán</h3>
        <div class="line"><span>Phương thức</span><strong>${escapeHtml(getPaymentLabel(order.paymentMethod))}</strong></div>
        <div class="line"><span>Trạng thái</span><strong>${escapeHtml(paymentStatus)}</strong></div>
        <div class="line"><span>Thu ngân</span><strong>${escapeHtml(options.cashierName || "Lowlands Staff")}</strong></div>
        <div class="line"><span>In lúc</span><strong>${escapeHtml(formatDateTime(generatedAt))}</strong></div>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th class="index">STT</th>
          <th>Món</th>
          <th class="qty">SL</th>
          <th class="money">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemRows(order)}
      </tbody>
    </table>

    ${order.note ? `<div class="note">Ghi chú đơn hàng: ${escapeHtml(order.note)}</div>` : ""}

    <section class="totals">
      <div class="line"><span>Tạm tính</span><strong>${escapeHtml(formatCurrency(order.subtotal))}</strong></div>
      <div class="line"><span>Giảm giá</span><strong>${escapeHtml(formatCurrency(order.discountAmount))}</strong></div>
      <div class="line total"><strong>Tổng cộng</strong><strong>${escapeHtml(formatCurrency(order.totalAmount))}</strong></div>
    </section>

    <section class="footer">
      <div class="track">
        <div class="section-title">Theo dõi đơn hàng</div>
        ${
          options.trackingUrl
            ? `Khách hàng có thể tra cứu trạng thái đơn tại: ${escapeHtml(options.trackingUrl)}`
            : "Giữ lại hóa đơn này để cửa hàng hỗ trợ tra cứu khi cần."
        }
      </div>
      <div class="signature">
        <div class="section-title">Xác nhận</div>
        <div class="signature-line">Lowlands Coffee</div>
      </div>
    </section>
  </main>
  <div class="actions">
    <button type="button" onclick="window.print()">In / Lưu PDF</button>
    <button type="button" class="secondary" onclick="window.close()">Đóng</button>
  </div>
</body>
</html>`;
};

export const printOrderAsPdf = (order: Order, options: OrderPrintOptions = {}) => {
  if (typeof window === "undefined") return false;

  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(buildOrderPrintHtml(order, options));
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 350);

  return true;
};
