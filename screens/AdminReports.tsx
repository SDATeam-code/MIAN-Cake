
import React, { useState, useMemo } from 'react';
import { AdminScreen, Order, LoyalCustomer } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  orders: Order[];
}

const AdminReports: React.FC<Props> = ({ onNavigate, orders }) => {
  const [selectedMonth, setSelectedMonth] = useState('03');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [sortKey, setSortKey] = useState<'orderCount' | 'totalSpent'>('totalSpent');

  // Lọc đơn hàng theo tháng và năm được chọn
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = new Date(o.date);
      const m = (orderDate.getMonth() + 1).toString().padStart(2, '0');
      const y = orderDate.getFullYear().toString();
      return m === selectedMonth && y === selectedYear;
    });
  }, [orders, selectedMonth, selectedYear]);

  // Tính toán doanh thu thực tế của tháng/năm được chọn
  const actualRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
  }, [filteredOrders]);

  // Dữ liệu cho đồ thị 12 tháng của năm được chọn
  const chartData = useMemo(() => {
    const monthsData = Array(12).fill(0);
    orders.forEach(o => {
      const orderDate = new Date(o.date);
      if (orderDate.getFullYear().toString() === selectedYear) {
        monthsData[orderDate.getMonth()] += (o.price * o.quantity);
      }
    });
    
    // Tìm giá trị cao nhất để scale đồ thị
    const max = Math.max(...monthsData, 1);
    return monthsData.map(val => (val / max) * 100);
  }, [orders, selectedYear]);

  // Phân tích khách hàng từ đơn hàng đã lọc theo tháng
  const loyalCustomers = useMemo(() => {
    const customerMap = new Map<string, { totalSpent: number; orderCount: number }>();
    filteredOrders.forEach(o => {
      const data = customerMap.get(o.customerName) || { totalSpent: 0, orderCount: 0 };
      customerMap.set(o.customerName, {
        totalSpent: data.totalSpent + (o.price * o.quantity),
        orderCount: data.orderCount + 1
      });
    });

    const results: LoyalCustomer[] = Array.from(customerMap.entries()).map(([name, data]) => ({
      id: name,
      name: name,
      totalSpent: data.totalSpent,
      orderCount: data.orderCount
    }));

    return results.sort((a, b) => b[sortKey] - a[sortKey]);
  }, [filteredOrders, sortKey]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="pb-32 bg-gray-50 dark:bg-zinc-950 min-h-screen print:bg-white print:p-0">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center justify-between print:hidden">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold">Báo Cáo Bếp Mian</h2>
        <button onClick={handleExportPDF} className="size-10 bg-primary/10 text-primary flex items-center justify-center rounded-full active:scale-95 transition-all"><span className="material-symbols-outlined">picture_as_pdf</span></button>
      </header>

      <div className="p-4 flex flex-col gap-6 max-w-md mx-auto print:max-w-none">
        <div className="text-center mb-4 print:mb-10">
          <h1 className="text-2xl font-black text-text-main dark:text-white mb-1">Báo Cáo Kết Quả</h1>
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">THỜI GIAN: THÁNG {selectedMonth}/{selectedYear}</p>
        </div>

        <div className="flex gap-2 print:hidden">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="flex-1 h-12 bg-white dark:bg-zinc-900 border-none rounded-2xl px-4 font-bold text-xs shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all">
            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="flex-1 h-12 bg-white dark:bg-zinc-900 border-none rounded-2xl px-4 font-bold text-xs shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="2024">Năm 2024</option>
            <option value="2025">Năm 2025</option>
            <option value="2026">Năm 2026</option>
          </select>
        </div>

        <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-soft border dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">DOANH THU THỰC TẾ</h3>
            <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/5 rounded uppercase">VNĐ</span>
          </div>
          <p className="text-4xl font-black mb-10 dark:text-white">{actualRevenue.toLocaleString()}đ</p>
          
          <div className="h-32 flex items-end justify-between gap-1.5 px-1 relative">
            {chartData.map((val, i) => {
              const isCurrentMonth = (i + 1).toString().padStart(2, '0') === selectedMonth;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${isCurrentMonth ? 'bg-primary shadow-[0_-4px_12px_rgba(238,140,43,0.3)]' : 'bg-primary/15 group-hover:bg-primary/40'}`} 
                    style={{ height: `${Math.max(val, 5)}%` }} 
                  />
                  <span className={`text-[7px] font-black ${isCurrentMonth ? 'text-primary' : 'text-text-secondary opacity-60'}`}>{i + 1}</span>
                  {isCurrentMonth && (
                    <div className="absolute -top-6 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded pointer-events-none">
                      Focus
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-soft border dark:border-zinc-800 overflow-hidden print:shadow-none print:border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">KHÁCH HÀNG TRUNG THÀNH</h3>
            <div className="flex gap-1 print:hidden">
              <button onClick={() => setSortKey('orderCount')} className={`px-3 py-1.5 text-[8px] font-bold rounded-lg transition-all ${sortKey === 'orderCount' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}>SỐ LẦN</button>
              <button onClick={() => setSortKey('totalSpent')} className={`px-3 py-1.5 text-[8px] font-bold rounded-lg transition-all ${sortKey === 'totalSpent' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}>DOANH THU</button>
            </div>
          </div>
          <div className="space-y-3">
            {loyalCustomers.length > 0 ? loyalCustomers.map((cust, idx) => (
              <div key={cust.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-[20px] border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <span className="size-8 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full font-black text-primary text-[10px] shadow-sm border dark:border-zinc-800">{idx + 1}</span>
                  <div>
                    <p className="text-xs font-bold dark:text-white">{cust.name}</p>
                    <p className="text-[9px] text-text-secondary font-black uppercase tracking-tighter">{cust.orderCount} lần đặt hàng</p>
                  </div>
                </div>
                <span className="text-sm font-black text-primary">{cust.totalSpent.toLocaleString()}đ</span>
              </div>
            )) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-gray-200">person_search</span>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Chưa có dữ liệu tháng này</p>
              </div>
            )}
          </div>
        </section>

        <div className="print:block hidden mt-10 pt-10 border-t border-dashed border-gray-300">
          <h4 className="text-sm font-black uppercase mb-4 tracking-widest">Xác nhận báo cáo</h4>
          <div className="flex justify-between items-start mt-8">
            <div className="text-center">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Người lập biểu</p>
              <div className="h-20" />
              <div className="w-32 h-px bg-black/20 mx-auto" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Kế toán trưởng</p>
              <div className="h-20" />
              <div className="w-32 h-px bg-black/20 mx-auto" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Chủ tiệm ký tên</p>
              <div className="h-20" />
              <p className="text-sm font-black text-primary">Bếp Bánh Mian</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:max-w-none { max-width: 100% !important; }
          .bg-gray-50 { background-color: transparent !important; border: 1px solid #eee; }
          header, nav, button, select { display: none !important; }
          .p-4 { padding: 0 !important; }
          .bg-white { box-shadow: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default AdminReports;
