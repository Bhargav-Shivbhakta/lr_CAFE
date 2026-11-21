import { Coffee } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { CategoryScreen, ItemScreen, MenuHome } from './OrderScreens';

export const orderFeature: FeatureModule = {
  id: 'order', title: 'Order', icon: Coffee, status: 'live',
  nav: { placement: 'tab', order: 2 },
  routes: [
    { path: '', element: MenuHome },
    { path: 'c/:catId', element: CategoryScreen },
    { path: 'item/:id', element: ItemScreen },
  ],
};
