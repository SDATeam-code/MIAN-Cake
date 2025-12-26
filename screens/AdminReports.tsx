
import React, { useState, useMemo, useEffect } from 'react';
import { AdminScreen, Order, ChatMessage } from '../types';
import { generateChatInsights } from '../geminiService';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  orders: Order[];
  messages: ChatMessage[];
}

const AdminReports: React.FC<Props> = ({ onNavigate, orders, messages }) => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([(new Date().getMonth() + 1).toString().padStart(2, '0')]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const monthsList = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  const toggleMonth = (m: string) => {
    setSelectedMonths(prev => 
      prev.includes(m) ? (prev.length > 1 ? prev.filter(x => x !== m) : prev) : [...prev, m]
    );
  };

  const currentPeriodOrders = useMemo(() => orders.filter(o => {
    const d = new Date(o.date);
    return selectedMonths.includes((d.getMonth() + 1).toString().padStart(2, '0')) && d.getFullYear().toString() === selectedYear;
  }), [orders, selectedMonths, selectedYear]);

  // Logic so sánh: Tính toán cùng số lượng tháng nhưng của năm trước hoặc kỳ trước
  const stats = useMemo(() => {
    const shipping = currentPeriodOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
    const total = currentPeriodOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const cakes = total - shipping;

    // So sánh kỳ trước (ví dụ chọn T2 thì so với T1)
    const prevMonths = selectedMonths.map(m => {
        let prevM = parseInt(m) - selectedMonths.length;
        if (prevM <= 0) prevM += 12;
        return prevM.toString().padStart(2, '0');
    });
    
    const prevPeriodOrders = orders.filter(o => {
        const d = new Date(o.date);
        return prevMonths.includes((d.getMonth() + 1).toString().padStart(2, '0')) && d.getFullYear().toString() === selectedYear;
    });
    const prevTotal = prevPeriodOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // So sánh cùng kỳ năm ngoái
    const lastYearOrders = orders.filter(o => {
        const d = new Date(o.date);
        return selectedMonths.includes((d.getMonth() + 1).toString().padStart(2, '0')) && d.getFullYear().toString() === (parseInt(selectedYear) - 1).toString();
    });
    const lastYearTotal = lastYearOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const growthPrev = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
    const growthYear = lastYearTotal > 0 ? ((total - lastYearTotal) / lastYearTotal) * 100 : 0;

    return { total, cakes, shipping, growthPrev, growthYear };
  }, [currentPeriodOrders, orders, selectedMonths, selectedYear]);

  const productRanking = useMemo(() => {
    const pMap = new Map<string, number>();
    currentPeriodOrders.forEach(o => {
      o.items.forEach(item => {
        const val = pMap.get(item.productName) || 0;
        pMap.set(item.productName, val + (item.price * item.quantity));
      });
    });
    return Array.from(pMap.entries())
      .map(([name, revenue]) => ({ name, revenue, portion: (revenue / (stats.cakes || 1)) * 100 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [currentPeriodOrders, stats.cakes]);

  const loyalCustomers = useMemo(() => {
    const map = new Map<string, { totalSpent: number; orderCount: number }>();
    currentPeriodOrders.forEach(o => {
      const d = map.get(o.customerName) || { totalSpent: 0, orderCount: 0 };
      map.set(o.customerName, { totalSpent: d.totalSpent + o.totalPrice, orderCount: d.orderCount + 1 });
    });
    return Array.from(map.entries())
      .map(([n, d]) => ({ id: n, name: n, ...d, portion: (d.totalSpent / (stats.total || 1)) * 100 }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [currentPeriodOrders, stats.total]);

  const handleFetchInsights = async () => {
    setLoadingAi(true);
    const result = await generateChatInsights(messages.filter(m => {
        const d = new Date(m.timestamp);
        return selectedMonths.includes((d.getMonth() + 1).toString().padStart(2, '0')) && d.getFullYear().toString() === selectedYear;
    }));
    setAiInsight(result);
    setLoadingAi(false);
  };

  useEffect(() => {
    handleFetchInsights();
  }, [selectedMonths, selectedYear]);

  // Thành phần vẽ Pie Chart 3D mô phỏng
  const PieCake3D = () => {
    const total = stats.total || 1;
    const cakePortion = (stats.cakes / total) * 100;
    const shipPortion = (stats.shipping / total) * 100;
    
    // Đơn giản hóa: Vẽ SVG Circle với dasharray
    const radius = 60;
    const circ = 2 * Math.PI * radius;
    const cakeStroke = (cakePortion / 100) * circ;
    
    return (
      <div className="relative size-48 mx-auto flex items-center justify-center">
        {/* Layer bóng đổ 3D */}
        <div className="absolute inset-2 rounded-full bg-black/10 blur-xl translate-y-4" />
        
        <svg viewBox="0 0 160 160" className="rotate-[-90deg] drop-shadow-2xl">
          {/* Background / Shipping */}
          <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#00B14F" strokeWidth="28" />
          {/* Cake Portion */}
          <circle 
            cx="80" cy="80" r={radius} fill="transparent" 
            stroke="#ee8c2b" strokeWidth="32" 
            strokeDasharray={`${cakeStroke} ${circ}`} 
            className="transition-all duration-1000"
          />
          {/* Middle decoration */}
          <circle cx="80" cy="80" r="40" fill="white" className="opacity-10" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-[10px] font-black text-primary uppercase">Cơ cấu</span>
           <span className="text-xl font-black">{Math.round(cakePortion)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-50 bg-white p-4 border-b flex justify-between items-center">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Báo Cáo Hoạt Động</h2>
        <button onClick={() => window.print()} className="size-10 bg-primary/10 text-primary flex items-center justify-center rounded-full active:scale-95">
          <span className="material-symbols-outlined">print</span>
        </button>
      </header>

      <div className="p-4 flex flex-col gap-6 max-w-md mx-auto">
        {/* Bộ lọc Multi-Month */}
        <section className="bg-white rounded-[32px] p-6 shadow-soft border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Chọn giai đoạn</h3>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)} 
              className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-1.5 focus:ring-primary"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {monthsList.map(m => (
              <button 
                key={m} 
                onClick={() => toggleMonth(m)}
                className={`h-9 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedMonths.includes(m) ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 text-text-secondary border-transparent'}`}
              >
                T{m}
              </button>
            ))}
          </div>
        </section>

        {/* Tổng doanh thu & So sánh */}
        <section className="bg-primary p-7 rounded-[40px] text-white shadow-2xl shadow-primary/30">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Tổng doanh thu kỳ này</p>
            <span className="material-symbols-outlined opacity-50">analytics</span>
          </div>
          <p className="text-4xl font-black">{stats.total.toLocaleString()}đ</p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 p-3 rounded-2xl">
              <p className="text-[8px] font-bold opacity-60 uppercase">So với kỳ trước</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">{stats.growthPrev >= 0 ? 'trending_up' : 'trending_down'}</span>
                <span className="text-sm font-black">{stats.growthPrev.toFixed(1)}%</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <p className="text-[8px] font-bold opacity-60 uppercase">So với năm ngoái</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">{stats.growthYear >= 0 ? 'trending_up' : 'trending_down'}</span>
                <span className="text-sm font-black">{stats.growthYear.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Pie Cake Chart */}
        <section className="bg-white rounded-[32px] p-8 shadow-soft border flex flex-col items-center">
          <h3 className="text-[10px] font-black text-text-secondary uppercase mb-8 tracking-widest">Cơ cấu Doanh thu & Phí Ship</h3>
          <PieCake3D />
          <div className="grid grid-cols-2 gap-8 w-full mt-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-text-secondary uppercase">Tiền bánh</span>
              </div>
              <p className="text-sm font-black">{stats.cakes.toLocaleString()}đ</p>
              <p className="text-[10px] text-primary font-bold">{((stats.cakes / (stats.total || 1)) * 100).toFixed(1)}%</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="size-2 rounded-full bg-grab-green" />
                <span className="text-[10px] font-black text-text-secondary uppercase">Phí ship</span>
              </div>
              <p className="text-sm font-black">{stats.shipping.toLocaleString()}đ</p>
              <p className="text-[10px] text-grab-green font-bold">{((stats.shipping / (stats.total || 1)) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </section>

        {/* Xếp hạng loại bánh */}
        <section className="bg-white rounded-[32px] p-6 shadow-soft border overflow-hidden">
          <h3 className="text-[10px] font-black text-text-secondary uppercase mb-4 tracking-widest px-1">Top bánh bán chạy</h3>
          <div className="space-y-3">
            {productRanking.map((p, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    <p className="text-xs font-black">{p.revenue.toLocaleString()}đ</p>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${p.portion}%` }} 
                    />
                  </div>
                  <p className="text-[9px] text-text-secondary font-black mt-1 uppercase">Đóng góp {p.portion.toFixed(1)}% doanh số bánh</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Khách hàng tiêu biểu */}
        <section className="bg-white rounded-[32px] p-6 shadow-soft border">
          <h3 className="text-[10px] font-black text-text-secondary uppercase mb-4 tracking-widest px-1">Khách hàng đóng góp lớn</h3>
          <div className="space-y-3">
            {loyalCustomers.map((c, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl hover:bg-primary-light transition-colors">
                <div>
                  <p className="text-xs font-bold">{c.name}</p>
                  <p className="text-[9px] text-text-secondary font-medium">{c.orderCount} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary">{c.totalSpent.toLocaleString()}đ</p>
                  <p className="text-[10px] font-black text-primary/60">{c.portion.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Insight Section */}
        <section className="bg-zinc-900 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute -top-10 -right-10 size-40 bg-primary/20 blur-[60px]" />
           <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-[32px] material-symbols-filled">psychology</span>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Phân tích chuyên sâu (AI)</h3>
           </div>
           
           {loadingAi ? (
             <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-white/10 rounded-full w-3/4" />
                <div className="h-4 bg-white/10 rounded-full w-1/2" />
                <div className="h-20 bg-white/10 rounded-3xl" />
             </div>
           ) : (
             <div className="space-y-6">
                <p className="text-sm leading-relaxed font-medium text-white/90">
                  {aiInsight || "Chị chọn giai đoạn để AI bắt đầu phân tích nhé!"}
                </p>
                <div className="pt-6 border-t border-white/10">
                   <p className="text-[10px] font-black uppercase text-primary mb-2">Gợi ý hành động:</p>
                   <p className="text-xs italic text-white/60">"Dựa trên tỷ lệ ship cao ở các khách hàng đóng góp thấp, chị có thể cân nhắc chương trình miễn phí ship cho đơn trên 300k để tối ưu lợi nhuận."</p>
                </div>
             </div>
           )}
        </section>
      </div>
    </div>
  );
};

export default AdminReports;
