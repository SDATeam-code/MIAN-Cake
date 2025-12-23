
import React, { useState } from 'react';
import { AdminScreen, Product, Order } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  products: Product[];
  onCreateOrder: (prodId: string, qty: number, extra: Partial<Order>) => void;
}

const AdminAddOrderManual: React.FC<Props> = ({ onNavigate, products, onCreateOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('Giao tại quầy');
  const [notes, setNotes] = useState('');

  const handleCreateOrder = () => {
    if (!customerName) {
      alert('Vui lòng nhập tên khách!');
      return;
    }
    onCreateOrder(selectedProductId, quantity, {
      customerName,
      customerPhone,
      address,
      notes,
      status: 'PENDING'
    });
    // Notification for success is handled in App.tsx or here
    onNavigate(AdminScreen.ORDERS);
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 border-b dark:border-zinc-800 flex items-center">
        <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center text-lg font-bold pr-10">Thêm Đơn Thủ Công</h2>
      </header>

      <div className="p-6 flex flex-col gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-soft space-y-5 border dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Tên khách hàng</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="VD: Cô Lan hàng xóm..." />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Số điện thoại</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="VD: 0912..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Địa chỉ giao hàng</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhập địa chỉ nhà hoặc số sảnh..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Chọn bánh</label>
            <select 
              value={selectedProductId} 
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none"
            >
              {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString()}đ</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Số lượng</label>
            <div className="h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center px-4">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-10 flex items-center justify-center text-primary font-bold"><span className="material-symbols-outlined">remove</span></button>
              <span className="flex-1 text-center font-black text-lg">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="size-10 flex items-center justify-center text-primary font-bold"><span className="material-symbols-outlined">add</span></button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Ghi chú (Tùy chọn)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-24 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm font-medium outline-none" placeholder="VD: Giao trước 5h chiều..." />
          </div>
        </div>

        <button onClick={handleCreateOrder} className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">verified</span>
          Xác Nhận Tạo Đơn
        </button>
      </div>
    </div>
  );
};

export default AdminAddOrderManual;
