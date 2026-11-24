import { Bell, CreditCard, Info, LogOut } from 'lucide-react';
import { Hub } from '@/core/nav/Hub';
import { useApp } from '@/core/store/app';
import { JoinPrompt } from '@/core/components/JoinPrompt';
import { ListRow, Screen, toast } from '@/core/ui';

export function YouScreen() {
  const user = useApp((s) => s.user);
  const orders = useApp((s) => s.orders.length);
  const signOut = useApp((s) => s.signOut);
  return (
    <Screen title={user ? `Hi, ${user.firstName}` : 'Account'}>
      {user ? (
        <div className="card row">
          <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--velvet)', color: 'var(--on-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>{user.firstName[0]?.toUpperCase()}</span>
            <span><div style={{ fontWeight: 600, fontSize: 17 }}>{user.firstName} {user.lastName}</div><div className="muted">{user.phone.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')} · member since {user.since}</div><div className="faint">{orders} app {orders === 1 ? 'order' : 'orders'}</div></span>
          </span>
        </div>
      ) : <JoinPrompt />}
      {/* Every feature registered with placement 'hub' shows up here automatically. */}
      <Hub />
      <h2 className="section-title">Settings</h2>
      <div className="list-group">
        <ListRow icon={Bell} title="Notifications" subtitle="Order ready, double points, live music" onClick={() => toast('Push notifications come with the store app')} />
        <ListRow icon={CreditCard} title="Payment methods" subtitle="Apple Pay, Google Pay and cards — next step" onClick={() => toast('Payments are the next step to connect')} />
        <ListRow icon={Info} title="About" subtitle="Living Room concept app · v0.2" />
        {user && <ListRow icon={LogOut} title="Sign out" onClick={() => { signOut(); toast('Signed out'); }} />}
      </div>
    </Screen>
  );
}
