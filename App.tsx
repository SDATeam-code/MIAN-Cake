
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { AppRole, CustomerScreen, AdminScreen, UserProfile, Product, Order, AdminSettings } from './types';
import { storage } from './storageService';
import CustomerHome from './screens/CustomerHome';
import CustomerTracking from './screens/CustomerTracking';
import CustomerProfileScreen from './screens/CustomerProfile';
import CustomerProductDetail from './screens/CustomerProductDetail';
import CustomerChat from './screens/CustomerChat';
import AdminDashboard from './screens/AdminDashboard';
import AdminOrders from './screens/AdminOrders';
import AdminAISales from './screens/AdminAISales';
import AdminAddProduct from './screens/AdminAddProduct';
import AdminReports from './screens/AdminReports';
import AdminSettingsScreen from './screens/AdminSettings';
import AdminProductsList from './screens/AdminProductsList';
import AdminAddOrderManual from './screens/AdminAddOrderManual';

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

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('Pa$$w0rd');
  const [inputPass, setInputPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>(CustomerScreen.HOME);
  const [adminScreen, setAdminScreen] = useState<AdminScreen>(AdminScreen.DASHBOARD);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [batchProductIds, setBatchProductIds] = useState<string[]>(['1']);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Load data from Storage on mount
  useEffect(() => {
    const initData = async () => {
      const storedProducts = await storage.getProducts();
      if (storedProducts.length > 0) {
        setProducts(storedProducts);
      } else {
        // Seed initial data if empty
        for (const p of INITIAL_PRODUCTS) {
          await storage.saveProduct(p);
        }
        setProducts(INITIAL_PRODUCTS);
      }
      const storedOrders = await storage.getOrders();
      setOrders(storedOrders);
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

  const handleCreateOrder = async (productId: string, qty: number = 1, overrideProfile?: Partial<Order>) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newOrder: Order = {
      id: `#DH${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: overrideProfile?.customerName || userProfile.name,
      customerPhone: overrideProfile?.customerPhone || userProfile.phone,
      productName: product.name,
      productImage: product.image,
      status: overrideProfile?.status || 'BAKING',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: product.price,
      quantity: qty,
      address: overrideProfile?.address || (userProfile.selectedAddress === 'fixed' ? userProfile.fixedAddress : userProfile.tempAddress),
      date: new Date().toISOString().split('T')[0],
      ...overrideProfile
    };

    await storage.saveOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    
    if (role === AppRole.CUSTOMER) {
      alert('Đơn hàng đã được Bếp Mian ghi nhận và đang chuẩn bị!');
    }
  };

  const handleUpdateProduct = async (newProducts: Product[]) => {
    // Note: In a real app we'd save individual products to be more efficient
    // But for this state management, we just update the list and let children handle storage calls
    setProducts(newProducts);
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

  const renderScreen = () => {
    if (role === AppRole.CUSTOMER) {
      switch (customerScreen) {
        case CustomerScreen.HOME: return <CustomerHome onNavigate={setCustomerScreen} userProfile={userProfile} products={sortedProducts} bakeryPhone={settings.bakeryPhone} onSelectProduct={(id) => { setSelectedProductId(id); setCustomerScreen(CustomerScreen.PRODUCT_DETAIL); }} onAddToCart={(id) => handleCreateOrder(id)} />;
        case CustomerScreen.PRODUCT_DETAIL: const p = products.find(x => x.id === selectedProductId) || products[0]; return <CustomerProductDetail product={p} onNavigate={setCustomerScreen} onAddToCart={(id) => handleCreateOrder(id)} />;
        case CustomerScreen.ORDERS: return <CustomerTracking onNavigate={setCustomerScreen} orders={orders.filter(o => o.customerName === userProfile.name)} />;
        case CustomerScreen.CHAT: return <CustomerChat 
          onNavigate={setCustomerScreen} 
          userProfile={userProfile} 
          orders={orders.filter(o => o.customerName === userProfile.name)}
          products={products}
          priorityProduct={products.find(p => p.id === batchProductIds[0])}
        />;
        case CustomerScreen.PROFILE: return <CustomerProfileScreen userProfile={userProfile} setUserProfile={setUserProfile} onNavigate={setCustomerScreen} onLogout={logout} />;
        default: return null;
      }
    } else {
      if (!isAdminAuthenticated) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background-light">
            <div className="size-20 bg-[#FDF2E9] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-orange-100/50">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
            <h2 className="text-xl font-black mb-1">Xác thực chủ tiệm</h2>
            <p className="text-xs text-text-secondary mb-8">Vui lòng nhập mật khẩu để quản lý</p>
            <div className="w-full space-y-4">
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  value={inputPass} 
                  onChange={e => setInputPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 pr-14 text-center font-black text-xl tracking-widest outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined">{showPass ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              <button onClick={handleAdminLogin} className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all">Tiếp Tục</button>
              <button onClick={() => setRole(null)} className="w-full h-14 bg-gray-100 text-text-secondary rounded-2xl font-bold">Quay Lại</button>
            </div>
          </div>
        );
      }
      switch (adminScreen) {
        case AdminScreen.DASHBOARD: 
          const pendingCount = orders.filter(o => o.status === 'PENDING' || o.status === 'BAKING').length;
          return <AdminDashboard onNavigate={setAdminScreen} onLogout={logout} newOrderCount={pendingCount} products={products} orders={orders} batchProductIds={batchProductIds} setBatchProductIds={setBatchProductIds} />;
        case AdminScreen.ORDERS: return <AdminOrders onNavigate={setAdminScreen} orders={orders} setOrders={async (newOrders) => { 
          // If setOrders is called as a function, handle it
          const updated = typeof newOrders === 'function' ? newOrders(orders) : newOrders;
          setOrders(updated);
          // Sync with storage for any status changes
          for (const o of updated) await storage.saveOrder(o);
        }} />;
        case AdminScreen.ADD_ORDER_MANUAL: return <AdminAddOrderManual onNavigate={setAdminScreen} products={products} onCreateOrder={(prodId, qty, extra) => handleCreateOrder(prodId, qty, extra)} />;
        case AdminScreen.AI_SALES: return <AdminAISales onNavigate={setAdminScreen} userProfile={userProfile} />;
        case AdminScreen.PRODUCTS_LIST: 
          return <AdminProductsList 
            onNavigate={setAdminScreen} 
            products={products} 
            onDelete={async (id) => { 
              await storage.deleteProduct(id);
              setProducts(products.filter(p => p.id !== id));
            }} 
            onEdit={(p) => { setEditingProduct(p); setAdminScreen(AdminScreen.ADD_PRODUCT); }}
          />;
        case AdminScreen.ADD_PRODUCT: 
          return <AdminAddProduct 
            onNavigate={setAdminScreen} 
            setProducts={setProducts} 
            editProduct={editingProduct} 
            onClose={() => setEditingProduct(undefined)}
          />;
        case AdminScreen.REPORTS: return <AdminReports onNavigate={setAdminScreen} orders={orders} />;
        case AdminScreen.SETTINGS: return <AdminSettingsScreen settings={settings} setSettings={setSettings} onNavigate={setAdminScreen} />;
        default: return null;
      }
    }
  };

  if (!role) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background-light flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="size-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-orange-100">
            <span className="material-symbols-outlined text-4xl">bakery_dining</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-main">Bếp bánh Mian</h1>
        </div>
        <div className="w-full space-y-4">
          <button onClick={() => setRole(AppRole.CUSTOMER)} className="w-full bg-white p-6 rounded-3xl shadow-soft flex items-center gap-4 border border-primary/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary text-3xl">person</span>
            <div className="text-left"><p className="font-bold text-text-main">Khách hàng</p><p className="text-xs text-text-secondary">Đặt bánh & Theo dõi đơn</p></div>
          </button>
          <button onClick={() => setRole(AppRole.ADMIN)} className="w-full bg-[#FDF2E9] p-6 rounded-3xl shadow-lg shadow-orange-50 flex items-center gap-4 border border-orange-100/30 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
            <div className="text-left"><p className="font-bold text-text-main">Chủ tiệm</p><p className="text-xs text-text-secondary opacity-80">Quản lý cửa hàng</p></div>
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
