import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Minus, Plus, ShoppingBag } from 'lucide-react';
import { appConfig } from '@/core/config/flags';
import { checkout, totals } from '@/core/commerce';
import { useCurrentLocation } from '@/core/hooks';
import { isHappyHour, money, useApp } from '@/core/store/app';
import { Button, Screen, Segmented, toast } from '@/core/ui';

export function BagScreen() {
  const nav = useNavigate();
  const cart = useApp((s) => s.cart);
  const setQty = useApp((s) => s.setQty);
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  const points = useApp((s) => s.points);
  const user = useApp((s) => s.user);
  const loc = useCurrentLocation();
  const reward = [...appConfig.rewards].reverse().find((r) => r.points <= points);
  const [useReward, setUseReward] = useState(false);
  const [busy, setBusy] = useState(false);
  const t = totals(cart, useReward && reward ? reward.value : 0);

  if (cart.length === 0) return (
    <Screen title="Your order" back>
      <div style={{ textAlign: 'center', paddingTop: 48 }}>
        <ShoppingBag size={44} color="var(--text-3)" strokeWidth={1.5} />
        <h2 className="display" style={{ fontSize: 22 }}>Pull up a chair</h2>
        <p className="muted">Your order is empty. The chai's hot, though.</p>
        <Button onClick={() => nav('/order')}>Start an order</Button>
      </div>
    </Screen>
  );

  async function place() {
    if (!user) { nav('/join?next=/bag'); return; }
    setBusy(true);
    try {
      const o = await checkout(cart, { discount: useReward && reward ? reward.value : 0, redeemPoints: useReward && reward ? reward.points : 0 });
      useApp.getState().clearCart();
      nav(`/orders/${o.id}`);
    } catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <Screen title="Your order" back>
      <Segmented value={mode} onChange={setMode} options={[
        { value: 'pickup', label: `Pickup · ${loc?.pickupMinutes ?? 10} min` },
        { value: 'delivery', label: `Delivery · ${loc?.deliveryMinutes ?? 40} min` }]} />
      <p className="faint" style={{ margin: '8px 2px 14px' }}>{mode === 'pickup' ? `Pick up at ${loc?.name ?? 'your café'} · ready ASAP` : 'Delivered to your saved address'}</p>

      <div className="list-group">
        {cart.map((l) => (
          <div key={l.key} className="list-row">
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{l.name}</div>
              {l.optionLabel && <div className="muted">{l.optionLabel}</div>}
              {l.note && <div className="faint">“{l.note}”</div>}
              <div style={{ marginTop: 4, fontSize: 14 }}>{money(l.unitPrice * l.qty)}</div>
            </span>
            <div className="qty">
              <button aria-label="Less" onClick={() => setQty(l.key, l.qty - 1)}><Minus size={15} /></button>
              <span>{l.qty}</span>
              <button aria-label="More" onClick={() => setQty(l.key, l.qty + 1)}><Plus size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {reward && (
        <button className="card row" style={{ width: '100%', marginTop: 12, boxShadow: useReward ? 'inset 0 0 0 2px var(--brass)' : undefined }} onClick={() => setUseReward((u) => !u)}>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="icon-tile" style={{ background: 'var(--brass-soft)', color: '#7A5A17' }}><Gift size={18} /></span>
            <span style={{ textAlign: 'left' }}><div style={{ fontWeight: 600 }}>Use {reward.label}</div><div className="faint">{reward.points} House Key points</div></span></span>
          <span style={{ color: 'var(--velvet)', fontWeight: 600 }}>{useReward ? 'Applied' : 'Apply'}</span>
        </button>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row muted"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
        {t.discount > 0 && <div className="row muted" style={{ marginTop: 6 }}><span>House Key reward</span><span>−{money(t.discount)}</span></div>}
        <div className="row muted" style={{ marginTop: 6 }}><span>Tax</span><span>{money(t.tax)}</span></div>
        <div className="row" style={{ marginTop: 10, fontWeight: 700, fontSize: 17 }}><span>Total</span><span>{money(t.total)}</span></div>
        <div className="faint" style={{ marginTop: 8 }}>You'll earn {t.points} points{isHappyHour() ? ' (double points right now)' : ''}</div>
      </div>

      <Button block style={{ marginTop: 16, height: 52 }} disabled={busy} onClick={place}>{busy ? 'Placing your order…' : user ? `Place order · ${money(t.total)}` : 'Join to place your order'}</Button>
      <p className="faint" style={{ textAlign: 'center', marginTop: 8 }}>Payment is the next step to connect. No card is charged in this demo.</p>
    </Screen>
  );
}
