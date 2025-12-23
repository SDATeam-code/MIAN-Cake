
import React from 'react';
import { AdminScreen, Product } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (p: Product) => void;
}

const AdminProductsList: React.FC<Props> = ({ onNavigate, products, onDelete, onEdit }) => {
  return (
    <div className="pb-32 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center justify-between">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold">Danh Sách Bánh</h2>
        <button onClick={() => onNavigate(AdminScreen.ADD_PRODUCT)} className="size-10 bg-primary text-white flex items-center justify-center rounded-full shadow-lg shadow-primary/20"><span className="material-symbols-outlined">add</span></button>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border dark:border-zinc-800 flex gap-4 items-center group">
            <div className="size-20 rounded-2xl overflow-hidden shrink-0 shadow-inner">
              <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-text-main dark:text-white truncate">{product.name}</h4>
              <p className="text-primary font-black text-base mt-0.5">{product.price.toLocaleString('vi-VN')}đ</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{product.category}</span>
                <span className="text-[8px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-bold uppercase">{product.targetQty} Cái/Mẻ</span>
                {product.isBestSeller && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">HOT</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => onEdit(product)}
                className="size-10 flex items-center justify-center text-primary hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button 
                onClick={() => { if(confirm(`Xác nhận xóa bánh "${product.name}"?`)) onDelete(product.id); }}
                className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
        
        {products.length === 0 && (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-200">bakery_dining</span>
            <p className="mt-4 font-bold text-text-secondary">Chưa có bánh nào trong danh sách</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-medium">Trang Chủ</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-[10px] font-medium">Đơn Hàng</span>
          </button>
          <button onClick={() => onNavigate(AdminScreen.PRODUCTS_LIST)} className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined material-symbols-filled">cake</span>
            <span className="text-[10px] font-bold">Sản Phẩm</span>
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

export default AdminProductsList;
