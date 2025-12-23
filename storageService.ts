
import { Product, Order } from './types';

const DB_NAME = 'MianBakeryDB';
const DB_VERSION = 1;
const STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders'
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storage = {
  async getProducts(): Promise<Product[]> {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORES.PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async saveProduct(product: Product): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(STORES.PRODUCTS, 'readwrite');
    transaction.objectStore(STORES.PRODUCTS).put(product);
  },

  async deleteProduct(id: string): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(STORES.PRODUCTS, 'readwrite');
    transaction.objectStore(STORES.PRODUCTS).delete(id);
  },

  async getOrders(): Promise<Order[]> {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORES.ORDERS, 'readonly');
      const store = transaction.objectStore(STORES.ORDERS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async saveOrder(order: Order): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(STORES.ORDERS, 'readwrite');
    transaction.objectStore(STORES.ORDERS).put(order);
  }
};
