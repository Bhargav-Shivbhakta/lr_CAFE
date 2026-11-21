import { orderService, paymentService } from './services';
import type { CartLine, Order } from './services/types';
import { cartSubtotal, pointsFor, useApp } from './store/app';

export const TAX_RATE = 0.0775; // San Diego sales tax — confirm with the client's POS settings

export function totals(lines: CartLine[], discount = 0) {
  const subtotal = cartSubtotal(lines);
  const discounted = Math.max(0, subtotal - discount);
  const tax = +(discounted * TAX_RATE).toFixed(2);
  return { subtotal, discount: Math.min(discount, subtotal), tax, total: +(discounted + tax).toFixed(2), points: pointsFor(discounted) };
}

/** The single checkout path used by the Bag and by one-tap "Your usual". */
export async function checkout(lines: CartLine[], opts: { discount?: number; redeemPoints?: number } = {}): Promise<Order> {
  const s = useApp.getState();
  const t = totals(lines, opts.discount);
  const pay = await paymentService.charge(t.total);
  if (!pay.ok) throw new Error('Payment did not go through. Try another card.');
  const order = await orderService.placeOrder({
    locationId: s.locationId, lines, subtotal: t.subtotal, tax: t.tax, total: t.total, pointsEarned: t.points, mode: s.mode,
  });
  if (opts.redeemPoints) s.redeem(opts.redeemPoints);
  s.recordOrder(order);
  return order;
}
