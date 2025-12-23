
import React, { useState, useEffect, useRef } from 'react';
import { CustomerScreen, Order, Product, UserProfile } from '../types';
import { generateSmartGreeting } from '../geminiService';

interface Props {
  onNavigate: (s: CustomerScreen) => void;
  userProfile: UserProfile;
  orders: Order[];
  products: Product[];
  priorityProduct?: Product;
}

const CustomerChat: React.FC<Props> = ({ onNavigate, userProfile, orders, products, priorityProduct }) => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      // 1. Phân tích ngữ cảnh
      const activeOrder = orders.find(o => ['BAKING', 'ROASTING', 'DELIVERING'].includes(o.status));
      const lastOrder = orders.find(o => o.status === 'COMPLETED');
      
      // Tìm review gần nhất của user này
      let recentReview = null;
      products.forEach(p => {
        const rev = p.reviews?.find(r => r.userName === userProfile.name);
        if (rev) recentReview = rev;
      });

      // Kiểm tra xem khách đã lâu chưa đặt (3 tháng = 90 ngày)
      const isInactive = !lastOrder || (new Date().getTime() - new Date(lastOrder.date).getTime() > 90 * 24 * 60 * 60 * 1000);

      // 2. Gọi AI tạo lời chào
      const greeting = await generateSmartGreeting({
        customerName: userProfile.name,
        activeOrder,
        lastOrder,
        recentReview,
        priorityProduct,
        isInactive
      });

      setIsTyping(false);
      setMessages([{
        id: Date.now(),
        text: greeting,
        sender: 'shop',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    initChat();
  }, [userProfile, orders, products, priorityProduct]);

  const handleSend = () => {
    if (!msg.trim()) return;
    
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newUserMsg = { id: Date.now(), text: msg, sender: 'user', time: timeStr };
    setMessages(prev => [...prev, newUserMsg]);
    setMsg('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'Dạ shop đã nhận được tin nhắn! Chủ tiệm đang vào tiếp chị ngay đây ạ. 🥰', 
        sender: 'shop', 
        time: timeStr 
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-950 max-w-md mx-auto relative">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center gap-3">
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-sm">M</div>
          <div>
            <h3 className="font-bold text-sm">Bếp bánh Mian</h3>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-grab-green animate-pulse" />
              <span className="text-[10px] text-grab-green font-bold uppercase tracking-tighter">Đang hoạt động</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-[24px] text-sm leading-relaxed shadow-sm ${
              m.sender === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white dark:bg-zinc-800 text-text-main dark:text-zinc-100 rounded-tl-none border dark:border-zinc-700'
            }`}>
              {m.text}
            </div>
            <span className="text-[9px] text-text-secondary mt-1 font-medium">{m.time}</span>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-1 p-4 bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-none w-max">
            <div className="size-1.5 bg-primary/40 rounded-full animate-bounce" />
            <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 flex gap-2 pb-safe">
        <button className="size-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-text-secondary">
          <span className="material-symbols-outlined">image</span>
        </button>
        <input 
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Nhập tin nhắn..." 
          className="flex-1 h-12 bg-gray-100 dark:bg-zinc-800 border-none rounded-2xl px-5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" 
        />
        <button 
          onClick={handleSend}
          className={`size-12 rounded-2xl flex items-center justify-center transition-all ${msg.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'}`}
          disabled={!msg.trim()}
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerChat;
