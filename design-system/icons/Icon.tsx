// GENERATED from the design canvas. 24 pt grid, round ends.
// Rules: one stroke weight everywhere (tokens.choice.iconWeight). Icons that act alone need a label.
import { tokens } from '../tokens/tokens';

const PATHS = {
  home: <><path d="M3 11l9-7 9 7"></path><path d="M5 10v10h14V10"></path></>,
  order: <><path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"></path><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"></path><path d="M8 2v3M12 2v3"></path></>,
  rewards: <><rect x="3" y="8" width="18" height="13" rx="2"></rect><path d="M12 8v13M3 12h18"></path><path d="M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6-.5 6-1.5S14 4 12 8z"></path></>,
  account: <><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></>,
  bag: <><path d="M5 8h14l-1 13H6z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></>,
  favorite: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path></>,
  search: <><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></>,
  location: <><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle></>,
  clock: <><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><path d="M14 14h3v3M21 14v7h-4M14 21v-3"></path></>,
  star: <><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"></path></>,
  plus: <><path d="M12 5v14M5 12h14"></path></>,
  minus: <><path d="M5 12h14"></path></>,
  back: <><path d="M15 5l-7 7 7 7"></path></>,
  close: <><path d="M6 6l12 12M18 6L6 18"></path></>,
  leaf: <><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"></path><path d="M5 19l8-8"></path></>,
  croissant: <><path d="M3 15c3-8 15-8 18 0"></path><path d="M7 11l2 6M12 9.5v7.5M17 11l-2 6"></path></>,
  event: <><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></>,
  settings: <><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"></path></>,
} as const;
export type IconName = keyof typeof PATHS;
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

interface IconProps { name: IconName; size?: 16 | 20 | 24 | 28; label?: string; color?: string }

/** Decorative unless `label` is given; an icon-only button must pass a label. */
export function Icon({ name, size = 24, label, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={tokens.choice.iconWeight}
      strokeLinecap="round" strokeLinejoin="round" {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      {PATHS[name]}
    </svg>
  );
}
export default Icon;
