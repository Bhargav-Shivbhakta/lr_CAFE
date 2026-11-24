import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import { getHeaderActions, getHomeWidgets } from '@/core/registry';
import { appConfig } from '@/core/config/flags';
import { useApp, money, nextReward } from '@/core/store/app';
import { useMenu } from '@/core/hooks';
import { checkout, totals } from '@/core/commerce';
import { Button, ItemArt, toast } from '@/core/ui';
import { PointsBar } from '@/features/rewards/Rewards';

const greeting = (h: number) => (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');

export function HomeScreen() {
  const nav = useNavigate();
  const user = useApp((s) => s.user);
  const points = useApp((s) => s.points);
  const usual = useApp((s) => s.usual);
  const menu = useMenu();
  const [busy, setBusy] = useState(false);
  const popular = useMemo(() => menu?.items.filter((i) => i.tags?.includes('popular')) ?? [], [menu]);
  const appOnly = menu?.items.find((i) => i.tags?.includes('app-only'));
  const nr = nextReward(points);

  async function orderUsual() {
    if (!usual) return;
    setBusy(true);
    try { const o = await checkout([usual]); nav(`/orders/${o.id}`); }
    catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <main className="screen" style={{ paddingTop: 12 }}>
      <div className="row">
        <span className="wordmark" style={{ fontSize: 20, color: 'var(--velvet)' }}>{appConfig.brand}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {!user && <button onClick={() => nav('/join')} style={{ fontWeight: 600, color: 'var(--velvet)', padding: '0 8px', minHeight: 44 }}>Sign in</button>}
          {getHeaderActions().map((f) => { const A = f.HeaderAction!; return <A key={f.id} />; })}
        </span>
      </div>
      <h1 className="large-title" style={{ marginTop: 18 }}>{greeting(new Date().getHours())}{user ? `, ${user.firstName}` : ''}</h1>

      {user ? (
        <button className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav('/rewards')}>
          <div className="row">
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>{points}</span><Star size={18} color="var(--brass)" fill="var(--brass)" /></span>
            <span className="muted" style={{ display: 'flex', alignItems: 'center' }}>Rewards <ChevronRight size={16} /></span>
          </div>
          <PointsBar points={points} />
          <div className="faint">{nr ? `${nr.points - points} points to ${nr.label}` : 'You have a reward ready'}</div>
        </button>
      ) : (
        <div style={{ background: 'var(--walnut)', color: 'var(--on-dark)', borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--lamp)', fontWeight: 600, letterSpacing: 0.6 }}>HOUSE KEY</div>
          <div className="display" style={{ fontSize: 24, margin: '6px 0' }}>Every visit earns you something.</div>
          <div style={{ opacity: 0.75, fontSize: 14, lineHeight: 1.5 }}>{appConfig.signUpBonus} points for joining, 1 point per $1 and ${appConfig.birthdayReward} off on your birthday.</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button onClick={() => nav('/join')}>Join now</Button>
          </div>
        </div>
      )}

      {getHomeWidgets().map((f) => { const W = f.homeWidget!.component; return <W key={f.id} />; })}

      {usual && (
        <section>
          <h2 className="section-title">Your usual</h2>
          <div className="card row">
            <span style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
              <ItemArt art="coffee" tint="var(--linen)" size={56} alt="" />
              <span style={{ minWidth: 0 }}><div style={{ fontWeight: 600 }}>{usual.name}</div><div className="faint">{usual.optionLabel || 'As you like it'}</div></span>
            </span>
            <Button style={{ minHeight: 38, padding: '0 16px', fontSize: 14 }} disabled={busy} onClick={orderUsual}>{busy ? '…' : money(totals([usual]).total)}</Button>
          </div>
        </section>
      )}

      {appOnly && (
        <button onClick={() => nav(`/order/item/${appOnly.id}`)} style={{ display: 'block', width: '100%', textAlign: 'left', marginTop: 24, background: 'var(--warm)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ background: 'var(--walnut)', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ItemArt image={appOnly.image} art="sparkles" tint="var(--walnut-2)" size={118} alt={appOnly.name} />
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--velvet)', fontWeight: 700, letterSpacing: 0.6 }}>ONLY IN THE APP</div>
            <div className="display" style={{ fontSize: 22, margin: '4px 0' }}>Meet {appOnly.name}</div>
            <div className="muted" style={{ lineHeight: 1.5 }}>Our secret-menu latte. You won't find it on the board.</div>
            <span className="btn btn-primary" style={{ marginTop: 14 }}>Order now</span>
          </div>
        </button>
      )}

      {popular.length > 0 && (
        <section>
          <h2 className="section-title">Popular right now</h2>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -16px', padding: '0 16px 4px' }}>
            {popular.map((i) => (
              <button key={i.id} onClick={() => nav(`/order/item/${i.id}`)} style={{ width: 104, flexShrink: 0, textAlign: 'center' }}>
                <ItemArt image={i.image} art={i.art} tint={i.tint} size={96} alt={i.name} />
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, lineHeight: 1.25 }}>{i.name}</div>
                <div className="faint">{money(i.price)}</div>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
