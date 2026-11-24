import { Bell } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { InboxBell, InboxScreen, NotificationSettings } from './Inbox';

export const inboxFeature: FeatureModule = {
  id: 'inbox', title: 'Notifications', subtitle: 'Inbox and settings', icon: Bell, status: 'live',
  nav: { placement: 'hub', order: 1, hubSection: 'Your account' },
  routes: [{ path: '', element: InboxScreen }, { path: 'settings', element: NotificationSettings }],
  HeaderAction: InboxBell,
};
