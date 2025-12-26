
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { AppRole, CustomerScreen, AdminScreen, UserProfile, Product, Order, AdminSettings, ChatMessage, OrderItem } from './types';
import { storage } from './storageService';
import CustomerHome from './screens/CustomerHome';
import CustomerTracking from './screens/CustomerTracking';
import CustomerProfileScreen from './screens/CustomerProfile';
import CustomerProductDetail from './screens/CustomerProductDetail';
import CustomerChat from './screens/CustomerChat';
import CustomerCart from './screens/CustomerCart'; 
import AdminDashboard from './screens/AdminDashboard';
import AdminOrders from './screens/AdminOrders';
import AdminAISales from './screens/AdminAISales';
import AdminAddProduct from './screens/AdminAddProduct';
import AdminReports from './screens/AdminReports';
import AdminSettingsScreen from './screens/AdminSettings';
import AdminProductsList from './screens/AdminProductsList';
import AdminAddOrderManual from './screens/AdminAddOrderManual';
import AdminChangePassword from './screens/AdminChangePassword';
import AdminChatList from './screens/AdminChatList';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bánh Mì Phô Mai Chảy',
    description: 'Vỏ bánh mềm mịn, nhân kem phô mai béo ngậy tan chảy từ bên trong.',
    price: 45000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAM2QkUSnwc9AlqUQZnuj8FoxBo3VLMpARJq0N3Qy9zRBI5tQJL6vW1BqBQmK5Ww4GT9Bba4jJ3USuLP1xadMx9xG7l5L-3esZjGnI2-Js96AzQwVwwBeRgrqsPUlzBmb4_xEwmPs42YsNjgaz58cVTuCUl8GjoiWfEWN6BzQbvn2TY_e0R066oBb7f7iJ0ELbKtwDeYhs5AozeJ3BAREpBjbNSl5V_QVR8qjVoRtO116NsYQvb74pu1vkOFCpOBwgDufjg_Wr38rs',
    category: 'Mặn',
    targetQty: 10,
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Bánh Kem Dâu Tây',
    description: 'Cốt bông lan mềm ẩm, kết hợp cùng dâu tây Đà Lạt chín mọng.',
    price: 55000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLF4Gz_LwietniJ3ZxLmbo_shibTs1HK86Hz1i_IccbwdpLDOSBftqF-g6_uharhzBcdJvVOIvveCP43coH0RAkX4kSGkHIC7XREF6CllwJJDSYIQZ2_BVEvpDyfNz8NF2iI6mcheVrU4aKrFSzLISBCIDsC7cBaffc3f_6o3ubsGWXhLC_SRAE-8dvyvRTrjvxXB_MVKRKlUaK3SNCaGaTIiphyUc4p21Lt2bgr5-oIOFWwZbZFPmZuxVIhaMjLYBtohC7x2IM6I',
    category: 'Ngọt',
    targetQty: 5,
    isNew: true
  }
];

