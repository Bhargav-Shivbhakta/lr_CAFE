import { orderService, paymentService } from './services';
import type { CartLine, Order } from './services/types';
import { cartSubtotal, nextReward, pointsFor, tierFor, useApp } from './store/app';
import { notify } from './notifications';
import { rewardNotices } from './notifications/templates';

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
  const before = { tier: tierFor(s.lifetimePoints).tier, reward: nextReward(useApp.getState().points) };
  s.recordOrder(order);
  // Rewards news, sent a moment after the order confirmation.
  const after = useApp.getState();
  const nr = nextReward(after.points);
  const newTier = tierFor(after.lifetimePoints).tier;
  setTimeout(() => {
    if (order.pointsEarned > 0) notify(rewardNotices.pointsEarned(order.pointsEarned, nr ? nr.points - after.points : null, nr?.label ?? null));
    if (before.reward && after.points >= before.reward.points) notify(rewardNotices.rewardReady(before.reward.label));
    if (newTier.id !== before.tier.id) notify(rewardNotices.tierUp(newTier.name, newTier.perk));
  }, 6000);
  return order;
}
