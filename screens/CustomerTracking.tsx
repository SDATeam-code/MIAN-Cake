
import React from 'react';
import { CustomerScreen, Order } from '../types';

interface Props {
  onNavigate: (s: CustomerScreen) => void;
  orders: Order[];
}

const CustomerTracking: React.FC<Props> = ({ onNavigate, orders }) => {
  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'BAKING': return { label: 'Đang chuẩn bị nguyên liệu', icon: 'skillet', color: 'text-orange-500' };
      case 'ROASTING': return { label: 'Bánh đang trong lò nướng', icon: 'bakery_dining', color: 'text-primary' };
      case 'DELIVERING': return { label: 'Shipper đang giao bánh', icon: 'moped', color: 'text-grab-green' };
      case 'COMPLETED': return { label: 'Giao hàng thành công', icon: 'verified', color: 'text-zinc-900' };
      default: return { label: 'Đã nhận đơn', icon: 'receipt', color: 'text-text-secondary' };
    }
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen relative">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center">
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center text-lg font-bold pr-10">Tiến độ bánh nướng</h2>
      </header>

      <div className="p-4 flex flex-col gap-6">
        {orders.map(order => {
          const status = getStatusDisplay(order.status);
          return (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-soft border border-black/5 overflow-hidden">
              <div className={`p-4 flex items-center justify-between border-b dark:border-zinc-800 bg-primary-light/30`}>
                <div className={`flex items-center gap-3 text-xs font-black uppercase ${status.color}`}>
                  <span className="material-symbols-outlined animate-pulse text-[20px]">{status.icon}</span>
                  {status.label}
                </div>
                <span className="text-[10px] font-black text-text-secondary">{order.id}</span>
              </div>
              
              <div className="p-5">
                <div className="flex gap-4 mb-6">
                  <div className="size-20 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <img src={order.productImage} className="w-full h-full object-cover" alt={order.productName} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight">{order.productName}</h4>
                    <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-wider">{order.quantity} chiếc • {order.price.toLocaleString()}đ</p>
                    <div className="mt-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                      <span className="text-[10px] text-text-secondary font-medium truncate max-w-[150px]">{order.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => onNavigate(CustomerScreen.CHAT)} 
                    className="w-full h-12 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Nhắn cho Bếp
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center">
            <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-gray-200 text-5xl">cake</span>
            </div>
            <h3 className="text-lg font-black text-text-main">Chưa có lò nào đang nướng!</h3>
            <p className="text-xs text-text-secondary mt-1">Chị đặt mẻ bánh đầu tiên ngay nhé.</p>
            <button onClick={() => onNavigate(CustomerScreen.HOME)} className="mt-8 bg-primary text-white px-8 h-12 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Menu hôm nay</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTracking;
