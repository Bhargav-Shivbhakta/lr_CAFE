import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Where a feature shows up in navigation. */
export type NavPlacement =
  | 'tab'      // bottom tab bar (max 5 — overflow moves into the "More" hub automatically)
  | 'hub'      // the "More" hub inside the You tab, grouped by `hubSection`
  | 'hidden';  // reachable only by deep link / from other screens

/** Lifecycle — lets us ship navigation for features that aren't built yet. */
export type FeatureStatus = 'live' | 'beta' | 'soon';

export type HubSection = 'At the café' | 'Ordering' | 'Your account' | 'Help';

export interface FeatureRoute {
  path: string;                 // relative to the feature base path, '' = index
  element: ComponentType;
}

export interface FeatureModule {
  id: string;                   // unique, kebab-case; also the URL base: /<id>
  title: string;                // shown in nav
  subtitle?: string;            // shown in the hub list
  icon: LucideIcon;
  status: FeatureStatus;
  nav: { placement: NavPlacement; order: number; hubSection?: HubSection };
  routes?: FeatureRoute[];      // omit for 'soon' features — a waitlist screen is generated
  /** Optional card the feature contributes to the Home screen. Lower = higher up. */
  homeWidget?: { order: number; component: ComponentType };
  /** Badge on the tab icon, e.g. cart count. Must be a hook-safe component. */
  Badge?: ComponentType;
  /** Global floating UI the feature owns (e.g. the cart bar). Rendered above the tab bar. */
  Overlay?: ComponentType;
  /** Locations where this feature is available; omit = all. */
  locations?: string[];
  requiresAuth?: boolean;
  /** Short pitch text for 'soon' screens. */
  comingSoonPitch?: ReactNode;
}
