import { Megaphone } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { StudioScreen } from './Studio';

export const studioFeature: FeatureModule = {
  id: 'studio', title: 'Notification Studio', subtitle: 'Announce new items, events and happy hour', icon: Megaphone, status: 'beta',
  nav: { placement: 'hub', order: 1, hubSection: 'Café team' },
  routes: [{ path: '', element: StudioScreen }],
};
