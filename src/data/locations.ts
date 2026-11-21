import type { Location } from '@/core/services/types';

// From the current Living Room app / Toast listings (Nov 2026). Hours shown are online-ordering cutoffs.
export const locations: Location[] = [
  { id: 'sdsu', name: 'SDSU / College', address: '5900 El Cajon Blvd., San Diego, CA 92115', phone: '(619) 286-8434',
    orderingEnabled: true, closesAt: '22:00', pickupMinutes: 10, deliveryMinutes: 40, vibe: 'The original, since 1991. Study couches.' },
  { id: 'la-jolla', name: 'La Jolla', address: '1205 Prospect Street, La Jolla, CA 92037', phone: '(858) 459-1187',
    orderingEnabled: true, closesAt: '23:45', pickupMinutes: 12, deliveryMinutes: 45, vibe: 'Café, lounge and live music on weekends.' },
  { id: 'rancho', name: 'Rancho San Diego', address: '2512 Jamacha Road, Rancho San Diego, CA 92019', phone: '(619) 749-7788',
    orderingEnabled: true, closesAt: '22:15', pickupMinutes: 10, deliveryMinutes: 40, vibe: 'Coffee, Italian kitchen and a full bar.' },
  { id: 'harney', name: 'Old Town', address: '3964 Harney Street, San Diego, CA 92110', phone: '(619) 295-3272',
    orderingEnabled: false, vibe: 'Historic Old Town.', note: 'Order at the counter here — app ordering coming soon.' },
];
