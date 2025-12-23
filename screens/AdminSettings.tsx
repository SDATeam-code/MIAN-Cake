
import React, { useState } from 'react';
import { AdminScreen, AdminSettings } from '../types';

interface Props {
  settings: AdminSettings;
  setSettings: (s: AdminSettings) => void;
  onNavigate: (s: AdminScreen) => void;
}

const AdminSettingsScreen: React.FC<Props> = ({ settings, setSettings, onNavigate }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    setSettings(localSettings);
    alert('Đã cập nhật cấu hình Bếp Mian thành công!');
    onNavigate(AdminScreen.DASHBOARD);
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 border-b dark:border-zinc-800 flex items-center">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center text-lg font-bold pr-10">Cài đặt hệ thống</h2>
      </header>

      <div className="p-6 flex flex-col gap-6">
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-1">Thông tin liên hệ</h3>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-soft border dark:border-zinc-800 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Số điện thoại hiển thị</label>
              <input 
                value={localSettings.bakeryPhone} 
                onChange={e => setLocalSettings({...localSettings, bakeryPhone: e.target.value})}
                className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Email nhận báo cáo</label>
              <input 
                value={localSettings.adminEmail} 
                onChange={e => setLocalSettings({...localSettings, adminEmail: e.target.value})}
                className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold" 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-1">Báo cáo tự động</h3>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-soft border dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Tần suất gửi email</label>
              <select 
                value={localSettings.autoReportFrequency} 
                onChange={e => setLocalSettings({...localSettings, autoReportFrequency: e.target.value as any})}
                className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none"
              >
                <option value="NONE">Tắt tự động</option>
                <option value="WEEKLY">Gửi hàng tuần</option>
                <option value="MONTHLY">Gửi hàng tháng</option>
                <option value="QUARTERLY">Gửi hàng quý</option>
              </select>
              <p className="text-[9px] text-primary font-medium italic mt-2 px-1">* Báo cáo PDF sẽ được gửi về {localSettings.adminEmail}</p>
            </div>
          </div>
        </section>

        <button onClick={handleSave} className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all mt-4">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsScreen;
