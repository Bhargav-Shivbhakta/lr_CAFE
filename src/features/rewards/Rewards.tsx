import { useNavigate } from 'react-router-dom';
import { Cake, Clock, Gift, KeyRound, Star } from 'lucide-react';
import { appConfig } from '@/core/config/flags';
import { isHappyHour, nextReward, tierFor, useApp } from '@/core/store/app';
import { JoinPrompt } from '@/core/components/JoinPrompt';
import { Button, Progress, Screen } from '@/core/ui';

const PERKS: Record<string, string[]> = {
  guest: ['1 point for every $1', `$${appConfig.birthdayReward} off on your birthday`, `${appConfig.signUpBonus} points for joining`],
  regular: ['Everything in Guest', 'Double points 3–5:30 PM, Mon–Thu', 'App-only secret menu'],
  family: ['Everything in Regular', 'Save a seat before anyone else', 'Try new drinks first'],
};

export function PointsBar({ points }: { points: number }) {
  const max = appConfig.rewards[appConfig.rewards.length - 1].points;
  return (
    <div style={{ position: 'relative', margin: '14px 0 22px' }}>
      <Progress light value={points / max} />
      {appConfig.rewards.map((r) => (
        <div key={r.points} style={{ position: 'absolute', left: `${(r.points / max) * 100}%`, top: -4, transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: points >= r.points ? 'var(--brass)' : 'var(--paper)', border: '2px solid var(--brass)' }} />
          <div className="faint" style={{ marginTop: 4, whiteSpace: 'nowrap' }}>{r.points}</div>
        </div>
      ))}
    </div>
  );
}

export function RewardsScreen() {
  const user = useApp((s) => s.user);
  const points = useApp((s) => s.points);
  const lifetime = useApp((s) => s.lifetimePoints);
  const streak = useApp((s) => s.streakWeeks);
  const nav = useNavigate();
  if (!user) return <Screen title="Rewards"><JoinPrompt /></Screen>;
  const { tier, next } = tierFor(lifetime);
  const nr = nextReward(points);

  return (
    <Screen title="Rewards">
      <div className="card">
        <div className="row"><span className="muted">House Key · {tier.name}</span><KeyRound size={20} color="var(--brass)" /></div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{points}</span><Star size={22} color="var(--brass)" fill="var(--brass)" />
        </div>
        <PointsBar points={points} />
        <div className="muted">{nr ? `${nr.points - points} points until ${nr.label}` : 'You can redeem any reward'}</div>
      </div>

      {isHappyHour() && tier.id !== 'guest' && <div className="card row" style={{ marginTop: 12, background: 'var(--red-tint)', boxShadow: 'none', justifyContent: 'flex-start', gap: 8, color: 'var(--velvet)', fontWeight: 600 }}><Clock size={18} /> Double points until 5:30 PM</div>}

      <h2 className="section-title">Rewards you can get</h2>
      <div className="list-group">
        {appConfig.rewards.map((r) => {
          const ready = points >= r.points;
          return (
            <div key={r.points} className="list-row">
              <span className="icon-tile" style={{ background: 'var(--brass-soft)', color: 'var(--brass-ink)' }}><Gift size={18} /></span>
              <span style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{r.label} your order</div><div className="faint">{r.points} points{ready ? ' · ready to use' : ` · ${r.points - points} to go`}</div></span>
              {ready && <Button variant="outline-red" style={{ minHeight: 34, padding: '0 14px', fontSize: 13 }} onClick={() => nav('/order')}>Use</Button>}
            </div>
          );
        })}
        <div className="list-row"><span className="icon-tile" style={{ background: 'var(--brass-soft)', color: 'var(--brass-ink)' }}><Cake size={18} /></span>
          <span style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>${appConfig.birthdayReward} off on your birthday</div><div className="faint">Added automatically during your birthday week</div></span></div>
      </div>

      <h2 className="section-title">Visit streak</h2>
      <div className="card">
        <div className="row"><span style={{ fontWeight: 600 }}>{streak} {streak === 1 ? 'week' : 'weeks'} in a row</span><span className="faint">5 weeks = free drink</span></div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {Array.from({ length: 5 }, (_, i) => <div key={i} style={{ flex: 1, height: 26, borderRadius: 8, background: i < streak ? 'var(--velvet)' : 'var(--linen)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brass-ink)' }}>{i === 4 && i >= streak && <Gift size={15} />}</div>)}
        </div>
      </div>

      <h2 className="section-title">Key levels</h2>
      <div className="list-group">
        {appConfig.tiers.map((t) => (
          <div key={t.id} className="list-row" style={{ alignItems: 'flex-start' }}>
            <span className="icon-tile" style={t.id === tier.id ? { background: 'var(--velvet)', color: 'var(--on-dark)' } : undefined}><KeyRound size={18} /></span>
            <span style={{ flex: 1 }}>
              <div className="row"><b>{t.name}{t.id === tier.id ? ' · you' : ''}</b><span className="faint">{t.minPoints}+ lifetime pts</span></div>
              {PERKS[t.id]?.map((p) => <div key={p} className="muted">{p}</div>)}
            </span>
          </div>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 8 }}>{lifetime} lifetime points. {next ? `${next.minPoints - lifetime} more to reach ${next.name}.` : 'You\u2019re at the top tier.'} Spending rewards never lowers your tier.</p>
    </Screen>
  );
}
