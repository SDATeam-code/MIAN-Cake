
import React, { useState } from 'react';
import { AdminScreen, Product, Order } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  onLogout: () => void;
  newOrderCount: number;
  products: Product[];
  orders: Order[];
  batchProductIds: string[];
  setBatchProductIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminDashboard: React.FC<Props> = ({ 
  onNavigate, 
  onLogout, 
  newOrderCount, 
  products, 
  orders, 
  batchProductIds, 
  setBatchProductIds 
}) => {
  const [showBatchPicker, setShowBatchPicker] = useState(false);

  const toggleBatchProduct = (id: string) => {
    setBatchProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Tính toán số lượng đơn thực tế cho mỗi sản phẩm đang gom
  const getBatchData = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    
    // Đếm tổng số lượng (quantity) trong các đơn hàng chưa hoàn tất hoặc đã hoàn tất liên quan đến sản phẩm này
    const currentQty = orders
      .filter(o => o.productName === product.name)
      .reduce((sum, o) => sum + o.quantity, 0);

    return {
      product,
      currentQty,
      targetQty: 10 // Giả định mục tiêu là 10 chiếc để nướng một mẻ
    };
  };

  return (
    <div className="pb-24 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="px-5 py-6 flex items-center justify-between">
        <div>
          <span className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">Hệ thống quản trị</span>
          <h1 className="text-2xl font-black text-text-main dark:text-white">Bếp bánh Mian</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate(AdminScreen.SETTINGS)} className="size-11 bg-white dark:bg-zinc-800 rounded-2xl border dark:border-zinc-700 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-2xl">settings_suggest</span>
          </button>
          <button onClick={onLogout} className="size-11 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="px-5 flex flex-col gap-4">
        <div 
          onClick={() => onNavigate(AdminScreen.REPORTS)}
          className="bg-primary p-7 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Doanh Thu Dự Kiến (2025)</p>
            <span className="material-symbols-outlined text-3xl opacity-50">auto_graph</span>
          </div>
          <p className="text-4xl font-black">124.800k</p>
          <p className="text-[10px] mt-4 font-bold bg-white/20 w-max px-3 py-1 rounded-full">+22.5% so với năm trước</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-soft text-left border dark:border-zinc-800 relative active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary bg-primary/10 size-12 flex items-center justify-center rounded-2xl mb-4">receipt_long</span>
            <p className="text-3xl font-black">{newOrderCount}</p>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Đơn đợi duyệt</p>
            {newOrderCount > 0 && <span className="absolute top-4 right-4 size-3 bg-red-500 rounded-full animate-ping" />}
          </button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-soft text-left border dark:border-zinc-800 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-zinc-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 size-12 flex items-center justify-center rounded-2xl mb-4">inventory_2</span>
            <p className="text-3xl font-black">{products.length}</p>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Loại bánh bán</p>
          </button>
        </div>
      </section>

      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight">Mẻ Bánh Gom Đơn</h2>
        <button 
          onClick={() => setShowBatchPicker(true)}
          className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/20"
        >
          THAY ĐỔI
        </button>
      </div>

      <div className="px-5 space-y-4">
        {batchProductIds.map(pId => {
          const data = getBatchData(pId);
          if (!data) return null;
          const progress = Math.min(100, (data.currentQty / data.targetQty) * 100);
          
          return (
            <article key={pId} className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-soft overflow-hidden border dark:border-zinc-800">
              <div className="flex p-5 gap-4">
                <img src={data.product.image} className="size-20 rounded-2xl object-cover" alt={data.product.name} />
                <div className="flex-1">
                  <h3 className="text-base font-bold">{data.product.name}</h3>
                  <div className="mt-3">
                     <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                     </div>
                     <div className="flex justify-between mt-2">
                        <span className="text-[9px] font-black text-text-secondary uppercase">Tiến độ</span>
                        <span className="text-[9px] font-black text-primary">{data.currentQty} / {data.targetQty} CHIẾC</span>
                     </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onNavigate(AdminScreen.AI_SALES)}
                className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-primary-dark transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                AI: TÌM KHÁCH MỚI CHO MẺ NÀY
              </button>
            </article>
          );
        })}

        {batchProductIds.length === 0 && (
          <div className="py-10 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-[32px]">
            <p className="text-xs font-bold text-text-secondary">Chưa có mẻ bánh nào đang gom đơn</p>
            <button onClick={() => setShowBatchPicker(true)} className="mt-3 text-primary font-black text-[10px] uppercase">Chọn ngay</button>
          </div>
        )}
      </div>

      {/* Picker Modal */}
      {showBatchPicker && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Chọn Bánh Gom Đơn</h3>
              <button onClick={() => setShowBatchPicker(false)} className="size-10 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-10">
              {products.map(p => {
                const isActive = batchProductIds.includes(p.id);
                return (
                  <button 
                    key={p.id} 
                    onClick={() => toggleBatchProduct(p.id)}
                    className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-zinc-800'}`}
                  >
                    <img src={p.image} className="size-12 rounded-xl object-cover" />
                    <span className={`flex-1 text-left font-bold text-sm ${isActive ? 'text-primary' : ''}`}>{p.name}</span>
                    {isActive && <span className="material-symbols-outlined text-primary material-symbols-filled">check_circle</span>}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setShowBatchPicker(false)}
              className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl"
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined material-symbols-filled">home</span>
            <span className="text-[10px] font-bold">Trang Chủ</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-[10px] font-medium">Đơn Hàng</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">cake</span>
            <span className="text-[10px] font-medium">Sản Phẩm</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.REPORTS)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-[10px] font-medium">Báo Cáo</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
