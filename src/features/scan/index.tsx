import { useState } from 'react';
import { QrCode, Star } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { appConfig } from '@/core/config/flags';
import { useApp } from '@/core/store/app';
import { QR } from '@/core/components/QR';
import { JoinPrompt } from '@/core/components/JoinPrompt';
import { Screen, Segmented } from '@/core/ui';

function ScanScreen() {
  const user = useApp((s) => s.user);
  const points = useApp((s) => s.points);
  const [mode, setMode] = useState<'earn' | 'pay'>('earn');
  if (!user) return <Screen title="Scan"><JoinPrompt title="Scan to earn points" body="Join House Key to get a member code you can scan at any Living Room counter." /></Screen>;
  return (
    <Screen title="Scan">
      <Segmented value={mode} onChange={setMode} options={[{ value: 'earn', label: 'Earn points' }, { value: 'pay', label: 'Scan and pay' }]} />
      <div style={{ background: 'var(--walnut)', color: '#fff', borderRadius: 22, padding: 22, marginTop: 16, textAlign: 'center' }}>
        <div className="row"><span className="wordmark" style={{ fontSize: 18 }}>{appConfig.brand}</span><span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>{points} <Star size={16} color="var(--brass)" fill="var(--brass)" /></span></div>
        {mode === 'earn' ? <>
          <div style={{ background: '#fff', borderRadius: 16, padding: 14, display: 'inline-block', margin: '18px 0 12px' }}><QR seed={user.id} size={190} /></div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{user.firstName} {user.lastName}</div>
          <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>Show this at the counter to earn points</div>
        </> : <div style={{ padding: '40px 10px' }}>
          <QrCode size={48} color="var(--lamp)" />
          <div style={{ fontWeight: 600, fontSize: 17, marginTop: 12 }}>Scan and pay is coming soon</div>
          <div style={{ opacity: 0.7, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>Load a gift card balance and pay with one scan. It turns on once payments are connected.</div>
        </div>}
      </div>
    </Screen>
  );
}

export const scanFeature: FeatureModule = {
  id: 'scan', title: 'Scan', icon: QrCode, status: 'live',
  nav: { placement: 'tab', order: 3 },
  routes: [{ path: '', element: ScanScreen }],
};
