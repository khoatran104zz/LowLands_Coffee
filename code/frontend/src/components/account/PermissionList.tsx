"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function PermissionList() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const getRolePermissions = (roleName: string) => {
    switch (roleName?.toUpperCase()) {
      case "ADMIN":
        return [
          { title: "Quản lý sản phẩm", desc: "Xem, tạo mới, chỉnh sửa thông tin và danh mục sản phẩm toàn hệ thống." },
          { title: "Quản lý nhân viên & tài khoản", desc: "Tuyển dụng nhân viên, cấp tài khoản cho các vai trò và cấp quyền." },
          { title: "Quản lý chuỗi chi nhánh", desc: "Giám sát thông tin, thiết lập hoạt động của toàn bộ chuỗi cửa hàng." },
          { title: "Quản lý báo cáo & doanh thu", desc: "Xem tổng quát doanh thu, doanh số, báo cáo thống kê chuỗi cửa hàng." },
          { title: "Cấu hình cài đặt hệ thống", desc: "Tùy biến các cài đặt lõi, mã khuyến mãi và chính sách hệ thống." }
        ];
      case "MANAGER":
        return [
          { title: "Quản lý kho hàng & nguyên liệu", desc: "Theo dõi nguyên liệu tồn kho, nhập nguyên liệu mới và cảnh báo hết hàng." },
          { title: "Quản lý lịch ca làm việc", desc: "Phân chia lịch trực, theo dõi ca và quản lý nhân sự tại chi nhánh." },
          { title: "Xử lý đơn hàng & doanh thu", desc: "Theo dõi luồng xử lý đơn hàng, thống kê doanh số bán hàng của chi nhánh." },
          { title: "Báo cáo chi nhánh", desc: "Xuất dữ liệu hiệu suất và doanh thu gửi lên ban quản trị." }
        ];
      case "STAFF":
        return [
          { title: "Tạo đơn hàng nhanh (POS)", desc: "Lên đơn gọi đồ uống, chọn topping, note ghi chú nhanh cho khách." },
          { title: "Thanh toán & Xuất hóa đơn", desc: "Xử lý các hình thức thanh toán, in hóa đơn và thối tiền cho khách." },
          { title: "Quản lý sơ đồ bàn", desc: "Sắp xếp bàn, kiểm tra bàn trống phục vụ khách ăn uống tại chỗ." },
          { title: "Xem lịch sử đơn bán trong ca", desc: "Truy vết và in lại hóa đơn các giao dịch đã thực hiện trong ca trực." }
        ];
      case "CUSTOMER":
        return [
          { title: "Xem thông tin hồ sơ", desc: "Cập nhật thông tin nhận hàng và tài khoản cá nhân trực tuyến." },
          { title: "Xem lịch sử mua hàng", desc: "Theo dõi trạng thái giao hàng các đơn đặt đồ uống trực tuyến." },
          { title: "Ví Voucher & Khuyến mãi", desc: "Lưu giữ và áp dụng mã giảm giá khi đặt hàng trực tuyến." },
          { title: "Quản lý địa chỉ giao hàng", desc: "Thiết lập danh mục địa chỉ nhận hàng thuận tiện." }
        ];
      default:
        return [
          { title: "Truy cập thông tin cơ bản", desc: "Xem hồ sơ cá nhân và nhận các thông báo nội bộ của hệ thống." }
        ];
    }
  };

  const permissions = getRolePermissions(user.roleName || "");

  return (
    <div className="bg-white dark:bg-zinc-900/45 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-2xl text-left flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 mb-1.5 select-none flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-zinc-400" />
          <span>{t("auth.account.permissions")}</span>
        </h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
          Chức vụ hiện tại: <span className="text-amber-800 font-extrabold">{user.roleName}</span>
        </p>
      </div>

      <div className="space-y-3.5 mt-2">
        {permissions.map((p, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-3 p-3 bg-zinc-50/50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950 hover:shadow-2xs transition-all duration-200"
          >
            <CheckCircle2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-zinc-850 dark:text-zinc-200">{p.title}</span>
              <span className="block text-[11px] text-zinc-450 leading-relaxed font-medium">{p.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
