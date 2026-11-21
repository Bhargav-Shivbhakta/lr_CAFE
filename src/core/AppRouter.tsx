import { HashRouter, Route, Routes } from 'react-router-dom';
import { enabledFeatures, getOverlays } from './registry';
import { TabBar } from './nav/TabBar';
import { Hub } from './nav/Hub';
import { makeComingSoon } from './nav/ComingSoon';
import { Screen, ToastHost } from './ui';

/** Routes are generated from the registry: /<feature-id>/<route.path>. Home owns "/". */
export function AppRouter() {
  const features = enabledFeatures();
  return (
    <HashRouter>
      <div className="app-shell">
        {/* Public demo: make it impossible to mistake for the café's real ordering app. */}
        <div role="note" style={{ background: 'var(--walnut)', color: '#fff', fontSize: 12, textAlign: 'center', padding: '6px 12px', lineHeight: 1.4 }}>
          Concept demo · not the official Living Room app · no real orders, texts or payments
        </div>
        <Routes>
          {features.flatMap((f) => {
            const base = f.id === 'home' ? '' : `/${f.id}`;
            if (f.status === 'soon' || !f.routes?.length) {
              const C = makeComingSoon(f);
              return [<Route key={f.id} path={base || '/'} element={<C />} />];
            }
            return f.routes.map((r) => {
              const C = r.element;
              const path = r.path ? `${base}/${r.path}` : base || '/';
              return <Route key={`${f.id}:${r.path}`} path={path} element={<C />} />;
            });
          })}
          <Route path="/more" element={<Screen title="More"><Hub /></Screen>} />
          <Route path="*" element={<Screen title="Not found" back="/"><p className="muted">That page moved out of the living room.</p></Screen>} />
        </Routes>
        <div className="overlay-slot">{getOverlays().map((f) => { const O = f.Overlay!; return <O key={f.id} />; })}</div>
        <TabBar />
        <ToastHost />
      </div>
    </HashRouter>
  );
}
