
import React, { useRef } from 'react';
import { CustomerScreen, UserProfile, Order } from '../types';

interface Props {
  userProfile: UserProfile;
  setUserProfile: (p: UserProfile) => void;
  onNavigate: (s: CustomerScreen) => void;
  onLogout: () => void;
}

const ORDER_HISTORY: Order[] = [
  {
    id: '#DH0301',
    customerName: 'Minh Anh',
    productName: 'Combo Sáng: Croissant & Cà phê',
    productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-tm9EpISsdvBShohCG49D1hfssszX9zEjaBzDey9ugy9hhE3drsoSV9LVCHP3Gydlcn1qbBDdFnrUznkzrhWPss1yREatWrbWet2gVZmGNKYSxwT5djof6m67XgBhBkmJXNu5lf-ZwuPA9-mFECrEzEBj11WucDegUvWD0lQX_W0GXgY19VrNkBHkh_Lf9qzdj89J80JwbreEyQVuQovNKHARdQZcUsDqJG5Z94eUwTX7s7-1PHtpiB9L1uWLKYcIqLHcjT1qxa8',
    status: 'COMPLETED',
    time: '85.000đ',
    price: 85000,
    quantity: 1,
    // Fix: Added missing address property to match Order interface
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    date: '2024-12-20'
  }
];

const CustomerProfileScreen: React.FC<Props> = ({ userProfile, setUserProfile, onNavigate, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHistory, setShowHistory] = React.useState(false);

  const handleAddressSelect = (type: 'fixed' | 'temp') => {
    if (userProfile.selectedAddress !== type) {
      setUserProfile({ ...userProfile, selectedAddress: type });
    }
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setUserProfile({ ...userProfile, [field]: value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateField('avatar', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center justify-between">
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Cá nhân của tôi</h2>
        <button onClick={onLogout} className="text-red-500 font-bold text-sm">Đăng xuất</button>
      </header>

      <div className="p-4 flex flex-col gap-6">
        {/* Thông tin cá nhân */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-soft border dark:border-zinc-800">
          <div className="flex flex-col items-center mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <div 
              onClick={handleAvatarClick}
              className="size-24 rounded-full bg-orange-100 border-4 border-white dark:border-zinc-800 shadow-lg mb-3 bg-cover bg-center relative group cursor-pointer overflow-hidden" 
              style={{ backgroundImage: `url(${userProfile.avatar || 'https://picsum.photos/200/200'})` }}
            >
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                <span className="text-[8px] text-white font-bold uppercase mt-1">Thay ảnh</span>
              </div>
            </div>
            <h3 className="text-xl font-bold">{userProfile.name}</h3>
            <p className="text-xs text-primary font-black uppercase tracking-widest mt-1">Hạng Vàng</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Tên của bạn</label>
              <input 
                value={userProfile.name} 
                onChange={(e) => updateField('name', e.target.value)} 
                className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Tuổi</label>
                <input 
                  value={userProfile.age} 
                  onChange={(e) => updateField('age', e.target.value)} 
                  className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Số điện thoại</label>
                <input 
                  value={userProfile.phone} 
                  onChange={(e) => updateField('phone', e.target.value)} 
                  className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quản lý 2 địa chỉ */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-soft border dark:border-zinc-800">
          <h3 className="text-sm font-bold mb-4 uppercase text-text-secondary flex items-center justify-between">
            Địa chỉ giao hàng
            <span className="text-[9px] lowercase font-normal italic">Click vào ô để chọn làm mặc định</span>
          </h3>
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              <div 
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${userProfile.selectedAddress === 'fixed' ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-zinc-800 hover:border-gray-200'}`} 
                onClick={() => handleAddressSelect('fixed')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">home</span>
                  <span className="text-xs font-bold uppercase tracking-wide">Địa chỉ cố định</span>
                  {userProfile.selectedAddress === 'fixed' && <span className="material-symbols-outlined text-primary ml-auto text-[20px] material-symbols-filled">check_circle</span>}
                </div>
                <input 
                  value={userProfile.fixedAddress} 
                  onChange={(e) => updateField('fixedAddress', e.target.value)} 
                  onClick={(e) => e.stopPropagation()} 
                  className="w-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-text-main dark:text-zinc-200 focus:ring-2 focus:ring-primary/30 outline-none" 
                  placeholder="Nhập địa chỉ nhà riêng..." 
                />
              </div>

              <div 
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${userProfile.selectedAddress === 'temp' ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-zinc-800 hover:border-gray-200'}`} 
                onClick={() => handleAddressSelect('temp')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">apartment</span>
                  <span className="text-xs font-bold uppercase tracking-wide">Địa chỉ tạm thời</span>
                  {userProfile.selectedAddress === 'temp' && <span className="material-symbols-outlined text-primary ml-auto text-[20px] material-symbols-filled">check_circle</span>}
                </div>
                <input 
                  value={userProfile.tempAddress} 
                  onChange={(e) => updateField('tempAddress', e.target.value)} 
                  onClick={(e) => e.stopPropagation()} 
                  className="w-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-text-main dark:text-zinc-200 focus:ring-2 focus:ring-primary/30 outline-none" 
                  placeholder="Nhập địa chỉ cơ quan, công ty..." 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Lịch sử đặt bánh */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-soft border dark:border-zinc-800">
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-text-secondary">Lịch sử đặt bánh</h3>
            <span className="material-symbols-outlined text-text-secondary transition-transform" style={{ transform: showHistory ? 'rotate(180deg)' : 'none' }}>expand_more</span>
          </button>
          
          {showHistory && (
            <div className="mt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              {ORDER_HISTORY.map(order => (
                <div key={order.id} className="flex gap-3 items-center p-2 rounded-xl bg-gray-50 dark:bg-zinc-800">
                  <img src={order.productImage} className="size-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-text-secondary">{order.date}</p>
                    <p className="text-xs font-bold truncate">{order.productName}</p>
                    <p className="text-[10px] font-bold text-primary">{order.price.toLocaleString()}đ</p>
                  </div>
                  <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">HOÀN TẤT</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={() => onNavigate(CustomerScreen.HOME)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-medium">Trang Chủ</span>
          </button>
          <button onClick={() => onNavigate(CustomerScreen.ORDERS)} className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-[10px] font-medium">Đơn Hàng</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined material-symbols-filled">person</span>
            <span className="text-[10px] font-bold">Tài Khoản</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default CustomerProfileScreen;
