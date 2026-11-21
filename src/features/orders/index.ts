import { Receipt } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { ActiveOrderWidget, OrderHistory, OrderTracker } from './OrderScreens';

export const ordersFeature: FeatureModule = {
  id: 'orders', title: 'Orders', subtitle: 'Track and reorder', icon: Receipt, status: 'live',
  nav: { placement: 'hub', order: 1, hubSection: 'Ordering' },
  routes: [{ path: '', element: OrderHistory }, { path: ':id', element: OrderTracker }],
  homeWidget: { order: 0, component: ActiveOrderWidget },
};
