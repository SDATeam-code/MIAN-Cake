
import React, { useState } from 'react';
import { AdminScreen } from '../types';

interface Props {
  currentPassword: string;
  setPassword: (p: string) => void;
  onNavigate: (s: AdminScreen) => void;
}

const AdminChangePassword: React.FC<Props> = ({ currentPassword, setPassword, onNavigate }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [verifyPass, setVerifyPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (oldPass !== currentPassword) {
      setError('Mật khẩu cũ không chính xác!');
      return;
    }
    if (newPass.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự!');
      return;
    }
    if (newPass !== verifyPass) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setPassword(newPass);
    setSuccess(true);
    setError('');
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background-light dark:bg-zinc-950">
        <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-green-600 text-4xl">check</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Thành công!</h2>
        <p className="text-text-secondary mb-8">Mật khẩu của bạn đã được thay đổi.</p>
        <button 
          onClick={() => onNavigate(AdminScreen.DASHBOARD)}
          className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold"
        >
          Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 border-b dark:border-zinc-800 flex items-center">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center text-lg font-bold pr-10">Đổi Mật Khẩu</h2>
      </header>

      <div className="p-6 flex flex-col gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-soft space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase px-1">Mật khẩu cũ</label>
            <input 
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase px-1">Mật khẩu mới</label>
            <input 
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase px-1">Xác nhận mật khẩu mới</label>
            <input 
              type="password"
              value={verifyPass}
              onChange={(e) => setVerifyPass(e.target.value)}
              className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-semibold"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

        <button 
          onClick={handleSubmit}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Cập Nhật Mật Khẩu
        </button>
      </div>
    </div>
  );
};

export default AdminChangePassword;
