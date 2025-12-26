
import { Product, Order, ChatMessage } from './types';

const DB_NAME = 'MianBakeryDB';
const DB_VERSION = 2; // Incremented version
const STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  MESSAGES: 'messages'
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
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
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
  },

  async getMessages(): Promise<ChatMessage[]> {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORES.MESSAGES, 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async saveMessage(msg: ChatMessage): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(STORES.MESSAGES, 'readwrite');
    transaction.objectStore(STORES.MESSAGES).put(msg);
  },

  async markAllReadForSender(senderId: string): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(STORES.MESSAGES, 'readwrite');
    const store = transaction.objectStore(STORES.MESSAGES);
    const request = store.getAll();
    request.onsuccess = () => {
      const msgs: ChatMessage[] = request.result;
      msgs.forEach(m => {
        if (m.senderId === senderId && !m.isRead) {
          m.isRead = true;
          store.put(m);
        }
      });
    };
  }
};
