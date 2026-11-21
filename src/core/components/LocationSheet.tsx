import { Check, MapPin } from 'lucide-react';
import { useLocations } from '../hooks';
import { useApp } from '../store/app';
import { Sheet, toast } from '../ui';

const fmt = (t?: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); const hh = ((h + 11) % 12) + 1; return `${hh}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`; };
export const closesLabel = (t?: string) => (t ? `Open till ${fmt(t)}` : 'Counter only');

export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const locations = useLocations() ?? [];
  const current = useApp((s) => s.locationId);
  const setLocation = useApp((s) => s.setLocation);
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '4px 16px 24px' }}>
        <h2 className="display" style={{ fontSize: 24, margin: '8px 0 14px' }}>Pick your living room</h2>
        <div className="stack">
          {locations.map((l) => (
            <button key={l.id} className="card" style={{ width: '100%', textAlign: 'left', opacity: l.orderingEnabled ? 1 : 0.7, boxShadow: current === l.id ? 'inset 0 0 0 2px var(--velvet)' : undefined }}
              onClick={() => { if (!l.orderingEnabled) { toast(l.note ?? 'Ordering not available here'); return; } setLocation(l.id); onClose(); toast(`Ordering from ${l.name}`); }}>
              <div className="row">
                <div style={{ fontWeight: 600 }}><MapPin size={15} color="var(--velvet)" style={{ verticalAlign: -2 }} /> {l.name}</div>
                {current === l.id && <Check size={18} color="var(--velvet)" />}
              </div>
              <div className="muted" style={{ marginTop: 4 }}>{l.vibe}</div>
              <div className="faint" style={{ marginTop: 6 }}>{l.orderingEnabled ? `${closesLabel(l.closesAt)} · pickup ~${l.pickupMinutes} min` : l.note}</div>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
