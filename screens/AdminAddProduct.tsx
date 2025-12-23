
import React, { useState, useRef, useEffect } from 'react';
import { AdminScreen, Product } from '../types';
import { storage } from '../storageService';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  editProduct?: Product;
  onClose?: () => void;
}

const AdminAddProduct: React.FC<Props> = ({ onNavigate, setProducts, editProduct, onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Ngọt');
  const [targetQty, setTargetQty] = useState('10');
  const [image, setImage] = useState('https://picsum.photos/400/300?cake');
  const [videoLink, setVideoLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setPrice(editProduct.price.toString());
      setDesc(editProduct.description);
      setCategory(editProduct.category);
      setTargetQty(editProduct.targetQty.toString());
      setImage(editProduct.image);
      setVideoLink(editProduct.videoUrl || '');
    }
  }, [editProduct]);

  const handleSave = async () => {
    if (!name || !price) {
      alert('Vui lòng nhập tên và giá bánh!');
      return;
    }

    setIsSaving(true);
    try {
      const productData: Product = {
        id: editProduct?.id || Math.random().toString(36).substr(2, 9),
        name,
        price: parseInt(price),
        description: desc,
        image,
        category,
        targetQty: parseInt(targetQty),
        isNew: !editProduct,
        isBestSeller: editProduct?.isBestSeller,
        videoUrl: videoLink,
        reviews: editProduct?.reviews || []
      };

      await storage.saveProduct(productData);

      setProducts(prev => {
        if (editProduct) {
          return prev.map(p => p.id === editProduct.id ? productData : p);
        } else {
          return [productData, ...prev];
        }
      });

      alert(editProduct ? 'Đã cập nhật thông tin bánh thành công!' : 'Đã lưu bánh mới thành công!');
      if (onClose) onClose();
      onNavigate(AdminScreen.PRODUCTS_LIST);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onClose) onClose();
    onNavigate(AdminScreen.PRODUCTS_LIST);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 border-b dark:border-zinc-800 flex items-center justify-between">
        <button onClick={handleBack} className="size-10 flex items-center justify-center rounded-full active:bg-black/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">{editProduct ? 'Sửa Bánh' : 'Thêm Bánh Mới'}</h2>
        <button onClick={handleSave} disabled={isSaving} className={`text-primary font-bold ${isSaving ? 'opacity-50' : ''}`}>
          {isSaving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </header>

      <div className="p-4 flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-1">Thông tin bánh</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-soft border dark:border-zinc-800 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase text-text-secondary px-1">Tên Bánh</p>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-12 rounded-2xl border-none bg-gray-50 dark:bg-zinc-800 px-4 font-bold outline-none" placeholder="Tên loại bánh..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold uppercase text-text-secondary px-1">Phân loại</p>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 rounded-2xl border-none bg-gray-50 dark:bg-zinc-800 px-4 font-bold outline-none">
                  <option>Ngọt</option>
                  <option>Mặn</option>
                  <option>Healthy</option>
                  <option>Cookies</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold uppercase text-text-secondary px-1">Định mức mẻ</p>
                <div className="relative">
                  <input type="number" value={targetQty} onChange={e => setTargetQty(e.target.value)} className="w-full h-12 rounded-2xl border-none bg-gray-50 dark:bg-zinc-800 px-4 font-bold outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-secondary">Cái</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase text-text-secondary px-1">Mô Tả</p>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full min-h-[100px] rounded-2xl border-none bg-gray-50 dark:bg-zinc-800 p-4 font-medium text-sm outline-none" placeholder="Hương vị, thành phần..." />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-1">Giá bán</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-soft border dark:border-zinc-800">
            <div className="relative">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-14 rounded-2xl border-none bg-gray-50 dark:bg-zinc-800 pl-4 pr-12 text-2xl font-black text-primary outline-none" placeholder="0" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">đ</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-1">Media</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-soft border dark:border-zinc-800 flex flex-col gap-4">
             <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
               <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="size-24 shrink-0 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center active:scale-95 transition-all"
               >
                 <span className="material-symbols-outlined text-primary text-[28px]">add_a_photo</span>
                 <span className="text-[10px] font-bold text-primary uppercase">Tải ảnh</span>
               </button>
               {image && (
                 <div className="size-24 shrink-0 rounded-2xl bg-cover bg-center relative border dark:border-zinc-800" style={{ backgroundImage: `url(${image})` }}>
                    <button onClick={() => setImage('')} className="absolute -top-2 -right-2 size-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-white text-[14px]">close</span></button>
                 </div>
               )}
             </div>
             
             <div className="pt-2 border-t dark:border-zinc-800 border-dashed">
                {!showVideoInput ? (
                  <button onClick={() => setShowVideoInput(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 text-left active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-primary">videocam</span>
                    <span className="text-xs font-bold text-text-secondary">Link video TikTok/Reels</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input value={videoLink} onChange={e => setVideoLink(e.target.value)} className="flex-1 h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 text-xs font-bold" placeholder="Dán link video..." />
                    <button onClick={() => setShowVideoInput(false)} className="px-4 bg-zinc-900 text-white rounded-2xl font-bold">OK</button>
                  </div>
                )}
             </div>
          </div>
        </section>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4 mb-10"
        >
          {isSaving ? (
            <span className="animate-spin material-symbols-outlined">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined">save</span>
              {editProduct ? 'Cập Nhật Bánh' : 'Xác Nhận Lưu Bánh'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminAddProduct;
