
import React from 'react';
import { CustomerScreen, Product, UserProfile } from '../types';

interface Props {
  onNavigate: (s: CustomerScreen) => void;
  userProfile: UserProfile;
  products: Product[];
  bakeryPhone: string;
  onSelectProduct: (id: string) => void;
  onAddToCart: (id: string) => void;
}

const CustomerHome: React.FC<Props> = ({ onNavigate, userProfile, products, bakeryPhone, onSelectProduct, onAddToCart }) => {
  return (
    <div className="pb-32">
      <div className="sticky top-0 z-30 bg-background-light/95 backdrop-blur-md p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: `url(${userProfile.avatar || 'https://picsum.photos/100/100'})` }} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-main">Bếp Mian chào chị {userProfile.name}.</span>
              <span className="text-[10px] font-medium text-text-secondary">Chúc chị một ngày ngọt ngào!</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${bakeryPhone}`} className="size-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200"><span className="material-symbols-outlined text-[20px]">call</span></a>
            <button className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm border"><span className="material-symbols-outlined">notifications</span></button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Món ngon hôm nay</h3>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
            Sắp xếp theo độ <span className="text-red-600 text-[14px] font-[900] italic drop-shadow-sm tracking-normal">HOT 🔥</span>
          </span>
        </div>
        
        <div className="flex flex-col gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-soft border border-black/5 active:scale-[0.98] transition-all">
              <div className="relative aspect-[16/10]" onClick={() => onSelectProduct(product.id)}>
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.isNew && <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">MỚI</span>}
                  {product.isBestSeller && <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase">Bán Chạy</span>}
                </div>
              </div>
              <div className="p-6">
                <div onClick={() => onSelectProduct(product.id)}>
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold">{product.name}</h4>
                    <span className="text-xs bg-gray-50 px-2 py-0.5 rounded-md text-text-secondary font-bold">{product.category}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <span className="text-xl font-black text-primary">{product.price.toLocaleString()}đ</span>
                  <button 
                    onClick={() => onAddToCart(product.id)}
                    className="h-11 px-6 bg-primary text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={() => onNavigate(CustomerScreen.HOME)} className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined material-symbols-filled">home</span>
            <span className="text-[10px] font-bold">Trang Chủ</span>
          </button>
          <button onClick={() => onNavigate(CustomerScreen.ORDERS)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-[10px] font-medium">Đơn Hàng</span>
          </button>
          <button onClick={() => onNavigate(CustomerScreen.PROFILE)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-medium">Tài Khoản</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default CustomerHome;
