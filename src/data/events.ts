import { Music, Footprints, Mic, Dumbbell, type LucideIcon } from 'lucide-react';

// Sample schedule for the demo — in production this comes from a small CMS table the café edits.
export const EVENTS: { id: string; title: string; where: string; when: string; icon: LucideIcon; blurb: string }[] = [
  { id: 'music', title: 'Live music in the lounge', where: 'La Jolla', when: 'Fri & Sat · 8 PM', icon: Music, blurb: 'Full bar, Mediterranean plates, weekend reservations recommended.' },
  { id: 'run', title: 'Saturday run club', where: 'SDSU / College', when: 'Sat · 8 AM', icon: Footprints, blurb: 'Easy 5K, then coffee together. Dogs welcome.' },
  { id: 'pilates', title: 'Pilates and coffee', where: 'Rancho San Diego', when: 'Sun · 9 AM', icon: Dumbbell, blurb: 'A morning class followed by a latte on us for House Key members.' },
  { id: 'openmic', title: 'Open mic night', where: 'La Jolla', when: 'Wed · 7 PM', icon: Mic, blurb: 'Bring a song, a poem or just your ears.' },
];
