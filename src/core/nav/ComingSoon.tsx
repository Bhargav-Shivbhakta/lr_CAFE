import { useState } from 'react';
import type { FeatureModule } from '../registry/types';
import { Button, Screen, toast } from '../ui';

/** Auto-generated screen for features with status 'soon' — the nav slot exists before the feature does. */
export function makeComingSoon(f: FeatureModule) {
  return function ComingSoon() {
    const [joined, setJoined] = useState(false);
    const Icon = f.icon;
    return (
      <Screen back>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: 'var(--velvet)', color: 'var(--lamp)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={40} strokeWidth={1.6} /></div>
          <h1 className="large-title" style={{ marginTop: 20 }}>{f.title}</h1>
          <p className="muted" style={{ maxWidth: 300, margin: '0 auto 28px', fontSize: 15, lineHeight: 1.5 }}>{f.comingSoonPitch ?? f.subtitle}</p>
          <Button block disabled={joined} onClick={() => { setJoined(true); toast("You're on the list"); }}>{joined ? "You're on the list" : 'Tell me when it opens'}</Button>
        </div>
      </Screen>
    );
  };
}
