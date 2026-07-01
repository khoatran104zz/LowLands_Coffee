"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, CheckCircle2, AlertTriangle, Play, Pause } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useDashboardStore } from "@/store/dashboardStore";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Filter } from "@/components/admin/Filter";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

interface ShiftRoster {
  id: number;
  dayOfWeek: string;
  shiftName: string;
  timeRange: string;
  employees: string[];
}

interface AttendanceLog {
  id: number;
  fullName: string;
  date: string;
  shiftName: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "on_time" | "late" | "absent" | "working";
}

export default function ManagerShiftsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"schedule" | "attendance">("schedule");

  const currentUser = useAuthStore((state) => state.user);
  const branchName = currentUser?.branchName || "Hồ Con Rùa";
  const employees = useDashboardStore((state) => state.employees);
  const MY_BRANCH_ID = 2;
  const branchStaff = employees.filter(e => e.branchId === MY_BRANCH_ID);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Mock roster schedule for Hồ Con Rùa branch
  const scheduleData: ShiftRoster[] = [
    { id: 1, dayOfWeek: "Thứ Hai", shiftName: "Ca Sáng (08:00 - 13:00)", timeRange: "08:00 - 13:00", employees: ["Nguyễn Văn An", "Trần Thị Bình"] },
    { id: 2, dayOfWeek: "Thứ Hai", shiftName: "Ca Chiều (13:00 - 18:00)", timeRange: "13:00 - 18:00", employees: ["Lê Hoàng Long", "Phạm Minh Thư"] },
    { id: 3, dayOfWeek: "Thứ Hai", shiftName: "Ca Tối (18:00 - 22:30)", timeRange: "18:00 - 22:30", employees: ["Đỗ Hải Đăng", "Hoàng Kim Ngân"] },
    { id: 4, dayOfWeek: "Thứ Ba", shiftName: "Ca Sáng (08:00 - 13:00)", timeRange: "08:00 - 13:00", employees: ["Nguyễn Văn An", "Lê Hoàng Long"] },
    { id: 5, dayOfWeek: "Thứ Ba", shiftName: "Ca Chiều (13:00 - 18:00)", timeRange: "13:00 - 18:00", employees: ["Trần Thị Bình", "Phạm Minh Thư"] },
    { id: 6, dayOfWeek: "Thứ Ba", shiftName: "Ca Tối (18:00 - 22:30)", timeRange: "18:00 - 22:30", employees: ["Đỗ Hải Đăng", "Hoàng Kim Ngân"] },
    { id: 7, dayOfWeek: "Thứ Tư", shiftName: "Ca Sáng (08:00 - 13:00)", timeRange: "08:00 - 13:00", employees: ["Nguyễn Văn An", "Trần Thị Bình"] },
    { id: 8, dayOfWeek: "Thứ Tư", shiftName: "Ca Chiều (13:00 - 18:00)", timeRange: "13:00 - 18:00", employees: ["Lê Hoàng Long", "Phạm Minh Thư"] },
    { id: 9, dayOfWeek: "Thứ Tư", shiftName: "Ca Tối (18:00 - 22:30)", timeRange: "18:00 - 22:30", employees: ["Đỗ Hải Đăng", "Hoàng Kim Ngân"] },
  ];

  // Mock real checkin attendance logs
  const attendanceLogs: AttendanceLog[] = [
    { id: 1, fullName: "Nguyễn Văn An", date: "01/07/2026", shiftName: "Ca Sáng", checkIn: "07:54", checkOut: "13:02", status: "on_time" },
    { id: 2, fullName: "Trần Thị Bình", date: "01/07/2026", shiftName: "Ca Sáng", checkIn: "08:05", checkOut: "13:00", status: "late" },
    { id: 3, fullName: "Lê Hoàng Long", date: "01/07/2026", shiftName: "Ca Chiều", checkIn: "12:57", checkOut: "18:04", status: "on_time" },
    { id: 4, fullName: "Phạm Minh Thư", date: "01/07/2026", shiftName: "Ca Chiều", checkIn: "12:55", checkOut: "18:01", status: "on_time" },
    { id: 5, fullName: "Đỗ Hải Đăng", date: "01/07/2026", shiftName: "Ca Tối", checkIn: "18:12", checkOut: null, status: "working" },
    { id: 6, fullName: "Hoàng Kim Ngân", date: "01/07/2026", shiftName: "Ca Tối", checkIn: "17:58", checkOut: null, status: "working" },
    { id: 7, fullName: "Nguyễn Văn An", date: "30/06/2026", shiftName: "Ca Sáng", checkIn: "07:58", checkOut: "13:05", status: "on_time" },
    { id: 8, fullName: "Lê Hoàng Long", date: "30/06/2026", shiftName: "Ca Sáng", checkIn: null, checkOut: null, status: "absent" }
  ];

  const filteredAttendance = attendanceLogs.filter((log) => {
    const matchesStatus = !statusFilter || log.status === statusFilter;
    const matchesSearch = !searchQuery || log.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const rosterColumns: Column<ShiftRoster>[] = [
    { key: "id", header: "ID" },
    { key: "dayOfWeek", header: "Thứ trong tuần" },
    { key: "shiftName", header: "Khung giờ trực" },
    {
      key: "employees",
      header: "Nhân viên được phân công",
      render: (item) => (
        <div className="flex flex-wrap gap-1.5 select-none">
          {item.employees.map((emp, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-amber-900 bg-amber-800/10 border border-amber-900/10">
              {emp}
            </span>
          ))}
        </div>
      )
    }
  ];

  const attendanceColumns: Column<AttendanceLog>[] = [
    { key: "id", header: "ID" },
    { key: "fullName", header: "Nhân viên" },
    { key: "date", header: "Ngày làm việc" },
    { key: "shiftName", header: "Tên ca trực" },
    { key: "checkIn", header: "Giờ Check-in", render: (item) => item.checkIn || "--:--" },
    { key: "checkOut", header: "Giờ Check-out", render: (item) => item.checkOut || "--:--" },
    {
      key: "status",
      header: "Trạng thái ca",
      render: (item) => {
        switch (logStatusMap[item.status].badge) {
          case "active":
            return <StatusBadge status="active" customLabel={logStatusMap[item.status].label} />;
          case "inactive":
            return <StatusBadge status="inactive" customLabel={logStatusMap[item.status].label} />;
          case "warning":
          default:
            return <StatusBadge status="warning" customLabel={logStatusMap[item.status].label} />;
        }
      }
    }
  ];

  const logStatusMap = {
    on_time: { label: "Đúng giờ", badge: "active" },
    late: { label: "Đi muộn", badge: "warning" },
    absent: { label: "Vắng mặt", badge: "inactive" },
    working: { label: "Đang trực ca", badge: "warning" }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-outfit uppercase tracking-wide">
            Ca Làm Việc & Chấm Công - {branchName}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Theo dõi phân công lịch trực tuần của barista và kết quả điểm danh Check-in/Check-out thực tế tại cửa hàng.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 select-none border-b border-zinc-200">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
            activeTab === "schedule"
              ? "border-[#c8510a] text-[#c8510a]"
              : "border-transparent text-muted-foreground hover:text-zinc-700"
          }`}
        >
          Lịch phân ca tuần
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
            activeTab === "attendance"
              ? "border-[#c8510a] text-[#c8510a]"
              : "border-transparent text-muted-foreground hover:text-zinc-700"
          }`}
        >
          Nhật ký chấm công
        </button>
      </div>

      {activeTab === "schedule" ? (
        <div className="space-y-4">
          <DataTable
            data={scheduleData}
            columns={rosterColumns}
            searchKey="dayOfWeek"
            searchQuery=""
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm theo tên nhân viên..."
            />
            <Filter
              label="Trạng thái chấm công"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "on_time", label: "Đúng giờ" },
                { value: "late", label: "Đi muộn" },
                { value: "absent", label: "Vắng mặt" },
                { value: "working", label: "Đang trực ca" }
              ]}
              placeholder="Tất cả trạng thái"
            />
          </div>

          <DataTable
            data={filteredAttendance}
            columns={attendanceColumns}
            searchKey="fullName"
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
}
