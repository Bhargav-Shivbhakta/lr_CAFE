import { House } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { HomeScreen } from './HomeScreen';

export const homeFeature: FeatureModule = {
  id: 'home', title: 'Home', icon: House, status: 'live',
  nav: { placement: 'tab', order: 1 },
  routes: [{ path: '', element: HomeScreen }],
};
