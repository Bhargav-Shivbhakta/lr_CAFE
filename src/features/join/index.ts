import { UserPlus } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { JoinScreen } from './JoinScreen';

export const joinFeature: FeatureModule = {
  id: 'join', title: 'Join', icon: UserPlus, status: 'live',
  nav: { placement: 'hidden', order: 0 },
  routes: [{ path: '', element: JoinScreen }],
};
