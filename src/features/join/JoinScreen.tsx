import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquareText, X } from 'lucide-react';
import { authService } from '@/core/services';
import { appConfig } from '@/core/config/flags';
import { useApp } from '@/core/store/app';
import { Button, toast } from '@/core/ui';

const digits = (s: string) => s.replace(/\D/g, '').slice(0, 10);
const formatPhone = (s: string) => {
  const d = digits(s);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export function JoinScreen() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const signUp = useApp((s) => s.signUp);
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    const e: Record<string, string> = {};
    if (!first.trim()) e.first = 'Enter your first name';
    if (!last.trim()) e.last = 'Enter your last name';
    if (digits(phone).length !== 10) e.phone = 'Enter a 10-digit US mobile number';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const r = await authService.sendCode('+1' + digits(phone));
    setDemoCode(r.demoCode); setStep('code'); setBusy(false);
  }

  async function verify() {
    if (code.trim().length !== 6) { setErrors({ code: 'Enter the 6-digit code' }); return; }
    setBusy(true);
    try {
      const user = await authService.verify('+1' + digits(phone), code, { firstName: first.trim(), lastName: last.trim() });
      signUp(user);
      toast(`Welcome home, ${user.firstName}. +${appConfig.signUpBonus} points`);
      nav(next, { replace: true });
    } catch (err) { setErrors({ code: (err as Error).message }); }
    finally { setBusy(false); }
  }

  return (
    <main className="screen" style={{ paddingBottom: 40 }}>
      <div className="row"><span className="wordmark" style={{ fontSize: 20 }}>{appConfig.brand}</span>
        <button aria-label="Close" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))}><X size={24} /></button></div>

      {step === 'details' ? (
        <>
          <h1 className="large-title" style={{ marginTop: 28 }}>Pull up a chair.</h1>
          <p className="muted" style={{ fontSize: 15, marginTop: -6, lineHeight: 1.5 }}>Join House Key and get {appConfig.signUpBonus} points right away, 1 point for every $1 and ${appConfig.birthdayReward} off on your birthday.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ flex: 1 }}><span className="field-label">First name</span>
              <input className="input" autoComplete="given-name" value={first} onChange={(e) => { setFirst(e.target.value); setErrors({}); }} />
              {errors.first && <div className="field-error">{errors.first}</div>}</label>
            <label style={{ flex: 1 }}><span className="field-label">Last name</span>
              <input className="input" autoComplete="family-name" value={last} onChange={(e) => { setLast(e.target.value); setErrors({}); }} />
              {errors.last && <div className="field-error">{errors.last}</div>}</label>
          </div>
          <label><span className="field-label">Mobile number</span>
            <input className="input" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(619) 555-0123" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setErrors({}); }} />
            {errors.phone && <div className="field-error">{errors.phone}</div>}</label>
          <label className="row" style={{ justifyContent: 'flex-start', gap: 10, margin: '16px 0 24px', fontSize: 14 }}>
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--velvet)' }} />
            Text me when my order is ready
          </label>
          <Button block onClick={sendCode} disabled={busy}>{busy ? 'Sending code…' : 'Send code'}</Button>
          <p className="faint" style={{ marginTop: 12, lineHeight: 1.5 }}>We'll text a 6-digit code to confirm it's you. Message and data rates may apply.</p>
        </>
      ) : (
        <>
          <h1 className="large-title" style={{ marginTop: 28 }}>Enter your code</h1>
          <p className="muted" style={{ fontSize: 15, marginTop: -6 }}>Sent to {phone}. <button style={{ color: 'var(--velvet)', fontWeight: 600 }} onClick={() => { setStep('details'); setCode(''); }}>Change</button></p>
          {demoCode && <div className="card row" style={{ background: 'var(--brass-soft)', boxShadow: 'none', justifyContent: 'flex-start', gap: 10, margin: '14px 0' }}>
            <MessageSquareText size={20} color="#7A5A17" /><span style={{ fontSize: 14 }}>Demo mode, no real text sent. Your code is <b style={{ letterSpacing: 2 }}>{demoCode}</b></span></div>}
          <input className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setErrors({}); }}
            style={{ fontSize: 28, letterSpacing: 12, textAlign: 'center', padding: 16 }} />
          {errors.code && <div className="field-error">{errors.code}</div>}
          <Button block onClick={verify} disabled={busy} style={{ marginTop: 20 }}>{busy ? 'Checking…' : 'Verify and join'}</Button>
          <button className="muted" style={{ display: 'block', margin: '14px auto 0' }} onClick={sendCode}>Send a new code</button>
        </>
      )}
    </main>
  );
}
