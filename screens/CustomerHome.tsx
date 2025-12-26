
import React from 'react';
import { CustomerScreen, Product, UserProfile } from '../types';

interface Props {
  onNavigate: (s: CustomerScreen) => void;
  userProfile: UserProfile;
  products: Product[];
  bakeryPhone: string;
  onSelectProduct: (id: string) => void;
  onAddToCart: (id: string) => void;
  unreadCount?: number;
  cartCount?: number;
}

const CustomerHome: React.FC<Props> = ({ 
  onNavigate, 
  userProfile, 
  products, 
  bakeryPhone, 
  onSelectProduct, 
  onAddToCart, 
  unreadCount = 0,
  cartCount = 0
}) => {
  return (
    <div className="pb-32">
      <div className="sticky top-0 z-30 bg-background-light/95 backdrop-blur-md p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: `url(${userProfile.avatar || 'https://picsum.photos/100/100'})` }} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-main">Bếp Mi An xin chào bạn {userProfile.name}...</span>
              <span className="text-[10px] font-medium text-text-secondary">Chúc bạn một ngày ngọt ngào!</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${bakeryPhone}`} className="size-10 rounded-full bg-grab-bg border border-grab-green flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-grab-green">call</span>
            </a>
            <button onClick={() => onNavigate(CustomerScreen.CART)} className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm border relative">
              <span className="material-symbols-outlined text-primary">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => onNavigate(CustomerScreen.CHAT)} className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm border relative">
              <span className="material-symbols-outlined">chat</span>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Món ngon hôm nay</h3>
        </div>
        
        <div className="flex flex-col gap-6">
          {products.map(product => {
            const avgRating = product.reviews && product.reviews.length > 0 
              ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
              : 0;
            const isFavorite = avgRating >= 4.5 || (product.reviews && product.reviews.length > 5);

            return (
              <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-soft border border-black/5 active:scale-[0.98] transition-all relative">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.isBestSeller && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] material-symbols-filled">local_fire_department</span>
                      HOT
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] material-symbols-filled">thumb_up</span>
                      GỢI Ý
                    </span>
                  )}
                  {isFavorite && (
                    <span className="bg-amber-400 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] material-symbols-filled">favorite</span>
                      YÊU THÍCH
                    </span>
                  )}
                </div>

                <div className="relative aspect-[16/10]" onClick={() => onSelectProduct(product.id)}>
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <div onClick={() => onSelectProduct(product.id)}>
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold">{product.name}</h4>
                      <span className="text-xs bg-gray-50 px-2 py-0.5 rounded-md text-text-secondary font-bold">{product.category}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{product.description}</p>
                    
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="material-symbols-outlined text-[14px] text-amber-400 material-symbols-filled">star</span>
                        <span className="text-[10px] font-black text-text-main">{avgRating.toFixed(1)}</span>
                        <span className="text-[10px] text-text-secondary">({product.reviews.length} đánh giá)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-xl font-black text-primary">{product.price.toLocaleString()}đ</span>
                    <button onClick={() => onAddToCart(product.id)} className="h-11 px-6 bg-primary text-white font-bold rounded-2xl active:scale-95 shadow-lg shadow-primary/20">Thêm vào giỏ</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={() => onNavigate(CustomerScreen.HOME)} className="flex flex-col items-center gap-1 text-primary"><span className="material-symbols-outlined material-symbols-filled">home</span><span className="text-[10px] font-bold">Trang Chủ</span></button>
          <button onClick={() => onNavigate(CustomerScreen.ORDERS)} className="flex flex-col items-center gap-1 text-text-secondary"><span className="material-symbols-outlined">receipt_long</span><span className="text-[10px] font-medium">Đơn Hàng</span></button>
          <button onClick={() => onNavigate(CustomerScreen.PROFILE)} className="flex flex-col items-center gap-1 text-text-secondary"><span className="material-symbols-outlined">person</span><span className="text-[10px] font-medium">Tài Khoản</span></button>
        </div>
      </nav>
    </div>
  );
};

export default CustomerHome;
