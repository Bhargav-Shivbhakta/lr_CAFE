import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Footprints, Mic, Dumbbell, type LucideIcon } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { Button, Screen, toast } from '@/core/ui';

// Sample schedule for the demo — in production this comes from a small CMS table the café edits.
const EVENTS: { id: string; title: string; where: string; when: string; icon: LucideIcon; blurb: string }[] = [
  { id: 'music', title: 'Live music in the lounge', where: 'La Jolla', when: 'Fri & Sat · 8 PM', icon: Music, blurb: 'Full bar, Mediterranean plates, weekend reservations recommended.' },
  { id: 'run', title: 'Saturday run club', where: 'SDSU / College', when: 'Sat · 8 AM', icon: Footprints, blurb: 'Easy 5K, then coffee together. Dogs welcome.' },
  { id: 'pilates', title: 'Pilates and coffee', where: 'Rancho San Diego', when: 'Sun · 9 AM', icon: Dumbbell, blurb: 'A morning class followed by a latte on us for House Key members.' },
  { id: 'openmic', title: 'Open mic night', where: 'La Jolla', when: 'Wed · 7 PM', icon: Mic, blurb: 'Bring a song, a poem or just your ears.' },
];

function EventsScreen() {
  const [going, setGoing] = useState<string[]>([]);
  return (
    <Screen title="In the living room" back>
      <p className="muted" style={{ marginTop: -8 }}>Sample schedule</p>
      <div className="stack">
        {EVENTS.map((e) => {
          const Icon = e.icon; const on = going.includes(e.id);
          return (
            <div key={e.id} className="card">
              <div style={{ display: 'flex', gap: 12 }}>
                <span className="icon-tile"><Icon size={19} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{e.title}</div>
                  <div className="faint">{e.where} · {e.when}</div>
                  <p className="muted" style={{ margin: '6px 0 10px' }}>{e.blurb}</p>
                  <Button variant={on ? 'quiet' : 'primary'} style={{ minHeight: 38, fontSize: 14 }} onClick={() => { setGoing((g) => on ? g.filter((x) => x !== e.id) : [...g, e.id]); if (!on) toast("You're on the list"); }}>{on ? 'Going ✓' : "I'm in"}</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

function EventsWidget() {
  const nav = useNavigate();
  return (
    <section>
      <h2 className="section-title">Happening in the living room</h2>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {EVENTS.slice(0, 3).map((e) => { const Icon = e.icon; return (
          <button key={e.id} className="card" style={{ minWidth: 150, textAlign: 'left' }} onClick={() => nav('/events')}>
            <Icon size={20} color="var(--velvet)" /><div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{e.title.split(' in ')[0]}</div><div className="faint">{e.where} · {e.when}</div>
          </button>); })}
      </div>
    </section>
  );
}

export const eventsFeature: FeatureModule = {
  id: 'events', title: 'Events', subtitle: 'Live music, run club, open mic', icon: Music, status: 'beta',
  nav: { placement: 'hub', order: 1, hubSection: 'At the café' },
  routes: [{ path: '', element: EventsScreen }],
  homeWidget: { order: 2, component: EventsWidget },
};
