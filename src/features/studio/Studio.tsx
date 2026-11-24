import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shuffle, Send, Clock } from 'lucide-react';
import { safeJSONStorage } from '@/core/store/safeStorage';
import { useLocations, useMenu } from '@/core/hooks';
import { useApp } from '@/core/store/app';
import { LIMITS, inQuietHours, notify, promoSentToday } from '@/core/notifications';
import { TEMPLATES, composeNotification, type TemplateId } from '@/core/notifications/compose';
import { EVENTS } from '@/data/events';
import { Button, Chips, Screen, toast } from '@/core/ui';

type Audience = 'everyone' | 'guest' | 'regular' | 'family' | 'favorited';
const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'everyone', label: 'Everyone' }, { value: 'guest', label: 'Guests' }, { value: 'regular', label: 'Regulars' },
  { value: 'family', label: 'Family' }, { value: 'favorited', label: 'Favorited it' }];

interface LogEntry { id: string; title: string; body: string; audience: string; location: string; at: number; status: 'Sent' | 'Scheduled' }
const useStudioLog = create<{ log: LogEntry[]; add: (e: LogEntry) => void; setStatus: (id: string, s: LogEntry['status']) => void }>()(
  persist((set) => ({
    log: [],
    add: (e) => set((s) => ({ log: [e, ...s.log].slice(0, 30) })),
    setStatus: (id, status) => set((s) => ({ log: s.log.map((l) => (l.id === id ? { ...l, status } : l)) })),
  }), { name: 'living-room-studio', storage: safeJSONStorage }),
);

const len = (s: string) => [...s].length;
const fmtTime = (t: number) => new Date(t).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

