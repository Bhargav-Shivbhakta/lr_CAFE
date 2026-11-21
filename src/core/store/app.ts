import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, Order, User } from '../services/types';
import { safeJSONStorage } from './safeStorage';
import { appConfig } from '../config/flags';

/**
 * Global app state. Keep it small: only things several features share.
 * Feature-private state belongs inside the feature folder.
 */
interface AppState {
  user: User | null;
  signUp: (u: User) => void;
  signOut: () => void;
  locationId: string;
  mode: 'pickup' | 'delivery';
  cart: CartLine[];
  orders: Order[];
  points: number;
  streakWeeks: number;
  favorites: string[];
  usual?: CartLine;
  setLocation: (id: string) => void;
  setMode: (m: 'pickup' | 'delivery') => void;
  addToCart: (line: Omit<CartLine, 'key'>) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  recordOrder: (o: Order) => void;
  toggleFavorite: (itemId: string) => void;
  redeem: (points: number) => void;
}

const sameLine = (a: Omit<CartLine, 'key'>, b: CartLine) =>
  a.itemId === b.itemId && a.optionLabel === b.optionLabel && (a.note ?? '') === (b.note ?? '');

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      locationId: 'sdsu',
      mode: 'pickup',
      cart: [],
      orders: [],
      user: null,
      points: 0,
      streakWeeks: 0,
      favorites: [],
      usual: undefined,
      // Real perk from the café's program: 10 points just for signing up.
      signUp: (user) => set((s) => ({ user, points: s.user ? s.points : s.points + appConfig.signUpBonus })),
      signOut: () => set({ user: null, points: 0, streakWeeks: 0, orders: [], favorites: [], usual: undefined, cart: [] }),
      setLocation: (locationId) => set({ locationId }),
      setMode: (mode) => set({ mode }),
      addToCart: (line) => set((s) => {
        const existing = s.cart.find((l) => sameLine(line, l));
        if (existing) return { cart: s.cart.map((l) => (l === existing ? { ...l, qty: l.qty + line.qty } : l)) };
        return { cart: [...s.cart, { ...line, key: `${line.itemId}-${Date.now()}` }] };
      }),
      setQty: (key, qty) => set((s) => ({ cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)) })),
      clearCart: () => set({ cart: [] }),
      recordOrder: (o) => set((s) => ({
        orders: [o, ...s.orders].slice(0, 30),
        points: s.points + o.pointsEarned,
        streakWeeks: Math.max(1, s.streakWeeks),
        usual: o.lines[0] ? { ...o.lines[0], qty: 1, key: 'usual' } : s.usual,
      })),
      toggleFavorite: (id) => set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),
      redeem: (p) => set((s) => ({ points: Math.max(0, s.points - p) })),
    }),
    { name: 'living-room-app', storage: safeJSONStorage, version: 2, migrate: () => ({}) as AppState },
  ),
);

/* ---------- derived helpers ---------- */
export const cartCount = (cart: CartLine[]) => cart.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = (cart: CartLine[]) => cart.reduce((n, l) => n + l.unitPrice * l.qty, 0);
export const money = (n: number) => `$${n.toFixed(2)}`;

export function isHappyHour(d = new Date()) {
  const { days, start, end } = appConfig.happyHours;
  const mins = d.getHours() * 60 + d.getMinutes();
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return days.includes(d.getDay()) && mins >= toMin(start) && mins <= toMin(end);
}
export const pointsFor = (amount: number) =>
  Math.floor(amount * appConfig.pointsPerDollar * (isHappyHour() ? appConfig.happyHours.multiplier : 1));

export function tierFor(points: number) {
  const tiers = appConfig.tiers;
  let i = 0;
  tiers.forEach((t, idx) => { if (points >= t.minPoints) i = idx; });
  return { tier: tiers[i], next: tiers[i + 1] };
}
export const nextReward = (points: number) => appConfig.rewards.find((r) => r.points > points) ?? null;
