export interface Employee {
  id: number;
  fullName: string;
  role: "admin" | "manager" | "staff";
  branchId: number;
  branchName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  workingShift?: string;
  performance?: string; // e.g. "9.2/10" or "A+"
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn Hùng",
    role: "admin",
    branchId: 1,
    branchName: "Lowlands Coffee - Tây Nguyên Original",
    email: "hung.nguyen@lowlandscoffee.com.vn",
    phone: "0905.111.222",
    status: "active",
    workingShift: "Fulltime - Hành chính",
    performance: "Xuất sắc"
  },
  {
    id: 2,
    fullName: "Trần Thị Lan",
    role: "manager",
    branchId: 2,
    branchName: "Lowlands Coffee - Hồ Con Rùa",
    email: "lan.tran@lowlandscoffee.com.vn",
    phone: "0918.333.444",
    status: "active",
    workingShift: "Ca Sáng (06:00 - 14:00)",
    performance: "9.2/10"
  },
  {
    id: 3,
    fullName: "Lê Hoàng Nam",
    role: "staff",
    branchId: 2,
    branchName: "Lowlands Coffee - Hồ Con Rùa",
    email: "nam.le@lowlandscoffee.com.vn",
    phone: "0982.555.666",
    status: "active",
    workingShift: "Ca Sáng (06:00 - 14:00)",
    performance: "8.5/10"
  },
  {
    id: 4,
    fullName: "Phạm Minh Tuấn",
    role: "staff",
    branchId: 2,
    branchName: "Lowlands Coffee - Hồ Con Rùa",
    email: "tuan.pham@lowlandscoffee.com.vn",
    phone: "0973.777.888",
    status: "active",
    workingShift: "Ca Chiều (14:00 - 22:00)",
    performance: "8.0/10"
  },
  {
    id: 5,
    fullName: "Vũ Thị Hương",
    role: "manager",
    branchId: 3,
    branchName: "Lowlands Coffee - Nhà Thờ Lớn",
    email: "huong.vu@lowlandscoffee.com.vn",
    phone: "0964.999.000",
    status: "active",
    workingShift: "Fulltime",
    performance: "9.5/10"
  },
  {
    id: 6,
    fullName: "Hoàng Anh Đức",
    role: "staff",
    branchId: 3,
    branchName: "Lowlands Coffee - Nhà Thờ Lớn",
    email: "duc.hoang@lowlandscoffee.com.vn",
    phone: "0909.888.777",
    status: "active",
    workingShift: "Ca Tối (18:00 - 23:00)",
    performance: "8.8/10"
  },
  {
    id: 7,
    fullName: "Đỗ Bảo Châu",
    role: "staff",
    branchId: 4,
    branchName: "Lowlands Coffee - Sông Hàn",
    email: "chau.do@lowlandscoffee.com.vn",
    phone: "0934.123.456",
    status: "inactive",
    workingShift: "Ca Chiều (14:00 - 22:00)",
    performance: "Khá"
  }
];
