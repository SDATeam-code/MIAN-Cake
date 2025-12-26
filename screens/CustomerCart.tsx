
import React, { useState, useMemo, useEffect } from 'react';
import { CustomerScreen, Product, UserProfile } from '../types';

interface Props {
  cartItems: { product: Product, quantity: number }[];
  onUpdateQty: (productId: string, delta: number) => void;
  userProfile: UserProfile;
  onCheckout: (items: { product: Product, quantity: number }[], shippingInfo: { address: string, notes: string }) => void;
  onNavigate: (s: CustomerScreen) => void;
}

const CustomerCart: React.FC<Props> = ({ cartItems, onUpdateQty, userProfile, onCheckout, onNavigate }) => {
  const [selectedAddressType, setSelectedAddressType] = useState<'fixed' | 'temp'>(userProfile.selectedAddress);
  const [customAddress, setCustomAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Mỗi khi đổi loại địa chỉ, pre-fill vào ô text để khách sửa
    setCustomAddress(selectedAddressType === 'fixed' ? userProfile.fixedAddress : userProfile.tempAddress);
  }, [selectedAddressType, userProfile]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!customAddress.trim()) {
      alert("Chị ơi, vui lòng nhập địa chỉ nhận bánh nhé!");
      return;
    }
    onCheckout(cartItems, { address: customAddress, notes });
  };

  return (
    <div className="pb-32 bg-background-light min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md p-4 border-b flex items-center">
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold pr-10">Giỏ bánh của chị</h2>
      </header>

      <div className="p-4 flex flex-col gap-6">
        {/* Danh sách sản phẩm */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary px-1">Các loại bánh chị chọn</h3>
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-3xl shadow-soft border border-black/5 flex items-center gap-4">
                <img src={item.product.image} className="size-16 rounded-2xl object-cover" alt={item.product.name} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                  <p className="text-xs font-black text-primary mt-0.5">{(item.product.price * item.quantity).toLocaleString()}đ</p>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl px-1">
                  <button onClick={() => onUpdateQty(item.product.id, -1)} className="size-8 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.product.id, 1)} className="size-8 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && (
              <div className="py-12 text-center text-text-secondary">
                <span className="material-symbols-outlined text-4xl opacity-20">shopping_basket</span>
                <p className="text-sm font-bold mt-2">Giỏ hàng đang trống chị ơi!</p>
              </div>
            )}
          </div>
        </section>

        {/* Thông tin giao hàng */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary px-1">Thông tin giao bánh</h3>
          <div className="bg-white p-6 rounded-[32px] shadow-soft border border-black/5 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-text-secondary">Chọn nhanh địa chỉ lưu sẵn</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSelectedAddressType('fixed')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedAddressType === 'fixed' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50'}`}
                >
                  <span className="material-symbols-outlined text-sm mb-1">home</span>
                  <p className="text-[10px] font-black uppercase">Nhà riêng</p>
                </button>
                <button 
                  onClick={() => setSelectedAddressType('temp')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedAddressType === 'temp' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50'}`}
                >
                  <span className="material-symbols-outlined text-sm mb-1">apartment</span>
                  <p className="text-[10px] font-black uppercase">Công ty</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase text-text-secondary">Chỉnh sửa địa chỉ chi tiết</label>
                <span className="text-[8px] italic text-primary">Chị có thể sửa trực tiếp tại đây</span>
              </div>
              <textarea 
                value={customAddress}
                onChange={e => setCustomAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã..."
                className="w-full h-24 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold text-text-main outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-secondary">Ghi chú cho Bếp</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="VD: Giao cho em giờ hành chính, bánh ít đường..."
                className="w-full h-24 bg-gray-50 border-none rounded-2xl p-4 text-xs font-medium outline-none"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Footer thanh toán */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t z-50 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-bold text-text-secondary uppercase">Tổng cộng ({cartItems.length} loại)</span>
          <span className="text-2xl font-black text-primary">{totalPrice.toLocaleString()}đ</span>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
          className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined">verified</span>
          Đặt bánh ngay
        </button>
      </div>
    </div>
  );
};

export default CustomerCart;
