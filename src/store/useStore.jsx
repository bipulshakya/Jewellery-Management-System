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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'jerp_api_token';
const THEME_STORAGE_KEY = 'jerp_theme';
const AUTH_EVENT_NAME = 'jerp-auth-changed';

const RESOURCE_ENDPOINTS = {
  inventory: '/api/inventory',
  customers: '/api/customers',
  suppliers: '/api/suppliers',
  sales: '/api/sales',
  repairs: '/api/repairs',
  orders: '/api/orders',
  metalRates: '/api/settings/metal-rates',
  storeInfo: '/api/settings/store-info',
};

const ARRAY_RESOURCES = new Set(['inventory', 'customers', 'suppliers', 'sales', 'repairs', 'orders']);

const DEFAULTS = {
  inventory: SAMPLE_INVENTORY,
  customers: SAMPLE_CUSTOMERS,
  suppliers: SAMPLE_SUPPLIERS,
  sales: SAMPLE_SALES,
  repairs: SAMPLE_REPAIRS,
  orders: SAMPLE_ORDERS,
  metalRates: METAL_RATES,
  storeInfo: STORE_INFO,
};

let authPromise = null;

function readToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function writeToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

async function apiRequest(endpoint, options = {}, authOptions = {}) {
  const token = readToken();
  if (!token && authOptions.requiresAuth !== false) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

const AuthContext = createContext();

async function fetchCurrentUser() {
  return apiRequest('/auth/me');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshAuth = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setUser(null);
      setAuthError(null);
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);
    try {
      const result = await fetchCurrentUser();
      setUser(result.user || null);
      setAuthError(null);
    } catch (error) {
      clearToken();
      setUser(null);
      setAuthError(error.message || 'Unable to restore session');
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const handleAuthChanged = () => {
      refreshAuth();
    };
    window.addEventListener(AUTH_EVENT_NAME, handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, [refreshAuth]);

  const login = useCallback(async (username, password) => {
    if (!authPromise) {
      authPromise = apiRequest(
        '/auth/login',
        {
          method: 'POST',
          body: { username, password },
        },
        { requiresAuth: false },
      ).finally(() => {
        authPromise = null;
      });
    }

    const result = await authPromise;
    writeToken(result.token);
    setUser(result.user || null);
    setAuthError(null);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        authError,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
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
  const endpoint = RESOURCE_ENDPOINTS[key];
  const defaultValue = DEFAULTS[key] ?? [];
  const [data, setData] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(Boolean(endpoint));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!endpoint) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(endpoint);
      setData(response ?? defaultValue);
    } catch (err) {
      setError(err.message);
      setData(defaultValue);
    } finally {
      setIsLoading(false);
    }
  }, [defaultValue, endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (item) => {
    if (!endpoint || !ARRAY_RESOURCES.has(key)) {
      throw new Error(`Add operation is not supported for ${key}`);
    }
    const created = await apiRequest(endpoint, { method: 'POST', body: item });
    setData((prev) => [...prev, created]);
    return created;
  }, [endpoint, key]);

  const update = useCallback(async (id, updates) => {
    if (!endpoint) {
      throw new Error(`Update operation is not supported for ${key}`);
    }

    if (ARRAY_RESOURCES.has(key)) {
      const updated = await apiRequest(`${endpoint}/${id}`, { method: 'PATCH', body: updates });
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    }

    const updatedSettings = await apiRequest(endpoint, { method: 'PATCH', body: updates });
    setData(updatedSettings);
    return updatedSettings;
  }, [endpoint, key]);

  const remove = useCallback(async (id) => {
    if (!endpoint || !ARRAY_RESOURCES.has(key)) {
      throw new Error(`Remove operation is not supported for ${key}`);
    }
    await apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });
    setData((prev) => prev.filter((item) => item.id !== id));
  }, [endpoint, key]);

  const getById = useCallback((id) => {
    if (!Array.isArray(data)) return null;
    return data.find(item => item.id === id);
  }, [data]);

  return { data, setData, add, update, remove, getById, isLoading, error, reload: load };
}

// Theme hook
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  });

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
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
