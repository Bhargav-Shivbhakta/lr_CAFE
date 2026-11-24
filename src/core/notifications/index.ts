import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeJSONStorage } from '../store/safeStorage';

/**
 * Notification engine. One call — notify() — puts a notification in the inbox,
 * shows the in-app banner and, if the person allowed it, a system notification.
 * In production the same notify() payloads are sent by the server (web push / APNs / FCM).
 */
export type NoticeKind = 'order' | 'rewards' | 'cafe';
export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;   // ≤ 40 characters
  body: string;    // ≤ 110 characters
  link?: string;   // in-app route, e.g. /orders/LR1234
  createdAt: number;
  read: boolean;
}

export const LIMITS = { title: 40, body: 110, promosPerDay: 1, quietStart: 21, quietEnd: 8 } as const;

interface NotifState {
  items: Notice[];
  prefs: { rewards: boolean; cafe: boolean };   // order updates are always on
  banner: Notice | null;
  lastPromoAt: number | null;
  seenOrderStatus: Record<string, string>;
  push: (n: Notice) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissBanner: () => void;
  setPref: (k: 'rewards' | 'cafe', v: boolean) => void;
  markOrderStatus: (orderId: string, status: string) => void;
  clear: () => void;
}

export const useNotifications = create<NotifState>()(
  persist(
    (set) => ({
      items: [],
      prefs: { rewards: true, cafe: true },
      banner: null,
      lastPromoAt: null,
      seenOrderStatus: {},
      push: (n) => set((s) => ({ items: [n, ...s.items].slice(0, 50), banner: n, lastPromoAt: n.kind === 'cafe' ? n.createdAt : s.lastPromoAt })),
      markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
      markRead: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)) })),
      dismissBanner: () => set({ banner: null }),
      setPref: (k, v) => set((s) => ({ prefs: { ...s.prefs, [k]: v } })),
      markOrderStatus: (orderId, status) => set((s) => ({ seenOrderStatus: { ...s.seenOrderStatus, [orderId]: status } })),
      clear: () => set({ items: [], seenOrderStatus: {}, lastPromoAt: null }),
    }),
    { name: 'living-room-notifications', storage: safeJSONStorage, version: 1, partialize: (s) => ({ items: s.items, prefs: s.prefs, lastPromoAt: s.lastPromoAt, seenOrderStatus: s.seenOrderStatus }) as unknown as NotifState },
  ),
);

let bannerTimer: ReturnType<typeof setTimeout> | undefined;

/** Send a notification to this device. Returns false if the person switched that kind off. */
export function notify(input: { kind: NoticeKind; title: string; body: string; link?: string }): boolean {
  const st = useNotifications.getState();
  if (input.kind !== 'order' && !st.prefs[input.kind]) return false;
  const n: Notice = {
    id: `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    kind: input.kind,
    title: input.title.slice(0, LIMITS.title),
    body: input.body.slice(0, LIMITS.body),
    link: input.link,
    createdAt: Date.now(),
    read: false,
  };
  st.push(n);
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => useNotifications.getState().dismissBanner(), 4500);
  showSystemNotification(n);
  return true;
}

/* ---------- system (browser / phone) notifications ---------- */
export const systemNotificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;
export const systemPermission = (): NotificationPermission | 'unsupported' =>
  systemNotificationsSupported() ? Notification.permission : 'unsupported';

export async function askSystemPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!systemNotificationsSupported()) return 'unsupported';
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}

function showSystemNotification(n: Notice) {
  if (systemPermission() !== 'granted') return;
  try {
    const sys = new Notification(n.title, { body: n.body, tag: n.id });
    sys.onclick = () => { window.focus(); if (n.link) location.hash = n.link; sys.close(); };
  } catch { /* some browsers only allow notifications from a service worker */ }
}

/* ---------- guardrails used by the Studio and the server ---------- */
export function inQuietHours(d: Date) {
  const h = d.getHours();
  return h >= LIMITS.quietStart || h < LIMITS.quietEnd;
}
export function promoSentToday(now = new Date()) {
  const last = useNotifications.getState().lastPromoAt;
  return !!last && new Date(last).toDateString() === now.toDateString();
}
