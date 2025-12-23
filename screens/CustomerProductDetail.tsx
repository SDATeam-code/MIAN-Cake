
import React, { useState } from 'react';
import { CustomerScreen, Product } from '../types';

interface Props {
  product: Product;
  onNavigate: (s: CustomerScreen) => void;
  onAddToCart: (id: string) => void;
}

const CustomerProductDetail: React.FC<Props> = ({ product, onNavigate, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(product.id);
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className="pb-32 bg-white dark:bg-zinc-950 min-h-screen relative">
      <div className="relative aspect-square">
        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="absolute top-4 left-4 size-10 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {product.isBestSeller && (
          <span className="absolute bottom-4 right-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">BÁN CHẠY</span>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-black tracking-tight">{product.name}</h2>
          <span className="text-2xl font-black text-primary">{product.price.toLocaleString()}đ</span>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-0.5 text-orange-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`material-symbols-outlined text-[18px] ${i < 4 ? 'material-symbols-filled' : ''}`}>star</span>
            ))}
            <span className="ml-1 text-sm font-black">4.8</span>
          </div>
          <div className="w-px h-3 bg-gray-200 dark:bg-zinc-800" />
          <span className="text-sm font-bold text-text-secondary">24 đánh giá khách hàng</span>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Mô tả bánh</h3>
          <p className="text-sm text-text-main dark:text-zinc-300 leading-relaxed font-medium">
            {product.description}
          </p>
        </div>

        {product.videoUrl && (
          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Video cảm nhận</h3>
            <div className="rounded-[32px] overflow-hidden shadow-2xl aspect-video bg-black border dark:border-zinc-800">
              <video src={product.videoUrl} controls className="w-full h-full object-cover" poster={product.image} />
            </div>
          </div>
        )}

        {product.articleLinks && product.articleLinks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Thông tin hữu ích</h3>
            <div className="flex flex-col gap-3">
              {product.articleLinks.map((link, idx) => (
                <a key={idx} href={link.url} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">article</span>
                    <span className="text-sm font-bold">{link.title}</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Khách hàng bình luận</h3>
            <span className="text-[10px] font-bold text-primary">XEM TẤT CẢ</span>
          </div>
          <div className="flex flex-col gap-4">
            {product.reviews?.map(rev => (
              <div key={rev.id} className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] border border-gray-100 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-primary">{rev.userName[0]}</div>
                    <span className="font-bold text-sm">{rev.userName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary">{rev.date}</span>
                </div>
                <div className="flex text-orange-400 mb-2 gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => <span key={i} className="material-symbols-outlined text-[14px] material-symbols-filled">star</span>)}
                </div>
                <p className="text-xs text-text-secondary dark:text-zinc-400 leading-relaxed font-medium italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t dark:border-zinc-800 z-50 max-w-md mx-auto">
        <div className="flex gap-4 items-center">
          <div className="h-14 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center px-2 shrink-0">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">remove</span></button>
            <span className="w-10 text-center font-black">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="size-10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">add</span></button>
          </div>
          <button 
            disabled={isAdding}
            onClick={handleAdd}
            className={`flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 ${isAdding ? 'opacity-80' : ''}`}
          >
            {isAdding ? (
              <span className="animate-spin material-symbols-outlined">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined">shopping_basket</span>
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductDetail;
