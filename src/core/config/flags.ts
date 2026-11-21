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
  tiers: [
    { id: 'guest', name: 'Guest', minPoints: 0 },
    { id: 'regular', name: 'Regular', minPoints: 50 },
    { id: 'family', name: 'Family', minPoints: 500 },
  ],
  happyHours: { days: [1, 2, 3, 4], start: '15:00', end: '17:30', multiplier: 2 },
};
