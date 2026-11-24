import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Star } from 'lucide-react';
import { askSystemPermission, systemPermission, useNotifications } from '@/core/notifications';
import { Button, Screen, toast } from '@/core/ui';
import { useState } from 'react';

const ICON = { order: Coffee, rewards: Star, cafe: Bell } as const;
const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'now'; if (m < 60) return `${m}m`; const h = Math.round(m / 60);
  return h < 24 ? `${h}h` : new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export function InboxScreen() {
  const items = useNotifications((s) => s.items);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const markRead = useNotifications((s) => s.markRead);
  const nav = useNavigate();
  const unread = items.filter((i) => !i.read).length;
  return (
    <Screen title="Notifications" back action={unread ? <button className="muted" onClick={markAllRead}>Mark all read</button> : undefined}>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <Bell size={40} color="var(--text-3)" strokeWidth={1.5} />
          <h2 className="display" style={{ fontSize: 20 }}>Nothing new yet</h2>
          <p className="muted">Order updates, rewards and café news will show up here.</p>
        </div>
      ) : (
        <div className="list-group">
          {items.map((n) => { const Icon = ICON[n.kind]; return (
            <button key={n.id} className="list-row" style={{ alignItems: 'flex-start', background: n.read ? undefined : 'var(--red-tint)' }}
              onClick={() => { markRead(n.id); if (n.link) nav(n.link); }}>
              <span className="icon-tile"><Icon size={18} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="row"><b style={{ fontSize: 15 }}>{n.title}</b><span className="faint">{ago(n.createdAt)}</span></span>
                <span className="muted" style={{ display: 'block', marginTop: 2 }}>{n.body}</span>
              </span>
            </button>); })}
        </div>
      )}
      <Button variant="quiet" block style={{ marginTop: 20 }} onClick={() => nav('/inbox/settings')}>Notification settings</Button>
    </Screen>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange?: (v: boolean) => void; label: string }) {
  return <button role="switch" aria-checked={on} aria-label={label} className="switch" disabled={!onChange} onClick={() => onChange?.(!on)} />;
}

export function NotificationSettings() {
  const prefs = useNotifications((s) => s.prefs);
  const setPref = useNotifications((s) => s.setPref);
  const [perm, setPerm] = useState(systemPermission());
  return (
    <Screen title="Notification settings" back>
      <div className="list-group">
        <div className="list-row"><span style={{ flex: 1 }}><b>Order updates</b><div className="muted">Received, brewing, ready. Always on.</div></span><Toggle on label="Order updates" /></div>
        <div className="list-row"><span style={{ flex: 1 }}><b>Rewards</b><div className="muted">Points earned, rewards ready, new tier</div></span><Toggle on={prefs.rewards} onChange={(v) => setPref('rewards', v)} label="Rewards" /></div>
        <div className="list-row"><span style={{ flex: 1 }}><b>Café news</b><div className="muted">New items, events, happy hour. At most 1 a day, never 9 PM–8 AM</div></span><Toggle on={prefs.cafe} onChange={(v) => setPref('cafe', v)} label="Café news" /></div>
      </div>
      <h2 className="section-title">On this phone</h2>
      <div className="card">
        {perm === 'granted' && <p className="muted" style={{ margin: 0 }}>Phone notifications are on.</p>}
        {perm === 'denied' && <p className="muted" style={{ margin: 0 }}>Phone notifications are blocked. Turn them on in your browser or phone settings.</p>}
        {perm === 'unsupported' && <p className="muted" style={{ margin: 0 }}>This browser can't show phone notifications. You'll still see them in the app.</p>}
        {perm === 'default' && <>
          <p className="muted" style={{ marginTop: 0 }}>Get a notification even when the app is closed.</p>
          <Button onClick={async () => { const r = await askSystemPermission(); setPerm(r); if (r === 'granted') toast('Phone notifications on'); }}>Turn on</Button>
        </>}
      </div>
    </Screen>
  );
}

/** Bell for the Home header. Lives with the inbox feature, exported for Home via the registry-free UI slot. */
export function InboxBell() {
  const unread = useNotifications((s) => s.items.filter((i) => !i.read).length);
  const nav = useNavigate();
  return (
    <button aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} onClick={() => nav('/inbox')}
      style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Bell size={22} />
      {unread > 0 && <span className="bell-dot">{unread > 9 ? '9+' : unread}</span>}
    </button>
  );
}
