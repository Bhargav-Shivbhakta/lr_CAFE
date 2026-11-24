/**
 * Remote-config style feature flags. Flip a flag to hide a feature everywhere
 * (tab bar, hub, home widgets, routes) without touching its code.
 * Later this object can be loaded from Supabase / a CMS at startup.
 */
export const featureFlags: Record<string, boolean> = {
  home: true,
  order: true,
  scan: true,
  rewards: true,
  you: true,
  bag: true,
  join: true,
  orders: true,
  locations: true,
  events: true,
  'save-my-seat': true,
  'gift-cards': true,
  catering: true,
  'study-mode': true,
  inbox: true,
  studio: true,
};

export const appConfig = {
  brand: 'Living Room',
  tagline: 'Pull up a chair.',
  maxTabs: 5,
  pointsPerDollar: 1,
  signUpBonus: 10,
  birthdayReward: 5,
  rewards: [
    { points: 100, label: '$5 off', value: 5 },
    { points: 150, label: '$7.50 off', value: 7.5 },
  ],
  // House Key tiers are based on LIFETIME points, so spending a reward never drops your tier.
  tiers: [
    { id: 'guest', name: 'Guest', minPoints: 0, perk: '1 point per $1 and $5 off on your birthday' },
    { id: 'regular', name: 'Regular', minPoints: 150, perk: 'double points 3–5:30, Mon–Thu, and the app-only secret menu' },
    { id: 'family', name: 'Family', minPoints: 600, perk: 'save a seat first and try new drinks before anyone' },
  ],
  happyHours: { days: [1, 2, 3, 4], start: '15:00', end: '17:30', multiplier: 2 },
};