interface CartItem {
  productId: string;
  quantity: number;
}

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('Pa$$w0rd');
  const [inputPass, setInputPass] = useState('');
  
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>(CustomerScreen.HOME);
  const [adminScreen, setAdminScreen] = useState<AdminScreen>(AdminScreen.DASHBOARD);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]); 
  const [batchProductIds, setBatchProductIds] = useState<string[]>(['1']);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [chatTarget, setChatTarget] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      const storedProducts = await storage.getProducts();
      if (storedProducts.length > 0) {
        setProducts(storedProducts);
      } else {
        for (const p of INITIAL_PRODUCTS) await storage.saveProduct(p);
        setProducts(INITIAL_PRODUCTS);
      }
      setOrders(await storage.getOrders());
      setMessages(await storage.getMessages());
    };
    initData();
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aInBatch = batchProductIds.includes(a.id);
      const bInBatch = batchProductIds.includes(b.id);
      if (aInBatch && !bInBatch) return -1;
      if (!aInBatch && bInBatch) return 1;
      return 0;
    });
  }, [products, batchProductIds]);

  const [settings, setSettings] = useState<AdminSettings>({
    bakeryPhone: '0866442283',
    adminEmail: 'lamson.nguyen77@gmail.com',
    autoReportFrequency: 'MONTHLY'
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Minh Anh',
    age: '24',
    phone: '0901234567',
    fixedAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    tempAddress: 'Công ty ABC, 456 Võ Văn Tần, Quận 3',
    selectedAddress: 'fixed',
    avatar: 'https://picsum.photos/200/200?person=1'
  });

  const addToCart = (productId: string, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { productId, quantity: qty }];
    });
  };

  const updateCartItemQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleCheckout = async (cartItems: { product: Product, quantity: number }[], shippingInfo: { address: string, notes: string }) => {
    const orderItems: OrderItem[] = cartItems.map(item => ({
      productName: item.product.name,
      productImage: item.product.image,
      price: item.product.price,
      quantity: item.quantity
    }));

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder: Order = {
      id: `#DH${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      items: orderItems,
      status: 'PENDING',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalPrice: total,
      address: shippingInfo.address,
      notes: shippingInfo.notes,
      date: new Date().toISOString().split('T')[0]
    };

    await storage.saveOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setCustomerScreen(CustomerScreen.ORDERS);
    alert('Bếp Mi An đã nhận đơn gộp của bạn rồi ạ!');
  };

  const handleAdminLogin = () => {
    if (inputPass === adminPassword) {
      setIsAdminAuthenticated(true);
      setInputPass('');
    } else {
      alert('Mật khẩu không chính xác!');
    }
  };

  const logout = () => {
    setRole(null);
    setIsAdminAuthenticated(false);
    setCustomerScreen(CustomerScreen.HOME);
    setAdminScreen(AdminScreen.DASHBOARD);
  };

  const renderScreen = () => {
    if (role === AppRole.CUSTOMER) {
      const unreadByAdmin = messages.filter(m => m.senderId === 'admin' && !m.isRead).length;
      switch (customerScreen) {
        case CustomerScreen.HOME: 
          return <CustomerHome 
            unreadCount={unreadByAdmin} 
            onNavigate={setCustomerScreen} 
            userProfile={userProfile} 
            products={sortedProducts} 
            bakeryPhone={settings.bakeryPhone} 
            onSelectProduct={(id) => { setSelectedProductId(id); setCustomerScreen(CustomerScreen.PRODUCT_DETAIL); }} 
            onAddToCart={(id) => addToCart(id)} 
            cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
          />;
        case CustomerScreen.PRODUCT_DETAIL: 
          const p = products.find(x => x.id === selectedProductId) || products[0]; 
          return <CustomerProductDetail 
            product={p} 
            userProfile={userProfile} 
            onNavigate={setCustomerScreen} 
            onAddToCart={(id, qty) => addToCart(id, qty)} 
            onUpdateProduct={handleUpdateProduct} 
          />;
        case CustomerScreen.CART:
          return <CustomerCart 
            cartItems={cart.map(i => ({ product: products.find(p => p.id === i.productId)!, quantity: i.quantity }))}
            onUpdateQty={updateCartItemQty}
            userProfile={userProfile}
            onCheckout={handleCheckout}
            onNavigate={setCustomerScreen}
          />;
        case CustomerScreen.ORDERS: return <CustomerTracking onNavigate={setCustomerScreen} orders={orders.filter(o => o.customerPhone === userProfile.phone)} />;
        case CustomerScreen.CHAT: return <CustomerChat onNavigate={setCustomerScreen} userProfile={userProfile} orders={orders.filter(o => o.customerPhone === userProfile.phone)} products={products} priorityProduct={products.find(p => p.id === batchProductIds[0])} messages={messages} setMessages={setMessages} />;
        case CustomerScreen.PROFILE: return <CustomerProfileScreen userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={setCustomerScreen} onLogout={logout} orders={orders.filter(o => o.customerPhone === userProfile.phone)} />;
        default: return null;
      }
    } else {
      // ADMIN SECTION
      if (!isAdminAuthenticated) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background-light">
            <div className="size-20 bg-[#FDF2E9] rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
            <h2 className="text-xl font-black mb-1">Xác thực chủ tiệm</h2>
            <div className="w-full space-y-4 mt-8">
              <input type="password" value={inputPass} onChange={e => setInputPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} className="w-full h-14 bg-white border rounded-2xl px-5 text-center font-black text-xl tracking-widest outline-none" placeholder="••••••" />
              <button onClick={handleAdminLogin} className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg">Tiếp Tục</button>
              <button onClick={() => setRole(null)} className="w-full h-14 bg-gray-100 text-text-secondary rounded-2xl font-bold">Quay Lại</button>
            </div>
          </div>
        );
      }
      switch (adminScreen) {
        case AdminScreen.DASHBOARD: return <AdminDashboard onNavigate={setAdminScreen} onLogout={logout} products={products} orders={orders} batchProductIds={batchProductIds} setBatchProductIds={setBatchProductIds} messages={messages} />;
        case AdminScreen.ORDERS: return <AdminOrders onNavigate={setAdminScreen} orders={orders} setOrders={async (newOrders) => { const updated = typeof newOrders === 'function' ? newOrders(orders) : newOrders; setOrders(updated); for (const o of updated) await storage.saveOrder(o); }} onOpenChat={(phone) => { setChatTarget(phone); setAdminScreen(AdminScreen.CHAT_DETAIL); }} />;
        case AdminScreen.ADD_ORDER_MANUAL: return <AdminAddOrderManual onNavigate={setAdminScreen} products={products} orders={orders} onCreateOrder={(items, extra) => {
          const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
          const newOrder: Order = {
            id: `#DH${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: extra.customerName || 'Khách vãng lai',
            customerPhone: extra.customerPhone,
            items: items,
            totalPrice: total,
            status: 'PENDING',
            address: extra.address || 'Tại quầy',
            notes: extra.notes,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0]
          };
          storage.saveOrder(newOrder).then(() => {
            setOrders(prev => [newOrder, ...prev]);
            setAdminScreen(AdminScreen.ORDERS);
          });
        }} />;
        case AdminScreen.CHAT_LIST: return <AdminChatList onNavigate={setAdminScreen} messages={messages} onSelectChat={(phone) => { setChatTarget(phone); setAdminScreen(AdminScreen.CHAT_DETAIL); }} />;
        case AdminScreen.CHAT_DETAIL: return <CustomerChat isAdmin targetCustomerPhone={chatTarget || undefined} onNavigate={(s: any) => setAdminScreen(AdminScreen.CHAT_LIST)} userProfile={userProfile} orders={orders} products={products} messages={messages} setMessages={setMessages} />;
        case AdminScreen.PRODUCTS_LIST: return <AdminProductsList onNavigate={setAdminScreen} products={products} onDelete={async (id) => { await storage.deleteProduct(id); setProducts(products.filter(p => p.id !== id)); }} onEdit={(p) => { setEditingProduct(p); setAdminScreen(AdminScreen.ADD_PRODUCT); }} />;
        case AdminScreen.ADD_PRODUCT: return <AdminAddProduct onNavigate={setAdminScreen} setProducts={setProducts} editProduct={editingProduct} onClose={() => setEditingProduct(undefined)} />;
        case AdminScreen.REPORTS: return <AdminReports onNavigate={setAdminScreen} orders={orders} messages={messages} />;
        case AdminScreen.SETTINGS: return <AdminSettingsScreen settings={settings} setSettings={setSettings} onNavigate={setAdminScreen} />;
        case AdminScreen.CHANGE_PASSWORD: return <AdminChangePassword currentPassword={adminPassword} setPassword={setAdminPassword} onNavigate={setAdminScreen} />;
        default: return null;
      }
    }
  };

  if (!role) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background-light flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <div className="size-24 bg-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-orange-200">
            <span className="material-symbols-outlined text-5xl">bakery_dining</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-main mb-2">Bếp Mi An</h1>
          <p className="text-sm text-text-secondary font-medium">Bếp bánh của sự tử tế & ngọt ngào</p>
        </div>
        
        <div className="w-full space-y-4">
          <button onClick={() => setRole(AppRole.CUSTOMER)} className="w-full bg-white p-6 rounded-[32px] shadow-soft flex items-center gap-5 border border-primary/5 hover:border-primary/20 active:scale-[0.98] transition-all text-left">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined text-3xl">person</span></div>
            <div>
              <p className="font-black text-text-main text-lg">Khách hàng</p>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-tighter">Đặt bánh & Theo dõi lò nướng</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-gray-300">chevron_right</span>
          </button>

          <button onClick={() => setRole(AppRole.ADMIN)} className="w-full bg-[#FDF2E9] p-6 rounded-[32px] shadow-lg flex items-center gap-5 border border-orange-100/30 active:scale-[0.98] transition-all text-left">
            <div className="size-14 bg-orange-100 rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined text-3xl">storefront</span></div>
            <div>
              <p className="font-black text-text-main text-lg">Chủ tiệm</p>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-tighter">Quản lý bếp & Doanh thu</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-gray-300">chevron_right</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light shadow-2xl relative flex flex-col">
      {renderScreen()}
    </div>
  );
};

export default App;
