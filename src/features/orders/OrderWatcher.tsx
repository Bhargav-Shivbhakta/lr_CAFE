import { useEffect } from 'react';
import { orderService } from '@/core/services';
import { useLocations, useNow } from '@/core/hooks';
import { useApp } from '@/core/store/app';
import { notify, useNotifications } from '@/core/notifications';
import { orderNotices } from '@/core/notifications/templates';

/**
 * Headless service: watches the active order and sends a notification at each step
 * (received → brewing → ready). In production the server does this from Toast's order webhooks.
 */
export function OrderWatcher() {
  useNow(1500);
  const order = useApp((s) => s.orders[0]);
  const firstName = useApp((s) => s.user?.firstName ?? '');
  const locs = useLocations();
  const active = !!order && Date.now() - order.placedAt < 30 * 60_000;
  const status = active ? orderService.getStatus(order) : null;

  useEffect(() => {
    if (!order || !status) return;
    const st = useNotifications.getState();
    if (st.seenOrderStatus[order.id] === status) return;
    st.markOrderStatus(order.id, status);
    const loc = locs?.find((l) => l.id === order.locationId)?.name ?? 'the café';
    if (status === 'received') notify(orderNotices.received(order, firstName, loc));
    if (status === 'brewing') notify(orderNotices.brewing(order, Math.ceil((order.readyAt - Date.now()) / 60000)));
    if (status === 'ready') notify(orderNotices.ready(order));
  }, [order, status, firstName, locs]);

  return null;
}
