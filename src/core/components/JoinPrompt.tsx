import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { appConfig } from '../config/flags';
import { Button } from '../ui';

/** Shown in place of member-only content. Sign-in is asked for only when it's actually needed. */
export function JoinPrompt({ title = 'Join House Key', body }: { title?: string; body?: string }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="card" style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--warm)' }}>
      <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--velvet)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><KeyRound size={26} /></div>
      <h2 className="display" style={{ fontSize: 22, margin: '14px 0 6px' }}>{title}</h2>
      <p className="muted" style={{ margin: '0 auto 18px', maxWidth: 280, lineHeight: 1.5 }}>{body ?? `Earn ${appConfig.pointsPerDollar} point per $1, get ${appConfig.signUpBonus} points just for joining, and $${appConfig.birthdayReward} off on your birthday.`}</p>
      <Button onClick={() => nav(`/join?next=${encodeURIComponent(pathname)}`)}>Join now</Button>
    </div>
  );
}
