import { createJSONStorage } from 'zustand/middleware';

// localStorage can be missing or throw (private mode, embedded previews). Fall back to memory.
const mem = new Map<string, string>();
const safe = {
  getItem: (k: string) => { try { return localStorage.getItem(k); } catch { return mem.get(k) ?? null; } },
  setItem: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { mem.set(k, v); } },
  removeItem: (k: string) => { try { localStorage.removeItem(k); } catch { mem.delete(k); } },
};
export const safeJSONStorage = createJSONStorage(() => safe);
