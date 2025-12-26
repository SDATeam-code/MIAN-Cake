
import React, { useState, useMemo } from 'react';
import { AdminScreen, Product, Order, ChatMessage } from '../types';
import { getCustomerMatches, generateSMSInvite } from '../geminiService';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  onLogout: () => void;
  products: Product[];
  orders: Order[];
  batchProductIds: string[];
  setBatchProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  messages: ChatMessage[];
}

const AdminDashboard: React.FC<Props> = ({ 
  onNavigate, 
  onLogout, 
  products, 
  orders, 
  batchProductIds, 
  setBatchProductIds,
  messages
}) => {
  const [showBatchPicker, setShowBatchPicker] = useState(false);
  const [showAIOutreach, setShowAIOutreach] = useState<{ productId: string, matches: any[] } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const revenueStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthOrders = orders.filter(o => {
      const d = new Date(o.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const shipping = currentMonthOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
    const total = currentMonthOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const cakes = total - shipping;

    return { total, cakes, shipping };
  }, [orders]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter(m => m.senderId !== 'admin' && !m.isRead).length;
  }, [messages]);

  const toggleBatchProduct = (id: string) => {
    setBatchProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const getBatchData = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    const currentQty = orders.reduce((sum, o) => 
      sum + o.items.filter(item => item.productName === product.name).reduce((s, i) => s + i.quantity, 0), 
      0
    );
    return { product, currentQty, targetQty: product.targetQty || 10 };
  };

  const handleOpenAIOutreach = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setLoadingAI(true);
    const matches = await getCustomerMatches(product, orders);
    setShowAIOutreach({ productId, matches });
    setLoadingAI(false);
  };

  const handleInvite = async (phone: string, customerName: string, productName: string) => {
    const text = await generateSMSInvite(customerName, productName);
    window.location.href = `sms:${phone}?body=${encodeURIComponent(text)}`;
  };

  return (
    <div className="pb-24 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="px-5 py-6 flex items-center justify-between">
        <div>
          <span className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">Hệ thống quản trị</span>
          <h1 className="text-2xl font-black text-text-main dark:text-white">Bếp bánh Mian</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(AdminScreen.CHAT_LIST)}
            className="size-11 bg-white dark:bg-zinc-800 rounded-2xl border dark:border-zinc-700 flex items-center justify-center shadow-sm relative"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button onClick={() => onNavigate(AdminScreen.SETTINGS)} className="size-11 bg-white dark:bg-zinc-800 rounded-2xl border dark:border-zinc-700 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-2xl">settings</span>
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
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Doanh Thu Tháng {new Date().getMonth() + 1}</p>
            <span className="material-symbols-outlined text-3xl opacity-50">trending_up</span>
          </div>
          <p className="text-4xl font-black">{revenueStats.total.toLocaleString()}đ</p>
          <div className="flex gap-3 mt-4">
            <div className="bg-white/20 px-3 py-1.5 rounded-2xl">
              <p className="text-[8px] font-black uppercase opacity-60">Tiền bánh</p>
              <p className="text-xs font-black">{revenueStats.cakes.toLocaleString()}đ</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-2xl">
              <p className="text-[8px] font-black uppercase opacity-60">Phí ship</p>
              <p className="text-xs font-black">{revenueStats.shipping.toLocaleString()}đ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-soft text-left border dark:border-zinc-800 relative active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary bg-primary/10 size-12 flex items-center justify-center rounded-2xl mb-4">receipt_long</span>
            <p className="text-3xl font-black">{orders.filter(o => o.status === 'PENDING').length}</p>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Đơn đợi duyệt</p>
          </button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-soft text-left border dark:border-zinc-800 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-zinc-600 bg-gray-100 size-12 flex items-center justify-center rounded-2xl mb-4">cake</span>
            <p className="text-3xl font-black">{products.length}</p>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Sản phẩm</p>
          </button>
        </div>
      </section>

      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight">Mẻ Bánh Gom Đơn</h2>
        <button onClick={() => setShowBatchPicker(true)} className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/20">THAY ĐỔI</button>
      </div>

      <div className="px-5 space-y-4">
        {batchProductIds.map(pId => {
          const data = getBatchData(pId);
          if (!data) return null;
          const progress = Math.min(100, (data.currentQty / data.targetQty) * 100);
          return (
            <article key={pId} className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-soft overflow-hidden border dark:border-zinc-800 p-5">
              <div className="flex gap-4">
                <img src={data.product.image} className="size-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold">{data.product.name}</h3>
                    <button 
                      onClick={() => handleOpenAIOutreach(pId)}
                      disabled={loadingAI}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg active:scale-95 transition-all"
                    >
                      <span className={`material-symbols-outlined text-sm ${loadingAI ? 'animate-spin' : ''}`}>psychology</span>
                      <span className="text-[9px] font-black uppercase">Tư vấn mời khách</span>
                    </button>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[8px] font-black text-text-secondary">
                    <span>{progress.toFixed(0)}%</span>
                    <span>{data.currentQty}/{data.targetQty} CÁI</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {showAIOutreach && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black">Khách hàng tiềm năng</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase">Ưu tiên khách thân thiết chưa mua 1 tuần nay</p>
              </div>
              <button onClick={() => setShowAIOutreach(null)} className="size-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {showAIOutreach.matches.map((match: any) => {
                const customerOrder = orders.find(o => o.customerPhone === match.phone);
                return (
                  <div key={match.phone} className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-3xl border dark:border-zinc-700">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold">{customerOrder?.customerName || 'Khách quen'}</h4>
                       <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-black">{match.matchScore}% HỢP</span>
                    </div>
                    <p className="text-xs text-text-secondary italic mb-4">"{match.reason}"</p>
                    <button 
                      onClick={() => handleInvite(match.phone, customerOrder?.customerName || 'Chị', products.find(p => p.id === showAIOutreach.productId)?.name || 'Bánh')}
                      className="w-full h-11 bg-white dark:bg-zinc-900 border border-primary text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">sms</span>
                      Gửi SMS mời khách
                    </button>
                  </div>
                );
              })}
              {showAIOutreach.matches.length === 0 && (
                <div className="py-12 text-center text-text-secondary">
                  <span className="material-symbols-outlined text-4xl opacity-20">person_search</span>
                  <p className="text-xs font-bold mt-2">Chưa tìm thấy khách phù hợp chị ơi!</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowAIOutreach(null)} className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold">Xong rồi</button>
          </div>
        </div>
      )}

      {showBatchPicker && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] p-6 max-h-[70vh] overflow-y-auto">
             <h3 className="text-xl font-black mb-6">Chọn bánh gom đơn</h3>
             <div className="space-y-2 mb-8">
               {products.map(p => (
                 <button key={p.id} onClick={() => toggleBatchProduct(p.id)} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 ${batchProductIds.includes(p.id) ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50'}`}>
                    <img src={p.image} className="size-10 rounded-lg object-cover" />
                    <span className="font-bold text-sm">{p.name}</span>
                 </button>
               ))}
             </div>
             <button onClick={() => setShowBatchPicker(false)} className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold">Đóng</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-primary"><span className="material-symbols-outlined material-symbols-filled">home</span><span className="text-[10px] font-bold">Trang Chủ</span></button>
          <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="flex flex-col items-center gap-1 text-text-secondary"><span className="material-symbols-outlined">receipt_long</span><span className="text-[10px] font-medium">Đơn Hàng</span></button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="flex flex-col items-center gap-1 text-text-secondary"><span className="material-symbols-outlined">cake</span><span className="text-[10px] font-medium">Sản Phẩm</span></button>
          <button onClick={() => onNavigate(AdminScreen.REPORTS)} className="flex flex-col items-center gap-1 text-text-secondary"><span className="material-symbols-outlined">bar_chart</span><span className="text-[10px] font-medium">Báo Cáo</span></button>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
