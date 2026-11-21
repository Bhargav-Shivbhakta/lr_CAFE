/** Domain models — every adapter (mock, Toast, Supabase…) must return these shapes. */
export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  orderingEnabled: boolean;
  closesAt?: string;          // "22:00"
  pickupMinutes?: number;
  deliveryMinutes?: number;
  note?: string;
  vibe: string;               // one-line personality for the picker
}

export interface ModifierOption { id: string; name: string; price: number }
export interface ModifierGroup {
  id: string; name: string; required: boolean; max: number; options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  priceIsSample?: boolean;     // true = placeholder until synced from POS
  tags?: ('vg' | 'v' | 'gf' | 'new' | 'app-only' | 'popular')[];
  modifierGroups?: string[];   // ids into menu.modifierGroups
  soldOut?: boolean;
  image?: string;              // photo URL — falls back to illustrated placeholder
  art?: string;                // icon key for placeholder artwork
  tint?: string;               // placeholder art background
}

export interface MenuCategory { id: string; name: string; section: string }
export interface Menu { categories: MenuCategory[]; items: MenuItem[]; modifierGroups: ModifierGroup[] }

export interface CartLine {
  key: string; itemId: string; name: string; unitPrice: number; qty: number;
  options: { groupId: string; optionIds: string[] }[]; optionLabel: string; note?: string;
}

export type OrderStatus = 'received' | 'brewing' | 'ready' | 'picked-up';
export interface Order {
  id: string; locationId: string; lines: CartLine[]; subtotal: number; tax: number; total: number;
  pointsEarned: number; status: OrderStatus; placedAt: number; readyAt: number; mode: 'pickup' | 'delivery';
}

export interface User { id: string; firstName: string; lastName: string; phone: string; since: string }

/* ---------- Service contracts (ports). Swap implementations in services/index.ts ---------- */
export interface MenuService { getLocations(): Promise<Location[]>; getMenu(locationId: string): Promise<Menu> }
export interface OrderService { placeOrder(o: Omit<Order, 'id' | 'status' | 'placedAt' | 'readyAt'>): Promise<Order>; getStatus(o: Order): OrderStatus }
export interface PaymentService { charge(amount: number): Promise<{ ok: boolean; ref: string }> }
export interface AuthService {
  /** Sends a one-time code by SMS. Returns a hint only in demo mode. */
  sendCode(phone: string): Promise<{ demoCode?: string }>;
  verify(phone: string, code: string, profile: { firstName: string; lastName: string }): Promise<User>;
}
