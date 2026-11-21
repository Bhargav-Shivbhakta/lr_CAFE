/**
 * Service locator: the rest of the app imports ONLY from here, never from an adapter.
 * To integrate something new (Stripe, Supabase, Toast, Square, OneSignal…):
 *   1. write an adapter that satisfies the interface in ./types.ts
 *   2. add it to the switch below, keyed by an env variable.
 */
import { mockAuth, mockMenu, mockOrders, mockPayments } from './adapters/mock';
import { toastMenu, toastOrders } from './adapters/toast';
import type { AuthService, MenuService, OrderService, PaymentService } from './types';

const env = import.meta.env;

export const menuService: MenuService = env.VITE_MENU_PROVIDER === 'toast' ? toastMenu : mockMenu;
export const orderService: OrderService = env.VITE_ORDER_PROVIDER === 'toast' ? toastOrders : mockOrders;
export const paymentService: PaymentService = mockPayments;
export const authService: AuthService = mockAuth;

export * from './types';
