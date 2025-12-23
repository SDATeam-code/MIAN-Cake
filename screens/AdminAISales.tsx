
import React, { useState, useEffect } from 'react';
import { AdminScreen, UserProfile } from '../types';
import { getCustomerMatches, generateSMSInvite } from '../geminiService';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  userProfile: UserProfile;
}

const STATIC_CUSTOMERS = [
  { id: '1', name: 'Lan Anh', phone: '0912345678', lastPurchase: '3 ngày trước', likes: 'Mousse Trà Xanh, Ít Ngọt', isVip: true },
  { id: '2', name: 'Hoàng Minh', phone: '0987654321', lastPurchase: '2 tuần trước', likes: 'Bánh Mousse Chanh Leo', isVip: false },
  { id: '3', name: 'Thanh Trúc', phone: '0944556677', lastPurchase: '5 ngày trước', likes: 'Tất cả vị Matcha', isVip: true },
];

const AdminAISales: React.FC<Props> = ({ onNavigate, userProfile }) => {
  const [filter, setFilter] = useState('ALL');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);

  useEffect(() => {
    // Bao gồm cả khách hàng hiện tại (chính là bạn) vào danh sách
    setAllCustomers([
      ...STATIC_CUSTOMERS,
      { id: 'me', name: userProfile.name, phone: userProfile.phone, lastPurchase: 'Mới đăng ký', likes: 'Chưa xác định', isVip: false }
    ]);
  }, [userProfile]);

  const fetchMatches = async () => {
    setLoading(true);
    const results = await getCustomerMatches("Mẻ Bánh Matcha Mousse", allCustomers);
    setMatches(results);
    setLoading(false);
  };

  useEffect(() => {
    if (allCustomers.length > 0) fetchMatches();
  }, [allCustomers]);

  const handleSMSInvite = async (cust: any) => {
    const text = await generateSMSInvite(cust.name, "Bánh Mousse Matcha");
    // Mở ứng dụng SMS với số điện thoại và nội dung soạn sẵn
    window.location.href = `sms:${cust.phone}?body=${encodeURIComponent(text)}`;
  };

  const filtered = allCustomers.filter(c => {
    if (filter === 'VIP') return c.isVip;
    if (filter === 'HIGH') {
      const m = matches.find(mat => mat.customerId === c.id);
      return m && m.matchScore >= 80;
    }
    return true;
  });

  return (
    <div className="pb-24 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 border-b dark:border-zinc-800 flex items-center justify-between">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="text-center">
          <h1 className="text-base font-bold">Trợ Lý Bán Hàng AI</h1>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest">Bếp bánh Mian</p>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full" onClick={fetchMatches}>
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </header>

      <div className="p-4 flex flex-col gap-5">
        <div className="bg-orange-50 dark:bg-zinc-900 border dark:border-zinc-800 p-4 rounded-3xl flex gap-4 items-center">
          <div className="size-16 rounded-2xl bg-cover bg-center shadow-sm" style={{ backgroundImage: 'url(https://picsum.photos/100/100?matcha)' }} />
          <div className="flex-1">
            <h2 className="text-lg font-bold">Mẻ Bánh Matcha Mousse</h2>
            <p className="text-xs text-text-secondary">AI đang tìm khách hàng tiềm năng...</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'HIGH', label: 'Độ phù hợp cao' },
            { id: 'VIP', label: 'Khách quen' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${filter === f.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-text-secondary'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map(cust => {
            const matchData = matches.find(m => m.customerId === cust.id);
            return (
              <div key={cust.id} className="bg-white dark:bg-zinc-900 p-5 rounded-[28px] shadow-soft border dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-primary">
                      {cust.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{cust.name} {cust.id === 'me' && <span className="text-[10px] text-primary">(BẠN)</span>}</h4>
                      <p className="text-[10px] text-text-secondary font-medium">Mua cuối: {cust.lastPurchase}</p>
                    </div>
                  </div>
                  {matchData && (
                    <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-black">
                      {matchData.matchScore}% HỢP
                    </div>
                  )}
                </div>

                <div className="mt-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Gợi ý từ AI</p>
                  <p className="text-xs text-text-main dark:text-zinc-300 italic">
                    {matchData ? `"${matchData.reason}"` : "Đang phân tích dữ liệu khách hàng..."}
                  </p>
                </div>

                <button 
                  onClick={() => handleSMSInvite(cust)}
                  className="mt-4 w-full h-12 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">sms</span>
                  Gửi SMS Mời (AI soạn sẵn)
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAISales;
