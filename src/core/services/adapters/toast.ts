import type { MenuService, OrderService } from '../types';

/**
 * Toast POS adapter — placeholder.
 * Real orders must reach Living Room's kitchen through Toast. That needs Toast partner
 * API access (approved by Toast + the restaurant). Once credentials exist:
 *  - getLocations -> Toast Restaurants API
 *  - getMenu      -> Toast Menus API (map to our Menu shape here, nowhere else)
 *  - placeOrder   -> Toast Orders API
 * Calls should go through a small server (e.g. a Vercel function) so secrets never ship to the browser.
 */
const notReady = () => { throw new Error('Toast adapter not configured yet — use VITE_MENU_PROVIDER=mock'); };
export const toastMenu: MenuService = { getLocations: notReady, getMenu: notReady };
export const toastOrders: OrderService = { placeOrder: notReady, getStatus: () => 'received' };
