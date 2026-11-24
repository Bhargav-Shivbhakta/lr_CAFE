import type { Order } from '../services/types';

/** Automatic notification copy. Playful and specific: the drink, the café, the time left. */
const first = (o: Order) => o.lines[0]?.name ?? 'order';
const more = (o: Order) => (o.lines.length > 1 ? ` and ${o.lines.length - 1} more` : '');

export const orderNotices = {
  received: (o: Order, firstName: string, loc: string) => ({
    kind: 'order' as const, link: `/orders/${o.id}`,
    title: `We got it${firstName ? `, ${firstName}` : ''}`,
    body: `Your ${first(o)}${more(o)} is in the queue at ${loc}.`,
  }),
  brewing: (o: Order, mins: number) => ({
    kind: 'order' as const, link: `/orders/${o.id}`,
    title: `☕ Your ${shortName(first(o))} is warming up`,
    body: `About ${Math.max(1, mins)} ${mins === 1 ? 'minute' : 'minutes'} to go. Perfect time to find a couch.`,
  }),
  ready: (o: Order) => ({
    kind: 'order' as const, link: `/orders/${o.id}`,
    title: 'Ready on the shelf',
    body: `Order #${o.id} is waiting for you at the pickup shelf.`,
  }),
};

export const rewardNotices = {
  pointsEarned: (earned: number, toGo: number | null, label: string | null) => ({
    kind: 'rewards' as const, link: '/rewards',
    title: `+${earned} House Key points`,
    body: toGo && label ? `${toGo} more and you've got ${label}.` : 'You have a reward ready to use.',
  }),
  tierUp: (tier: string, perk: string) => ({
    kind: 'rewards' as const, link: '/rewards',
    title: tier === 'Family' ? 'Welcome to the family' : `You're a Living Room ${tier}`,
    body: `New perk unlocked: ${perk}.`,
  }),
  rewardReady: (label: string) => ({
    kind: 'rewards' as const, link: '/bag',
    title: `You've unlocked ${label}`,
    body: "It's waiting in your bag at checkout.",
  }),
};

function shortName(name: string) {
  const n = name.replace(/\s+latte$/i, '').trim();
  return n.length > 22 ? n.split(' ').slice(0, 2).join(' ') : n.toLowerCase();
}
