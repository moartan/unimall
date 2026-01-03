const STORAGE_KEY = 'unimall_order_list_cache_v1';
const TTL = 5 * 60 * 1000; // 5 minutes

let memoryCache = new Map();

// hydrate from localStorage once
(() => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      memoryCache = new Map(Object.entries(parsed));
    }
  } catch (err) {
    // ignore hydration errors
  }
})();

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj = Object.fromEntries(memoryCache);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (err) {
    // ignore persist errors
  }
};

export const buildOrdersKey = (params = {}) => JSON.stringify(params);

export const getOrdersCache = (key) => {
  if (!key) return null;
  const cached = memoryCache.get(key);
  if (!cached) return null;
  const { ts, data } = cached;
  if (!ts || Date.now() - ts > TTL) {
    memoryCache.delete(key);
    persist();
    return null;
  }
  return data;
};

export const setOrdersCache = (key, data) => {
  if (!key) return;
  memoryCache.set(key, { ts: Date.now(), data });
  persist();
};

export const clearOrdersCache = () => {
  memoryCache.clear();
  persist();
};
