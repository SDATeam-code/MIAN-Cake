
import React, { useMemo } from 'react';
import { AdminScreen, ChatMessage } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  messages: ChatMessage[];
  onSelectChat: (customerPhone: string) => void;
}

const AdminChatList: React.FC<Props> = ({ onNavigate, messages, onSelectChat }) => {
  const groupedChats = useMemo(() => {
    const chats: Record<string, { lastMsg: ChatMessage; unread: number }> = {};
    messages.forEach(m => {
      const phone = m.senderId === 'admin' ? m.text.split('->')[0] || 'Unknown' : m.senderId;
      if (!chats[phone] || m.timestamp > chats[phone].lastMsg.timestamp) {
        chats[phone] = { 
          lastMsg: m, 
          unread: (chats[phone]?.unread || 0) + (m.senderId !== 'admin' && !m.isRead ? 1 : 0)
        };
      } else if (m.senderId !== 'admin' && !m.isRead) {
        chats[phone].unread += 1;
      }
    });
    return Object.entries(chats).sort((a, b) => b[1].lastMsg.timestamp - a[1].lastMsg.timestamp);
  }, [messages]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-zinc-950 pb-20">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center gap-3">
        <button onClick={() => onNavigate(AdminScreen.DASHBOARD)} className="size-10 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold">Tin nhắn khách hàng</h2>
      </header>

      <div className="p-4 space-y-3">
        {groupedChats.map(([phone, data]) => (
          <button 
            key={phone} 
            onClick={() => onSelectChat(phone)}
            className={`w-full bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border flex items-center gap-4 transition-all active:scale-95 ${data.unread > 0 ? 'border-primary/30 ring-1 ring-primary/10' : 'border-transparent'}`}
          >
            <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center font-bold text-primary shrink-0">{data.lastMsg.senderName[0]}</div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="font-bold text-sm truncate">{data.lastMsg.senderName}</h4>
                <span className="text-[10px] text-text-secondary">{data.lastMsg.time}</span>
              </div>
              <p className={`text-xs truncate ${data.unread > 0 ? 'font-black text-text-main' : 'text-text-secondary'}`}>
                {data.lastMsg.senderId === 'admin' ? 'Bạn: ' : ''}{data.lastMsg.text}
              </p>
            </div>
            {data.unread > 0 && (
              <span className="size-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{data.unread}</span>
            )}
          </button>
        ))}
        {groupedChats.length === 0 && (
          <div className="py-24 text-center text-text-secondary opacity-50">
            <span className="material-symbols-outlined text-5xl">chat_bubble</span>
            <p className="mt-2 font-bold">Chưa có hội thoại nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatList;
