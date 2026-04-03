// localStorage-backed store for Jewellery ERP
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  SAMPLE_INVENTORY,
  SAMPLE_CUSTOMERS,
  SAMPLE_SUPPLIERS,
  SAMPLE_SALES,
  SAMPLE_REPAIRS,
  SAMPLE_ORDERS,
  METAL_RATES,
  STORE_INFO,
} from '../data/seedData';

const STORAGE_KEYS = {
  inventory: 'jerp_inventory',
  customers: 'jerp_customers',
  suppliers: 'jerp_suppliers',
  sales: 'jerp_sales',
  repairs: 'jerp_repairs',
  orders: 'jerp_orders',
  metalRates: 'metalRates',
  storeInfo: 'jerp_storeInfo',
  theme: 'jerp_theme',
  seeded: 'jerp_seeded',
};

function getFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Seed data if first visit
function seedIfNeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.seeded)) {
    setToStorage(STORAGE_KEYS.inventory, SAMPLE_INVENTORY);
    setToStorage(STORAGE_KEYS.customers, SAMPLE_CUSTOMERS);
    setToStorage(STORAGE_KEYS.suppliers, SAMPLE_SUPPLIERS);
    setToStorage(STORAGE_KEYS.sales, SAMPLE_SALES);
    setToStorage(STORAGE_KEYS.repairs, SAMPLE_REPAIRS);
    setToStorage(STORAGE_KEYS.orders, SAMPLE_ORDERS);
    setToStorage(STORAGE_KEYS.metalRates, METAL_RATES);
    setToStorage(STORAGE_KEYS.storeInfo, STORE_INFO);
    localStorage.setItem(STORAGE_KEYS.seeded, 'true');
  }
}

// Toast context
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// Main store hook
export function useStore(key) {
  seedIfNeeded();

  const storageKey = STORAGE_KEYS[key];
  const defaults = {
    inventory: SAMPLE_INVENTORY,
    customers: SAMPLE_CUSTOMERS,
    suppliers: SAMPLE_SUPPLIERS,
    sales: SAMPLE_SALES,
    repairs: SAMPLE_REPAIRS,
    orders: SAMPLE_ORDERS,
    metalRates: METAL_RATES,
    storeInfo: STORE_INFO,
  };

  const [data, setData] = useState(() => getFromStorage(storageKey, defaults[key] || []));

  useEffect(() => {
    setToStorage(storageKey, data);
  }, [data, storageKey]);

  const add = useCallback((item) => {
    setData(prev => {
      const updated = [...prev, item];
      return updated;
    });
  }, []);

  const update = useCallback((id, updates) => {
    setData(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      return updated;
    });
  }, []);

  const remove = useCallback((id) => {
    setData(prev => {
      const updated = prev.filter(item => item.id !== id);
      return updated;
    });
  }, []);

  const getById = useCallback((id) => {
    return data.find(item => item.id === id);
  }, [data]);

  return { data, setData, add, update, remove, getById };
}

// Theme hook
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  });

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
