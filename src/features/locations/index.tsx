import { MapPin, Phone } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { useLocations } from '@/core/hooks';
import { useApp } from '@/core/store/app';
import { closesLabel } from '@/core/components/LocationSheet';
import { Button, Screen, toast } from '@/core/ui';

function LocationsScreen() {
  const locs = useLocations() ?? [];
  const current = useApp((s) => s.locationId);
  const setLocation = useApp((s) => s.setLocation);
  return (
    <Screen title="Our living rooms" back>
      <div className="stack">
        {locs.map((l) => (
          <div key={l.id} className="card">
            <div className="row"><h3 className="display" style={{ margin: 0, fontSize: 20 }}>{l.name}</h3>{current === l.id && <span className="badge-soon">Your café</span>}</div>
            <p className="muted" style={{ margin: '6px 0' }}>{l.vibe}</p>
            <div className="faint"><MapPin size={12} /> {l.address}</div>
            <div className="faint"><Phone size={12} /> {l.phone}</div>
            <div className="row" style={{ marginTop: 12 }}>
              <span className="muted">{l.orderingEnabled ? closesLabel(l.closesAt) : l.note}</span>
              {l.orderingEnabled && current !== l.id && <Button variant="quiet" style={{ minHeight: 36, fontSize: 13 }} onClick={() => { setLocation(l.id); toast(`Ordering from ${l.name}`); }}>Order here</Button>}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

export const locationsFeature: FeatureModule = {
  id: 'locations', title: 'Locations', subtitle: 'Hours, addresses, switch café', icon: MapPin, status: 'live',
  nav: { placement: 'hub', order: 2, hubSection: 'Ordering' },
  routes: [{ path: '', element: LocationsScreen }],
};
