
import React, { useState, useMemo, useEffect } from 'react';
import { AdminScreen, Product, Order, OrderItem } from '../types';

interface Props {
  onNavigate: (s: AdminScreen) => void;
  products: Product[];
  orders: Order[]; // Cần dữ liệu orders để làm danh bạ
  onCreateOrder: (items: OrderItem[], extra: Partial<Order>) => void;
}

const AdminAddOrderManual: React.FC<Props> = ({ onNavigate, products, orders, onCreateOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('Giao tại quầy');
  const [notes, setNotes] = useState('');
  const [shippingFee, setShippingFee] = useState('0');
  
  const [selectedItems, setSelectedItems] = useState<{ productId: string, quantity: number }[]>([]);
  const [currentSelectedId, setCurrentSelectedId] = useState(products[0]?.id || '');

  // Xử lý danh bạ khách hàng từ orders
  const contacts = useMemo(() => {
    const contactMap = new Map<string, Set<string>>();
    orders.forEach(o => {
      const name = o.customerName.trim();
      const phone = o.customerPhone?.trim();
      if (name && phone) {
        if (!contactMap.has(name)) contactMap.set(name, new Set());
        contactMap.get(name)?.add(phone);
      }
    });
    return Array.from(contactMap.entries()).map(([name, phones]) => ({
      name,
      phones: Array.from(phones)
    }));
  }, [orders]);

  const [suggestedContacts, setSuggestedContacts] = useState<{ name: string, phones: string[] }[]>([]);
  const [showPhonePicker, setShowPhonePicker] = useState<string[] | null>(null);

  useEffect(() => {
    if (customerName.length >= 2) {
      const matches = contacts.filter(c => 
        c.name.toLowerCase().includes(customerName.toLowerCase())
      );
      setSuggestedContacts(matches);
    } else {
      setSuggestedContacts([]);
    }
  }, [customerName, contacts]);

  const selectContact = (contact: { name: string, phones: string[] }) => {
    setCustomerName(contact.name);
    if (contact.phones.length === 1) {
      setCustomerPhone(contact.phones[0]);
    } else {
      setShowPhonePicker(contact.phones);
    }
    setSuggestedContacts([]);
  };

  const addItem = () => {
    const product = products.find(p => p.id === currentSelectedId);
    if (!product) return;

    setSelectedItems(prev => {
      const existing = prev.find(i => i.productId === currentSelectedId);
      if (existing) {
        return prev.map(i => i.productId === currentSelectedId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: currentSelectedId, quantity: 1 }];
    });
  };

  const updateItemQty = (id: string, delta: number) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.productId === id) return { ...i, quantity: Math.max(0, i.quantity + delta) };
      return i;
    }).filter(i => i.quantity > 0));
  };

  const subtotal = selectedItems.reduce((sum, item) => {
    const p = products.find(x => x.id === item.productId);
    return sum + (p?.price || 0) * item.quantity;
  }, 0);

  const totalPrice = subtotal + (parseInt(shippingFee) || 0);

  const handleCreateOrder = () => {
    if (!customerName) {
      alert('Vui lòng nhập tên khách!');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Chị chưa chọn loại bánh nào ạ!');
      return;
    }

    const finalItems: OrderItem[] = selectedItems.map(item => {
      const p = products.find(x => x.id === item.productId)!;
      return {
        productName: p.name,
        productImage: p.image,
        price: p.price,
        quantity: item.quantity
      };
    });

    onCreateOrder(finalItems, {
      customerName,
      customerPhone,
      address,
      notes,
      shippingFee: parseInt(shippingFee) || 0,
      totalPrice: totalPrice,
      status: 'PENDING'
    });
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-zinc-950 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 border-b dark:border-zinc-800 flex items-center">
        <button onClick={() => onNavigate(AdminScreen.ORDERS)} className="size-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center text-lg font-bold pr-10">Thêm Đơn Thủ Công</h2>
      </header>

      <div className="p-4 flex flex-col gap-6">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] shadow-soft border dark:border-zinc-800 space-y-4 relative">
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Tên khách hàng (Có gợi ý từ danh bạ)</label>
            <input 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" 
              placeholder="VD: Cô Lan..." 
            />
            {suggestedContacts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border dark:border-zinc-700 z-[110] overflow-hidden">
                {suggestedContacts.map(c => (
                  <button 
                    key={c.name} 
                    onClick={() => selectContact(c)}
                    className="w-full p-4 text-left hover:bg-primary-light dark:hover:bg-zinc-700 flex justify-between items-center border-b dark:border-zinc-700 last:border-none"
                  >
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-[10px] text-text-secondary">{c.phones.length} số điện thoại</p>
                    </div>
                    <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Số điện thoại</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none" placeholder="VD: 0912..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest">Địa chỉ giao hàng</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none" placeholder="Nhập địa chỉ..." />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] shadow-soft border dark:border-zinc-800">
          <h3 className="text-[10px] font-black text-text-secondary uppercase mb-4 px-1 tracking-widest">Chọn nhiều bánh</h3>
          
          <div className="flex gap-2 mb-6">
            <select 
              value={currentSelectedId} 
              onChange={e => setCurrentSelectedId(e.target.value)}
              className="flex-1 h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-bold outline-none"
            >
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={addItem} className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="space-y-3">
            {selectedItems.map(item => {
              const p = products.find(x => x.id === item.productId)!;
              return (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                  <img src={p.image} className="size-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    <p className="text-[10px] font-black text-primary">{(p.price * item.quantity).toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl px-1">
                    <button onClick={() => updateItemQty(item.productId, -1)} className="size-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                    <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateItemQty(item.productId, 1)} className="size-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[18px]">add</span></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] shadow-soft border dark:border-zinc-800">
          <label className="text-[10px] font-black text-text-secondary uppercase px-1 tracking-widest block mb-2">Phí ship (điền tay)</label>
          <div className="relative">
            <input 
              type="number" 
              value={shippingFee} 
              onChange={e => setShippingFee(e.target.value)} 
              className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl px-4 font-black text-primary outline-none" 
              placeholder="0" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-secondary">VNĐ</span>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-[32px] text-white flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">TỔNG THANH TOÁN</p>
            <p className="text-2xl font-black">{totalPrice.toLocaleString()}đ</p>
          </div>
          <button onClick={handleCreateOrder} className="h-12 px-6 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">TẠO ĐƠN</button>
        </div>
      </div>

      {showPhonePicker && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-2xl">
            <h3 className="text-lg font-black mb-4 text-center">Chọn số điện thoại</h3>
            <div className="space-y-3">
              {showPhonePicker.map(p => (
                <button 
                  key={p} 
                  onClick={() => { setCustomerPhone(p); setShowPhonePicker(null); }}
                  className="w-full h-12 bg-gray-50 dark:bg-zinc-800 rounded-2xl font-bold hover:bg-primary hover:text-white transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => setShowPhonePicker(null)} className="w-full mt-6 text-sm font-bold text-text-secondary uppercase tracking-widest">Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddOrderManual;
