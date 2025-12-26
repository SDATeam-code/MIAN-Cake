
import React, { useState } from 'react';
import { CustomerScreen, Order } from '../types';

interface Props {
  onNavigate: (s: CustomerScreen) => void;
  orders: Order[];
}

const CustomerTracking: React.FC<Props> = ({ onNavigate, orders }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
          const firstItem = order.items[0];
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
                <div className="flex gap-4 mb-6 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <div className="size-20 rounded-[20px] overflow-hidden shadow-sm shrink-0">
                    <img src={firstItem?.productImage} className="w-full h-full object-cover" alt={firstItem?.productName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm leading-tight truncate">
                      {order.items.length > 1 ? `${order.items[0].productName} và ${order.items.length - 1} món khác` : order.items[0].productName}
                    </h4>
                    <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-wider">
                      Tổng {order.items.reduce((s, i) => s + i.quantity, 0)} chiếc • {order.totalPrice.toLocaleString()}đ
                    </p>
                    <div className="mt-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                      <span className="text-[10px] text-text-secondary font-medium truncate max-w-[150px]">{order.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedOrder(order)} 
                    className="flex-1 h-12 bg-gray-100 text-text-main rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Chi tiết
                  </button>
                  <button 
                    onClick={() => onNavigate(CustomerScreen.CHAT)} 
                    className="flex-1 h-12 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                  >
                    Nhắn Bếp
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

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Chi tiết đơn {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <section className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-3xl space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <div>
                    <p className="text-[10px] font-black uppercase text-text-secondary">Người nhận</p>
                    <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                  <div>
                    <p className="text-[10px] font-black uppercase text-text-secondary">Địa chỉ giao</p>
                    <p className="font-bold text-sm leading-relaxed">{selectedOrder.address}</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4 px-2">Danh sách bánh</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-3 rounded-2xl shadow-sm">
                      <img src={item.productImage} className="size-12 rounded-xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.productName}</p>
                        <p className="text-[10px] font-bold text-text-secondary uppercase">SL: {item.quantity} x {item.price.toLocaleString()}đ</p>
                      </div>
                      <p className="font-black text-sm text-primary">{(item.price * item.quantity).toLocaleString()}đ</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] font-black uppercase text-text-secondary">Tiền bánh</p>
                  <p className="text-xs font-bold">{selectedOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}đ</p>
                </div>
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] font-black uppercase text-text-secondary">Phí giao hàng (Ship)</p>
                  <p className="text-xs font-bold">{(selectedOrder.shippingFee || 0).toLocaleString()}đ</p>
                </div>
                <div className="flex justify-between items-center pt-2 px-2">
                  <p className="text-xs font-black uppercase text-text-secondary">Tổng thanh toán</p>
                  <p className="text-2xl font-black text-primary">{selectedOrder.totalPrice.toLocaleString()}đ</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 bg-orange-50 dark:bg-zinc-800/50 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Ghi chú của chị</p>
                  <p className="text-xs italic text-orange-800 dark:text-orange-200">"{selectedOrder.notes}"</p>
                </div>
              )}
            </div>

            <button onClick={() => setSelectedOrder(null)} className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold mt-8">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTracking;
