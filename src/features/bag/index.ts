import { ShoppingBag } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { BagScreen } from './BagScreen';
import { StoreBar } from './extras';

export const bagFeature: FeatureModule = {
  id: 'bag', title: 'Your order', icon: ShoppingBag, status: 'live',
  nav: { placement: 'hidden', order: 0 },
  routes: [{ path: '', element: BagScreen }],
  Overlay: StoreBar,
};