export function StudioScreen() {
  const menu = useMenu();
  const locs = useLocations() ?? [];
  const currentLoc = useApp((s) => s.locationId);
  const { log, add, setStatus } = useStudioLog();

  const [template, setTemplate] = useState<TemplateId>('new-item');
  const [query, setQuery] = useState('');
  const [itemId, setItemId] = useState('pumpkin-chai');
  const [eventId, setEventId] = useState(EVENTS[0].id);
  const [locId, setLocId] = useState(currentLoc);
  const [audience, setAudience] = useState<Audience>('everyone');
  const [variant, setVariant] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [when, setWhen] = useState<'now' | 'later'>('now');
  const [time, setTime] = useState('15:00');

  const tpl = TEMPLATES.find((t) => t.id === template)!;
  const item = menu?.items.find((i) => i.id === itemId);
  const section = item ? menu?.categories.find((c) => c.id === item.categoryId)?.section : undefined;
  const event = EVENTS.find((e) => e.id === eventId);
  const locName = locs.find((l) => l.id === locId)?.name ?? 'the café';

  const drafts = useMemo(() => composeNotification({
    template, location: locName,
    item: item ? { name: item.name, description: item.description, price: item.price, section } : undefined,
    event: event ? { title: event.title, where: event.where, when: event.when } : undefined,
  }), [template, item, section, event, locName]);

  // A new template, item or version rewrites the copy; staff can then edit it freely.
  useEffect(() => { const d = drafts[variant % drafts.length]; setTitle(d.title); setBody(d.body); }, [drafts, variant]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu?.items ?? []).filter((i) => !q || i.name.toLowerCase().includes(q));
  }, [menu, query]);

  const sendAt = (() => {
    if (when === 'now') return new Date();
    const [h, m] = time.split(':').map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    return d;
  })();

  const errors: string[] = [];
  if (!title.trim()) errors.push('Add a title.');
  if (len(title) > LIMITS.title) errors.push(`Title is ${len(title)} characters; the limit is ${LIMITS.title}.`);
  if (!body.trim()) errors.push('Add a message.');
  if (len(body) > LIMITS.body) errors.push(`Message is ${len(body)} characters; the limit is ${LIMITS.body}.`);
  if (inQuietHours(sendAt)) errors.push('That time is in quiet hours (9 PM–8 AM). Pick a daytime slot.');
  const warning = promoSentToday(sendAt) ? 'Someone who got today’s announcement will get this one tomorrow instead (1 promo a day).' : null;

  function send() {
    if (errors.length) { toast(errors[0]); return; }
    const entry: LogEntry = { id: `s${Date.now()}`, title: title.trim(), body: body.trim(), audience: AUDIENCES.find((a) => a.value === audience)!.label, location: locName, at: sendAt.getTime(), status: when === 'now' ? 'Sent' : 'Scheduled' };
    const link = tpl.needs === 'event' ? '/events' : item ? `/order/item/${item.id}` : '/order';
    const fire = () => {
      const ok = notify({ kind: 'cafe', title: entry.title, body: entry.body, link });
      if (!ok) toast('Café news is switched off on this phone');
    };
    add(entry);
    if (when === 'now') { fire(); toast('Sent to this phone'); return; }
    const wait = sendAt.getTime() - Date.now();
    if (wait < 2 * 3600_000) setTimeout(() => { fire(); setStatus(entry.id, 'Sent'); }, wait);
    toast(`Scheduled for ${fmtTime(entry.at)}`);
  }

  return (
    <Screen title="Notification Studio" back>
      <p className="muted" style={{ marginTop: -8 }}>Write an announcement from what's on the menu. Demo: it's sent to this phone; in the live app only staff can send, from the server.</p>

      <h2 className="section-title">1. Template</h2>
      <Chips value={template} onChange={(v) => { setTemplate(v); setVariant(0); }} options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))} />
      <p className="faint" style={{ marginTop: 6 }}>{tpl.hint}</p>

      <h2 className="section-title">2. {tpl.needs === 'event' ? 'Event' : 'Menu item'}</h2>
      {tpl.needs === 'event' ? (
        <select className="input" aria-label="Event" value={eventId} onChange={(e) => { setEventId(e.target.value); setVariant(0); }}>
          {EVENTS.map((e) => <option key={e.id} value={e.id}>{e.title} · {e.where}</option>)}
        </select>
      ) : (
        <>
          <input className="input" aria-label="Search menu items" placeholder="Search the menu" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" aria-label="Menu item" style={{ marginTop: 8 }} value={itemId} onChange={(e) => { setItemId(e.target.value); setVariant(0); }}>
            {menu?.categories.map((c) => {
              const inCat = results.filter((i) => i.categoryId === c.id);
              return inCat.length ? <optgroup key={c.id} label={c.name}>{inCat.map((i) => <option key={i.id} value={i.id}>{i.name} · ${i.price.toFixed(2)}</option>)}</optgroup> : null;
            })}
            {item && !results.includes(item) && <option value={item.id}>{item.name}</option>}
          </select>
        </>
      )}

      <h2 className="section-title">3. Message</h2>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="faint">Version {(variant % drafts.length) + 1} of {drafts.length}</span>
        <Button variant="quiet" style={{ minHeight: 36, padding: '0 14px', fontSize: 14 }} onClick={() => setVariant((v) => v + 1)}><Shuffle size={16} /> Another version</Button>
      </div>
      <label><span className="field-label row">Title <span className="faint" style={{ color: len(title) > LIMITS.title ? 'var(--danger)' : undefined }}>{len(title)}/{LIMITS.title}</span></span>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label><span className="field-label row">Message <span className="faint" style={{ color: len(body) > LIMITS.body ? 'var(--danger)' : undefined }}>{len(body)}/{LIMITS.body}</span></span>
        <textarea className="input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} style={{ resize: 'none' }} /></label>

      <h2 className="section-title">4. Who gets it</h2>
      <Chips value={audience} onChange={setAudience} options={AUDIENCES} />
      <select className="input" aria-label="Location" style={{ marginTop: 10 }} value={locId} onChange={(e) => setLocId(e.target.value)}>
        {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      <h2 className="section-title">5. Preview</h2>
      <div className="lock-preview">
        <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.75 }}>{sendAt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <div style={{ textAlign: 'center', fontSize: 52, fontWeight: 600, letterSpacing: -2, lineHeight: 1.1 }}>{sendAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</div>
        <div style={{ background: 'var(--glass)', borderRadius: 18, padding: '10px 12px', marginTop: 16, display: 'flex', gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--velvet)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>LR</span>
          <span style={{ minWidth: 0 }}>
            <span className="row" style={{ fontSize: 12, opacity: 0.7 }}><span>LIVING ROOM</span><span>now</span></span>
            <b style={{ display: 'block', fontSize: 14 }}>{title || 'Title'}</b>
            <span style={{ display: 'block', fontSize: 13.5, opacity: 0.85, lineHeight: 1.35 }}>{body || 'Message'}</span>
          </span>
        </div>
      </div>

      <h2 className="section-title">6. Send</h2>
      <Chips value={when} onChange={setWhen} options={[{ value: 'now', label: 'Send now' }, { value: 'later', label: 'Schedule' }]} />
      {when === 'later' && <label><span className="field-label">Time</span><input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>}
      {errors.map((e) => <div key={e} className="field-error">{e}</div>)}
      {warning && !errors.length && <div className="faint" style={{ marginTop: 8 }}>{warning}</div>}
      <Button block style={{ marginTop: 14 }} onClick={send} disabled={!!errors.length}>
        {when === 'now' ? <><Send size={17} /> Send to {AUDIENCES.find((a) => a.value === audience)!.label.toLowerCase()}</> : <><Clock size={17} /> Schedule for {fmtTime(sendAt.getTime())}</>}
      </Button>

      {log.length > 0 && <>
        <h2 className="section-title">Sent and scheduled</h2>
        <div className="list-group">
          {log.map((l) => (
            <div key={l.id} className="list-row" style={{ alignItems: 'flex-start' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="row"><b style={{ fontSize: 14.5 }}>{l.title}</b><span className="badge-soon" style={l.status === 'Sent' ? { background: 'var(--red-tint)', color: 'var(--velvet)' } : undefined}>{l.status}</span></span>
                <span className="muted" style={{ display: 'block' }}>{l.body}</span>
                <span className="faint">{l.audience} · {l.location} · {fmtTime(l.at)}</span>
              </span>
            </div>
          ))}
        </div>
      </>}
    </Screen>
  );
}
