
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CustomerScreen, Order, Product, UserProfile, ChatMessage } from '../types';
import { generateSmartGreeting } from '../geminiService';
import { storage } from '../storageService';

interface Props {
  onNavigate: (s: any) => void;
  userProfile: UserProfile;
  orders: Order[];
  products: Product[];
  priorityProduct?: Product;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isAdmin?: boolean;
  targetCustomerPhone?: string;
}

const CustomerChat: React.FC<Props> = ({ onNavigate, userProfile, orders, products, priorityProduct, messages, setMessages, isAdmin, targetCustomerPhone }) => {
  const [msg, setMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const phoneId = isAdmin ? (targetCustomerPhone || 'unknown') : userProfile.phone;
  
  const conversation = useMemo(() => {
    return messages
      .filter(m => (m.senderId === phoneId) || (m.senderId === 'admin' && m.text.includes(`${phoneId}->`)))
      .map(m => m.senderId === 'admin' ? { ...m, text: m.text.replace(`${phoneId}->`, '') } : m)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, phoneId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [conversation]);

  useEffect(() => {
    // Mark as read when entering chat
    const markRead = async () => {
      const unread = messages.filter(m => m.senderId === (isAdmin ? phoneId : 'admin') && !m.isRead);
      if (unread.length > 0) {
        await storage.markAllReadForSender(isAdmin ? phoneId : 'admin');
        const all = await storage.getMessages();
        setMessages(all);
      }
    };
    markRead();
  }, [messages.length, isAdmin, phoneId]);

  useEffect(() => {
    if (isAdmin || conversation.length > 0) return;

    const initChat = async () => {
      setIsTyping(true);
      const activeOrder = orders.find(o => ['BAKING', 'ROASTING', 'DELIVERING'].includes(o.status));
      const lastOrder = orders.find(o => o.status === 'COMPLETED');
      let recentReview = null;
      products.forEach(p => { const rev = p.reviews?.find(r => r.userName === userProfile.name); if (rev) recentReview = rev; });
      const isInactive = !lastOrder || (new Date().getTime() - new Date(lastOrder.date).getTime() > 90 * 24 * 60 * 60 * 1000);

      const greeting = await generateSmartGreeting({ customerName: userProfile.name, activeOrder, lastOrder, recentReview, priorityProduct, isInactive });
      
      const aiMsg: ChatMessage = {
        id: `admin-${Date.now()}`,
        senderId: 'admin',
        senderName: 'Bếp Mian (AI)',
        text: `${phoneId}->${greeting}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        isRead: false
      };
      
      await storage.saveMessage(aiMsg);
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    };
    initChat();
  }, [isAdmin, userProfile, phoneId]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMsg: ChatMessage = {
      id: `${isAdmin ? 'admin' : 'cust'}-${Date.now()}`,
      senderId: isAdmin ? 'admin' : phoneId,
      senderName: isAdmin ? 'Bếp Mian' : userProfile.name,
      text: isAdmin ? `${phoneId}->${msg}` : msg,
      time: timeStr,
      timestamp: Date.now(),
      isRead: false
    };

    await storage.saveMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
    setMsg('');

    if (!isAdmin) {
      setIsTyping(true);
      setTimeout(async () => {
        const reply: ChatMessage = {
          id: `admin-${Date.now()}`,
          senderId: 'admin',
          senderName: 'Bếp Mian',
          text: `${phoneId}->Dạ shop đã nhận được tin nhắn! Chị chờ em một xíu em vào tiếp chị ngay nhé ❤️`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          isRead: false
        };
        await storage.saveMessage(reply);
        setMessages(prev => [...prev, reply]);
        setIsTyping(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-950 max-w-md mx-auto relative">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 border-b dark:border-zinc-800 flex items-center gap-3">
        <button onClick={() => onNavigate(CustomerScreen.HOME)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">{isAdmin ? phoneId[0] : 'M'}</div>
          <div>
            <h3 className="font-bold text-sm">{isAdmin ? `Khách: ${phoneId}` : 'Bếp bánh Mian'}</h3>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-600 font-bold uppercase">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {conversation.map(m => {
          const isOwn = isAdmin ? m.senderId === 'admin' : m.senderId !== 'admin';
          return (
            <div key={m.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-[24px] text-sm leading-relaxed ${isOwn ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-zinc-800 text-text-main dark:text-zinc-100 rounded-tl-none border'}`}>
                {m.text}
              </div>
              <span className="text-[9px] text-text-secondary mt-1">{m.time}</span>
            </div>
          );
        })}
        {isTyping && <div className="p-4 bg-white rounded-2xl w-max animate-pulse">...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t flex gap-2 pb-safe">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Nhập tin nhắn..." className="flex-1 h-12 bg-gray-100 rounded-2xl px-5 text-sm outline-none" />
        <button onClick={handleSend} disabled={!msg.trim()} className={`size-12 rounded-2xl flex items-center justify-center ${msg.trim() ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}><span className="material-symbols-outlined">send</span></button>
      </div>
    </div>
  );
};

export default CustomerChat;
