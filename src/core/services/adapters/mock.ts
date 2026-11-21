import type { AuthService, MenuService, OrderService, PaymentService, Order } from '../types';
import { locations } from '@/data/locations';
import { menu } from '@/data/menu';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const mockMenu: MenuService = {
  async getLocations() { await wait(); return locations; },
  async getMenu() { await wait(); return menu; },
};

export const mockOrders: OrderService = {
  async placeOrder(o) {
    await wait(600);
    const now = Date.now();
    return { ...o, id: 'LR' + Math.floor(1000 + Math.random() * 9000), status: 'received', placedAt: now, readyAt: now + 90_000 };
  },
  // Simulated kitchen progress so the demo "comes alive" during a pitch.
  getStatus(o: Order) {
    const t = (Date.now() - o.placedAt) / (o.readyAt - o.placedAt);
    return t < 0.2 ? 'received' : t < 1 ? 'brewing' : 'ready';
  },
};

export const mockPayments: PaymentService = {
  async charge() { await wait(500); return { ok: true, ref: 'demo-' + Date.now() }; },
};

const pendingCodes = new Map<string, string>();
/** Demo SMS: the code is shown on screen. The Supabase/Twilio adapter sends a real text. */
export const mockAuth: AuthService = {
  async sendCode(phone) {
    await wait(500);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    pendingCodes.set(phone, code);
    return { demoCode: code };
  },
  async verify(phone, code, profile) {
    await wait(400);
    if (pendingCodes.get(phone) !== code.trim()) throw new Error("That code doesn't match. Check it and try again.");
    pendingCodes.delete(phone);
    return { id: 'u-' + phone.replace(/\D/g, ''), phone, firstName: profile.firstName, lastName: profile.lastName, since: String(new Date().getFullYear()) };
  },
};
