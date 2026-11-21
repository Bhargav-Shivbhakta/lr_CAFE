import { Armchair, BookOpen, Gift, UtensilsCrossed } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';

/**
 * Planned features. They already have a nav slot and a "coming soon" screen.
 * To build one: create features/<id>/, add `routes`, set status to 'live', delete it from this file.
 */
export const soonFeatures: FeatureModule[] = [
  { id: 'save-my-seat', title: 'Save my seat', subtitle: 'Reserve a couch, study table or lounge table', icon: Armchair, status: 'soon',
    nav: { placement: 'hub', order: 2, hubSection: 'At the café' },
    comingSoonPitch: 'Hold the good couch at SDSU or a lounge table for live music at La Jolla — before you leave home.' },
  { id: 'study-mode', title: 'Study mode', subtitle: 'Student perks and late-night deals', icon: BookOpen, status: 'soon', locations: ['sdsu'],
    nav: { placement: 'hub', order: 3, hubSection: 'At the café' },
    comingSoonPitch: 'Verify your .edu email for student pricing, refills during finals week and a quiet-table finder.' },
  { id: 'gift-cards', title: 'Gift cards', subtitle: 'Send a coffee to a friend', icon: Gift, status: 'soon',
    nav: { placement: 'hub', order: 3, hubSection: 'Ordering' },
    comingSoonPitch: 'Send a latte by text in two taps. They pick it up at any Living Room.' },
  { id: 'catering', title: 'Catering', subtitle: 'Pastry boxes and coffee for groups', icon: UtensilsCrossed, status: 'soon',
    nav: { placement: 'hub', order: 4, hubSection: 'Ordering' },
    comingSoonPitch: 'Coffee carafes, pastry boxes and breakfast croissants for your team or study group.' },
];
