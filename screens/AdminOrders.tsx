
import React, { useState } from 'react';
import { AdminScreen, Order } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onOpenChat: (customerPhone: string) => void;
}

const AdminOrders: React.FC<Props> = ({ onNavigate, orders, setOrders, onOpenChat }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const updateShippingFee = (orderId: string, fee: string) => {
    const numericFee = parseInt(fee) || 0;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const subtotal = o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { ...o, shippingFee: numericFee, totalPrice: subtotal + numericFee };
      }
      return o;
    }));
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => {
        if (!prev) return null;
        const subtotal = prev.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { ...prev, shippingFee: numericFee, totalPrice: subtotal + numericFee };
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy địa chỉ: ' + text);
  };

  const handleShipViaGrab = (address: string) => {
    navigator.clipboard.writeText(address);
    window.location.href = 'grab://';
    alert('Đã copy địa chỉ! Đang mở Grab để chị dán vào ạ.');
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
                <img src={order.items[0]?.productImage} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm truncate pr-2">
                    {order.items.length > 1 ? `${order.items[0].productName} (+${order.items.length - 1})` : order.items[0].productName}
                  </h4>
                  <div className="flex gap-1">
                    <button onClick={() => order.customerPhone && onOpenChat(order.customerPhone)} className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-90"><span className="material-symbols-outlined text-[18px]">chat</span></button>
                    <button onClick={() => setSelectedOrder(order)} className="size-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">info</span></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-medium text-text-main dark:text-zinc-400">Khách: <span className="font-black">{order.customerName}</span></p>
                  <button onClick={() => copyToClipboard(order.address)} className="size-6 flex items-center justify-center text-primary/60 active:scale-90">
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
                
                <div className="flex justify-between mt-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-primary">{order.totalPrice.toLocaleString()}đ</span>
                    {order.shippingFee ? <span className="text-[9px] text-text-secondary">Gồm {order.shippingFee.toLocaleString()}đ ship</span> : null}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'COMPLETED' && (
                      <button 
                        onClick={() => handleShipViaGrab(order.address)}
                        className="h-8 px-3 bg-[#00B14F] text-white rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">moped</span>
                        <span className="text-[10px] font-black uppercase">Grab</span>
                      </button>
                    )}
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as any)}
                      className="text-[10px] font-black bg-orange-50 dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 text-orange-600 rounded-xl px-3 py-1.5"
                    >
                      <option value="PENDING">CHỜ DUYỆT</option>
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
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Chi tiết đơn hàng</h3>
              <button onClick={() => setSelectedOrder(null)} className="size-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <section className="bg-primary-light/30 dark:bg-zinc-800 p-4 rounded-3xl border border-primary/10">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold">Khách hàng:</span>
                  <span className="text-xs font-black">{selectedOrder.customerName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Địa chỉ:</span>
                    <button onClick={() => copyToClipboard(selectedOrder.address)} className="flex items-center gap-1 text-[10px] font-black text-primary uppercase">
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <span className="text-xs font-medium leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-700">{selectedOrder.address}</span>
                </div>
              </section>

              <section className="bg-orange-50 dark:bg-zinc-800 p-4 rounded-2xl border border-orange-100 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600">Phí giao hàng (Ship)</h4>
                   <span className="material-symbols-outlined text-orange-600 text-sm">local_shipping</span>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={selectedOrder.shippingFee || ''} 
                    onChange={(e) => updateShippingFee(selectedOrder.id, e.target.value)}
                    placeholder="Nhập phí ship..."
                    className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-orange-200 dark:border-orange-900/30 rounded-xl px-4 text-sm font-black text-primary outline-none focus:border-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-secondary">VNĐ</span>
                </div>
                <p className="text-[9px] text-text-secondary mt-2 italic">* Phí này sẽ được cộng trực tiếp vào tổng đơn hàng.</p>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4 px-2">Chi tiết sản phẩm</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl">
                      <img src={item.productImage} className="size-10 rounded-lg object-cover" alt="" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">{item.productName}</p>
                        <p className="text-[10px] font-medium text-text-secondary">{item.quantity} x {item.price.toLocaleString()}đ</p>
                      </div>
                      <p className="text-xs font-black">{(item.quantity * item.price).toLocaleString()}đ</p>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-zinc-900 text-white rounded-2xl space-y-2 shadow-xl">
                    <div className="flex justify-between items-center opacity-60 text-[10px] font-bold uppercase tracking-widest">
                      <span>Tiền bánh</span>
                      <span>{selectedOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60 text-[10px] font-bold uppercase tracking-widest">
                      <span>Phí ship</span>
                      <span>{(selectedOrder.shippingFee || 0).toLocaleString()}đ</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">TỔNG CỘNG</span>
                      <span className="text-xl font-black text-primary">{selectedOrder.totalPrice.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4 pt-4">
                 <button 
                  onClick={() => handleShipViaGrab(selectedOrder.address)}
                  className="h-14 bg-[#00B14F] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">moped</span>
                  Giao Grab
                </button>
                <button onClick={() => setSelectedOrder(null)} className="h-14 bg-gray-100 dark:bg-zinc-800 text-text-main dark:text-zinc-100 rounded-2xl font-bold">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => onNavigate(AdminScreen.ADD_ORDER_MANUAL)} className="fixed bottom-24 right-4 z-30 flex items-center gap-3 bg-zinc-900 text-white h-14 pl-5 pr-6 rounded-full shadow-2xl active:scale-95">
        <span className="material-symbols-outlined text-[24px]">add_shopping_cart</span>
        <span className="font-bold text-sm">Đơn tại quầy</span>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="flex flex-col items-center gap-1 text-gray-400"><span className="material-symbols-outlined">home</span><span className="text-[10px] font-medium">Trang Chủ</span></button>
          <button className="flex flex-col items-center gap-1 text-primary"><span className="material-symbols-outlined material-symbols-filled">receipt_long</span><span className="text-[10px] font-bold">Đơn Hàng</span></button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="flex flex-col items-center gap-1 text-gray-400"><span className="material-symbols-outlined">cake</span><span className="text-[10px] font-medium">Sản Phẩm</span></button>
          <button onClick={() => onNavigate(AdminScreen.REPORTS)} className="flex flex-col items-center gap-1 text-gray-400"><span className="material-symbols-outlined">bar_chart</span><span className="text-[10px] font-medium">Báo Cáo</span></button>
        </div>
      </nav>
    </div>
  );
};

export default AdminOrders;
