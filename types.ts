
export enum AppRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum CustomerScreen {
  HOME = 'HOME',
  CART = 'CART',
  ORDERS = 'ORDERS',
  PROFILE = 'PROFILE',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CHAT = 'CHAT'
}

export enum AdminScreen {
  DASHBOARD = 'DASHBOARD',
  ORDERS = 'ORDERS',
  ADD_ORDER_MANUAL = 'ADD_ORDER_MANUAL',
  PRODUCTS_LIST = 'PRODUCTS_LIST',
  ADD_PRODUCT = 'ADD_PRODUCT',
  EDIT_PRODUCT = 'EDIT_PRODUCT',
  AI_SALES = 'AI_SALES',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

export interface AdminSettings {
  bakeryPhone: string;
  adminEmail: string;
  autoReportFrequency: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
}

export interface UserProfile {
  name: string;
  age: string;
  phone: string;
  fixedAddress: string;
  tempAddress: string;
  selectedAddress: 'fixed' | 'temp';
  avatar?: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  targetQty: number; // Số lượng đủ cho 1 mẻ
  isBestSeller?: boolean;
  isNew?: boolean;
  videoUrl?: string;
  articleLinks?: { title: string; url: string }[];
  reviews?: ProductReview[];
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string; // Số điện thoại khách
  productName: string;
  productImage: string;
  status: 'PENDING' | 'BAKING' | 'ROASTING' | 'DELIVERING' | 'COMPLETED';
  time: string;
  price: number;
  quantity: number;
  notes?: string;
  address: string;
  date: string; 
  eta?: string;
  trackingLink?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Batch {
  id: string;
  name: string;
  image: string;
  currentOrders: number;
  targetOrders: number;
  status: string;
  date: string;
}

export interface LoyalCustomer {
  id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
}
