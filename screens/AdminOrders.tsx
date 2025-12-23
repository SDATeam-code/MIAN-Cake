
import React from 'react';
import { AdminScreen, Order } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminOrders: React.FC<Props> = ({ onNavigate, orders, setOrders }) => {
  const updateStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="pb-32 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
          <h1 className="text-lg font-bold">Quản Lý Đơn Hàng</h1>
          <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{orders.length} ĐƠN</span>
        </div>
      </header>

      <div className="px-4 flex flex-col gap-4 mt-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-[32px] border dark:border-zinc-800 p-5 shadow-soft">
            <div className="flex gap-4">
              <div className="size-20 rounded-[20px] overflow-hidden shrink-0 shadow-sm">
                <img src={order.productImage} className="w-full h-full object-cover" alt={order.productName} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm truncate pr-2">{order.productName}</h4>
                  <span className="text-[10px] font-black text-primary/60 shrink-0">{order.id}</span>
                </div>
                <p className="text-xs mt-1 font-medium text-text-main">Khách: <span className="font-black">{order.customerName}</span></p>
                <p className="text-[10px] text-text-secondary italic line-clamp-1 mt-1">{order.address}</p>
                <div className="flex justify-between mt-4 items-center">
                  <span className="text-sm font-black text-primary">{(order.price * order.quantity).toLocaleString()}đ</span>
                  <div className="relative group">
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as any)}
                      className="text-[10px] font-black bg-orange-50 border border-orange-200 text-orange-600 rounded-xl px-4 py-2 appearance-none outline-none focus:ring-2 focus:ring-orange-200"
                    >
                      <option value="BAKING">ĐANG LÀM</option>
                      <option value="ROASTING">ĐANG NƯỚNG</option>
                      <option value="DELIVERING">ĐANG GIAO</option>
                      <option value="COMPLETED">HOÀN TẤT</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center opacity-40">
            <span className="material-symbols-outlined text-6xl">shopping_bag</span>
            <p className="mt-4 font-bold">Bếp đang trống đơn hàng</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => onNavigate(AdminScreen.ADD_ORDER_MANUAL)}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-3 bg-zinc-900 text-white h-14 pl-5 pr-6 rounded-full shadow-2xl active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
        <span className="font-bold text-sm">Đơn tại quầy</span>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-medium">Trang Chủ</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined material-symbols-filled">receipt_long</span>
            <span className="text-[10px] font-bold">Đơn Hàng</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">cake</span>
            <span className="text-[10px] font-medium">Sản Phẩm</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.REPORTS)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-[10px] font-medium">Báo Cáo</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminOrders;
