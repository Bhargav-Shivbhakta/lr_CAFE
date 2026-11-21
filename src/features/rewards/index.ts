import { Star } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { RewardsScreen } from './Rewards';

export const rewardsFeature: FeatureModule = {
  id: 'rewards', title: 'Rewards', icon: Star, status: 'live',
  nav: { placement: 'tab', order: 4 },
  routes: [{ path: '', element: RewardsScreen }],
};
