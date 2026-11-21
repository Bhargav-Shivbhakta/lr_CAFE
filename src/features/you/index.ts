import { CircleUserRound } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { YouScreen } from './YouScreen';

export const youFeature: FeatureModule = {
  id: 'you', title: 'Account', icon: CircleUserRound, status: 'live',
  nav: { placement: 'tab', order: 5 },
  routes: [{ path: '', element: YouScreen }],
};
