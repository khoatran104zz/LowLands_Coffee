import { User } from "@/types";

export interface CustomerExtended extends User {
  orderCount: number;
  totalSpent: number;
}

export const INITIAL_CUSTOMERS: CustomerExtended[] = [
  {
    id: 1001,
    fullName: "Lê Văn Tiến",
    email: "tien.le@gmail.com",
    phone: "0901.234.567",
    status: "active",
    orderCount: 15,
    totalSpent: 620000
  },
  {
    id: 1002,
    fullName: "Nguyễn Thị Mai",
    email: "mai.nguyen@yahoo.com",
    phone: "0912.345.678",
    status: "active",
    orderCount: 24,
    totalSpent: 1105000
  },
  {
    id: 1003,
    fullName: "Trần Minh Quang",
    email: "quang.tran@outlook.com",
    phone: "0983.456.789",
    status: "active",
    orderCount: 8,
    totalSpent: 345000
  },
  {
    id: 1004,
    fullName: "Phạm Thu Thảo",
    email: "thao.pham@gmail.com",
    phone: "0974.567.890",
    status: "active",
    orderCount: 32,
    totalSpent: 1890000
  },
  {
    id: 1005,
    fullName: "Hoàng Ngọc Huy",
    email: "huy.hoang@gmail.com",
    phone: "0965.678.901",
    status: "inactive",
    orderCount: 1,
    totalSpent: 35000
  }
];
