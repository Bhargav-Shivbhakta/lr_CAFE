// Loading states. Spinners are not allowed anywhere in the app (RULES.md § Motion):
// use <CupLoader/> for short waits and <PipLoader/> for longer ones.
import { useId } from 'react';
import { Pip } from './Pip';
import '../css/motion.css';

const CUP = 'M24 34h60v38a26 26 0 0 1-26 26h-8a26 26 0 0 1-26-26z';

/** The signature loader: coffee rises in a cup and steam appears when it is full. */
export function CupLoader({ label = 'Loading', size = 96 }: { label?: string; size?: 48 | 96 }) {
  const id = useId();
  return (
    <div role="status" aria-live="polite" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <defs><clipPath id={id}><path d={CUP} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          <rect className="m-cup-fill" x="20" y="30" width="70" height="80" fill="#6B4430" />
          <rect className="m-cup-fill" x="20" y="30" width="70" height="5" fill="#C99A6B" />
        </g>
        <path d={CUP} fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M84 46h6a12 12 0 0 1 0 24h-6" fill="none" stroke="var(--ink)" strokeWidth="4" />
        <path className="m-cup-steam" d="M44 26c-5-5 4-8 0-14M62 26c-5-5 4-8 0-14" stroke="var(--muted)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
      <span className="t-label" style={{ color: 'var(--muted)' }}>{label}…</span>
    </div>
  );
}

/** Longer waits (placing an order, first load): Pip naps, pours or juggles. */
export function PipLoader({ variant = 'sleep', label = 'Brewing' }: { variant?: 'sleep' | 'juggle'; label?: string }) {
  return (
    <div role="status" aria-live="polite" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
      <Pip size={96} pose={variant === 'sleep' ? 'brewing' : 'reward'} animation={variant} label={`${label}`} />
      <span className="t-label" style={{ color: 'var(--muted)' }}>{label}…</span>
    </div>
  );
}
