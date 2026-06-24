// Placeholder component for future Admin Dashboard integration.
// Only layout structure is defined here; backend endpoints will be integrated later.

export function AdminDashboard() {
  return (
    <div className="p-6 bg-background rounded-xl border border-border/80 text-left">
      <h2 className="text-xl font-bold text-primary mb-4">Lowlands Coffee Admin Panel (Placeholder)</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Quản lý sản phẩm, đơn hàng, cửa hàng, nguyên liệu và công thức pha chế.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-foreground/80">
        <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
          <h4 className="font-bold text-sm text-primary mb-2">Quản lý Sản phẩm</h4>
          <span className="text-muted-foreground block mb-3">Thêm, sửa, xóa các biến thể, topping và danh mục.</span>
          <span className="text-[10px] uppercase font-bold text-accent">Status: Shell Only</span>
        </div>
        <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
          <h4 className="font-bold text-sm text-primary mb-2">Quản lý Đơn hàng</h4>
          <span className="text-muted-foreground block mb-3">Theo dõi hóa đơn, duyệt trạng thái giao hàng/hoàn tất.</span>
          <span className="text-[10px] uppercase font-bold text-accent">Status: Shell Only</span>
        </div>
        <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
          <h4 className="font-bold text-sm text-primary mb-2">Quản lý Kho &amp; Công thức</h4>
          <span className="text-muted-foreground block mb-3">Kiểm kê nguyên liệu tại các chi nhánh và định mức pha chế.</span>
          <span className="text-[10px] uppercase font-bold text-accent">Status: Shell Only</span>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
