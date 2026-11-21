import { useNavigate, useParams } from 'react-router-dom';
import { Armchair, Check, Coffee, Receipt, RotateCcw } from 'lucide-react';
import { orderService } from '@/core/services';
import type { Order, OrderStatus } from '@/core/services/types';
import { useLocations, useNow } from '@/core/hooks';
import { money, useApp } from '@/core/store/app';
import { Button, ListRow, Screen, toast } from '@/core/ui';

const STEPS: { id: OrderStatus; label: string; line: string }[] = [
  { id: 'received', label: 'Received', line: 'We got it — pull up a chair.' },
  { id: 'brewing', label: 'Brewing', line: 'Your order is warming up.' },
  { id: 'ready', label: 'On the shelf', line: 'Ready on the pickup shelf.' },
];

function useStatus(o?: Order) { useNow(1000); return o ? orderService.getStatus(o) : 'received'; }

export function OrderTracker() {
  const { id } = useParams();
  const order = useApp((s) => s.orders.find((o) => o.id === id));
  const locs = useLocations();
  const nav = useNavigate();
  const status = useStatus(order);
  if (!order) return <Screen title="Order" back="/orders"><p className="muted">We couldn't find that order.</p></Screen>;
  const idx = STEPS.findIndex((s) => s.id === status);
  const loc = locs?.find((l) => l.id === order.locationId);
  const left = Math.max(0, Math.ceil((order.readyAt - Date.now()) / 60000));

  return (
    <Screen back="/">
      <div className="card-walnut" style={{ borderRadius: 26, padding: 20, marginTop: 4 }}>
        <div className="row"><span style={{ fontSize: 12, color: 'var(--lamp)' }}><Armchair size={13} style={{ verticalAlign: -2 }} /> {loc?.name ?? 'Living Room'} · #{order.id}</span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{status === 'ready' ? 'Ready' : `~${left} min`}</span></div>
        <div className="display" style={{ fontSize: 26, margin: '10px 0 16px' }}>{STEPS[idx].line}</div>
        <div style={{ display: 'flex', gap: 6 }}>{STEPS.map((s, i) => <div key={s.id} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= idx ? 'var(--brass)' : '#5A4335', transition: 'background .5s' }} />)}</div>
        <div className="row" style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>{STEPS.map((s) => <span key={s.id}>{s.label}</span>)}</div>
      </div>
      <p className="faint" style={{ textAlign: 'center', margin: '10px 0 0' }}>In the native app this shows as a Live Activity on the lock screen.</p>

      <h2 className="section-title">Your order</h2>
      <div className="list-group">
        {order.lines.map((l) => <ListRow key={l.key} title={`${l.qty}× ${l.name}`} subtitle={l.optionLabel || undefined} right={<span>{money(l.unitPrice * l.qty)}</span>} />)}
        <ListRow title="Total" subtitle={`+${order.pointsEarned} House Key points`} right={<b>{money(order.total)}</b>} />
      </div>
      {status === 'ready' && <Button block style={{ marginTop: 16 }} onClick={() => { toast('Enjoy. See you next time'); nav('/'); }}><Check size={18} /> I picked it up</Button>}
    </Screen>
  );
}

export function OrderHistory() {
  const orders = useApp((s) => s.orders);
  const addToCart = useApp((s) => s.addToCart);
  const nav = useNavigate();
  return (
    <Screen title="Orders" back>
      {orders.length === 0 ? <p className="muted">No orders yet. Your first one earns points.</p> : (
        <div className="list-group">
          {orders.map((o) => (
            <ListRow key={o.id} icon={Receipt} title={o.lines.map((l) => l.name).join(', ')}
              subtitle={`${new Date(o.placedAt).toLocaleDateString()} · ${money(o.total)}`}
              right={<button aria-label="Order again" onClick={() => { o.lines.forEach((l) => addToCart({ ...l })); toast('Added to your bag'); nav('/bag'); }} style={{ color: 'var(--velvet)', display: 'flex', gap: 4, alignItems: 'center', fontSize: 14 }}><RotateCcw size={15} /> Again</button>} />
          ))}
        </div>
      )}
    </Screen>
  );
}

export function ActiveOrderWidget() {
  const order = useApp((s) => s.orders[0]);
  const nav = useNavigate();
  const status = useStatus(order);
  if (!order || Date.now() - order.placedAt > 30 * 60_000) return null;
  return (
    <button className="card row" style={{ width: '100%', marginTop: 12, textAlign: 'left' }} onClick={() => nav(`/orders/${order.id}`)}>
      <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="icon-tile"><Coffee size={18} /></span>
        <span><div style={{ fontWeight: 600 }}>{status === 'ready' ? 'Ready on the shelf' : 'Your order is brewing'}</div><div className="faint">#{order.id} · tap to track</div></span></span>
      <span className="badge-soon" style={{ background: status === 'ready' ? '#E3EDD9' : undefined, color: status === 'ready' ? 'var(--success)' : undefined }}>{status === 'ready' ? 'Ready' : 'Live'}</span>
    </button>
  );
}
