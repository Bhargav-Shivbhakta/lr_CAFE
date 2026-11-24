import type { FeatureModule, HubSection } from './types';
import { featureFlags, appConfig } from '../config/flags';

const modules: FeatureModule[] = [];

/** Called once in features/index.ts. Order of registration does not matter. */
export function registerFeatures(list: FeatureModule[]) {
  for (const m of list) {
    if (modules.some((x) => x.id === m.id)) throw new Error(`Duplicate feature id: ${m.id}`);
    modules.push(m);
  }
}

export const enabledFeatures = () => modules.filter((m) => featureFlags[m.id] !== false);
export const getFeature = (id: string) => enabledFeatures().find((m) => m.id === id);

/** Bottom tabs. If more than maxTabs want a tab, the last slot becomes "More". */
export function getTabs(): { tabs: FeatureModule[]; overflow: FeatureModule[] } {
  const wanted = enabledFeatures()
    .filter((m) => m.nav.placement === 'tab')
    .sort((a, b) => a.nav.order - b.nav.order);
  if (wanted.length <= appConfig.maxTabs) return { tabs: wanted, overflow: [] };
  return { tabs: wanted.slice(0, appConfig.maxTabs - 1), overflow: wanted.slice(appConfig.maxTabs - 1) };
}

const SECTION_ORDER: HubSection[] = ['At the café', 'Ordering', 'Your account', 'Café team', 'Help'];

/** Everything that lives in the "More" hub, grouped by section — includes tab overflow. */
export function getHub(): { section: HubSection; items: FeatureModule[] }[] {
  const { overflow } = getTabs();
  const items = [...enabledFeatures().filter((m) => m.nav.placement === 'hub'), ...overflow];
  return SECTION_ORDER.map((section) => ({
    section,
    items: items
      .filter((m) => (m.nav.hubSection ?? 'At the café') === section)
      .sort((a, b) => a.nav.order - b.nav.order),
  })).filter((g) => g.items.length > 0);
}

export const getHomeWidgets = () =>
  enabledFeatures()
    .filter((m) => m.homeWidget && m.status !== 'soon')
    .sort((a, b) => a.homeWidget!.order - b.homeWidget!.order);

export const getOverlays = () => enabledFeatures().filter((m) => m.Overlay);
export const getServices = () => enabledFeatures().filter((m) => m.Service);
export const getHeaderActions = () => enabledFeatures().filter((m) => m.HeaderAction);
