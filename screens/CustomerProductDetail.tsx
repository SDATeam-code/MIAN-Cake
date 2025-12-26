
import React, { useState, useMemo } from 'react';
import { CustomerScreen, Product, ProductReview } from '../types';
import { storage } from '../storageService';

interface Props {
  product: Product;
  onNavigate: (s: CustomerScreen) => void;
  onAddToCart: (id: string, qty: number) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  userProfile?: { name: string };
}

const CustomerProductDetail: React.FC<Props> = ({ product, onNavigate, onAddToCart, onUpdateProduct, userProfile }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const avgRating = useMemo(() => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    return product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  }, [product.reviews]);

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(product.id, quantity);
      setIsAdding(false);
      onNavigate(CustomerScreen.HOME); // Quay về home sau khi thêm
    }, 600);
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      alert("Chị ơi, vui lòng nhập nội dung bình luận nhé!");
      return;
    }

    setIsSubmittingReview(true);
    const newReview: ProductReview = {
      id: Math.random().toString(36).substr(2, 9),
      userName: userProfile?.name || "Khách hàng Mian",
      rating: rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('vi-VN')
    };

    const updatedProduct = {
      ...product,
      reviews: [newReview, ...(product.reviews || [])]
    };

    try {
      await storage.saveProduct(updatedProduct);
      onUpdateProduct(updatedProduct);
      alert("Cảm ơn chị đã bình luận! Ý kiến của chị giúp Bếp Mian hoàn thiện hơn.");
      setComment('');
      setRating(5);
    } catch (e) {
      alert("Ôi, có lỗi một chút khi gửi bình luận. Chị thử lại giúp em nhé!");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="pb-32 bg-white dark:bg-zinc-950 min-h-screen relative">
      <div className="relative aspect-square">
        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="absolute top-4 left-4 size-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button onClick={() => onNavigate(CustomerScreen.CART)} className="absolute top-4 right-4 size-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <span className="material-symbols-outlined text-primary">shopping_basket</span>
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-black tracking-tight">{product.name}</h2>
          <span className="text-2xl font-black text-primary">{product.price.toLocaleString()}đ</span>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-0.5 text-orange-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`material-symbols-outlined text-[18px] ${i < Math.round(avgRating || 5) ? 'material-symbols-filled' : ''}`}>star</span>
            ))}
            <span className="ml-1 text-sm font-black">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <span className="text-sm font-bold text-text-secondary">{product.reviews?.length || 0} đánh giá khách hàng</span>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Mô tả bánh</h3>
          <p className="text-sm text-text-main leading-relaxed font-medium">{product.description}</p>
        </div>

        {/* Đánh giá khách hàng Section */}
        <div className="mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-4">Khách hàng bình luận</h3>
          <div className="bg-primary-light/40 p-5 rounded-[28px] border border-primary/10 mb-6">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className={`material-symbols-outlined text-2xl ${star <= rating ? 'text-amber-400 material-symbols-filled' : 'text-gray-300'}`}>star</button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Bánh hôm nay thế nào chị ơi..." className="w-full h-24 bg-white border-none rounded-2xl p-4 text-xs font-medium outline-none shadow-sm" />
            <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="mt-3 w-full h-11 bg-primary text-white rounded-xl text-xs font-black uppercase shadow-lg active:scale-95 transition-all">Gửi bình luận</button>
          </div>
          <div className="flex flex-col gap-4">
            {product.reviews?.map(rev => (
              <div key={rev.id} className="bg-gray-50 p-5 rounded-[24px] border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{rev.userName}</span>
                  <span className="text-[10px] font-bold text-text-secondary">{rev.date}</span>
                </div>
                <p className="text-xs text-text-secondary italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t z-50 max-w-md mx-auto">
        <div className="flex gap-4 items-center">
          <div className="h-14 bg-gray-100 rounded-2xl flex items-center px-2 shrink-0">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-10 flex items-center justify-center text-primary font-bold">－</button>
            <span className="w-10 text-center font-black">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="size-10 flex items-center justify-center text-primary font-bold">＋</button>
          </div>
          <button 
            disabled={isAdding}
            onClick={handleAdd}
            className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isAdding ? <span className="animate-spin material-symbols-outlined">progress_activity</span> : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductDetail;
