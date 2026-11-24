// GENERATED from the Pip drawing on the design canvas. Change the drawing there, then regenerate; do not hand-edit.
// Pip, the Living Room cup. Rules: design-system/RULES.md § Mascot.
import { useId } from 'react';
import type { Outfit, PoseId } from '../tokens/tokens';
import './pip.css';

export type PipEyes = "open" | "happy" | "closed" | "wink" | "up" | "wide" | "heart" | "star";
export type PipMouth = "smile" | "open" | "o" | "flat" | "small" | "cat" | "tongue";
export type PipArms = "default" | "none" | "wave" | "up" | "chin" | "bell" | "thumb" | "hug" | "glass";
export type PipEffect = "zzz" | "sweat" | "question";
/** One-shot animations play `plays` times then rest; idle, sleep, pour and juggle loop (loading). */
export type PipAnimation = 'idle' | 'wave' | 'hop' | 'dance' | 'twirl' | 'party' | 'sleep' | 'pour' | 'juggle' | 'peek' | 'search' | 'love' | 'thumb' | 'hug' | 'fill' | 'squish' | 'sneeze' | 'stretch' | 'shiver' | 'oops';

const EYES: Record<PipEyes, JSX.Element | null> = {
  open: <><g className="pe"><ellipse cx="46" cy="70" rx="8.5" ry="10" fill="#FFFFFF"></ellipse><ellipse cx="74" cy="70" rx="8.5" ry="10" fill="#FFFFFF"></ellipse><g className="pp"><circle cx="47" cy="72" r="5.4" fill="#2B1D16"></circle><circle cx="75" cy="72" r="5.4" fill="#2B1D16"></circle><circle cx="49.2" cy="69.4" r="2.1" fill="#FFFFFF"></circle><circle cx="77.2" cy="69.4" r="2.1" fill="#FFFFFF"></circle><circle cx="45.4" cy="74.6" r="1" fill="#FFFFFF"></circle><circle cx="73.4" cy="74.6" r="1" fill="#FFFFFF"></circle></g></g></>,
  happy: <><path d="M39 73q7-9 14 0M67 73q7-9 14 0" stroke="#FFF1E6" strokeWidth="3.4" fill="none" strokeLinecap="round"></path></>,
  closed: <><path d="M39 70q7 6 14 0M67 70q7 6 14 0" stroke="#FFF1E6" strokeWidth="3.4" fill="none" strokeLinecap="round"></path></>,
  wink: <><ellipse cx="46" cy="70" rx="8.5" ry="10" fill="#FFFFFF"></ellipse><circle cx="47" cy="72" r="5.4" fill="#2B1D16"></circle><circle cx="49.2" cy="69.4" r="2.1" fill="#FFFFFF"></circle><path d="M67 72q7-8 14 0" stroke="#FFF1E6" strokeWidth="3.4" fill="none" strokeLinecap="round"></path></>,
  up: <><g className="pe"><ellipse cx="46" cy="70" rx="8.5" ry="10" fill="#FFFFFF"></ellipse><ellipse cx="74" cy="70" rx="8.5" ry="10" fill="#FFFFFF"></ellipse><circle cx="44" cy="66" r="5.4" fill="#2B1D16"></circle><circle cx="72" cy="66" r="5.4" fill="#2B1D16"></circle><circle cx="46" cy="64" r="1.8" fill="#FFFFFF"></circle><circle cx="74" cy="64" r="1.8" fill="#FFFFFF"></circle></g></>,
  wide: <><ellipse cx="46" cy="69" rx="10" ry="11.5" fill="#FFFFFF"></ellipse><ellipse cx="74" cy="69" rx="10" ry="11.5" fill="#FFFFFF"></ellipse><circle cx="46" cy="70" r="3.6" fill="#2B1D16"></circle><circle cx="74" cy="70" r="3.6" fill="#2B1D16"></circle><circle cx="47.4" cy="68.6" r="1.2" fill="#FFFFFF"></circle><circle cx="75.4" cy="68.6" r="1.2" fill="#FFFFFF"></circle></>,
  heart: <><g className="ph"><path d="M46 79s-9-5.6-9-11.2a4.5 4.5 0 0 1 9-1.3 4.5 4.5 0 0 1 9 1.3c0 5.6-9 11.2-9 11.2zM74 79s-9-5.6-9-11.2a4.5 4.5 0 0 1 9-1.3 4.5 4.5 0 0 1 9 1.3c0 5.6-9 11.2-9 11.2z" fill="#FFF1E6"></path></g></>,
  star: <><path d="M46 62l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8zM74 62l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#F7D58A"></path></>,
};

const MOUTHS: Record<PipMouth, JSX.Element | null> = {
  smile: <><path d="M54 85q6 6 12 0" stroke="#FFF1E6" strokeWidth="3.2" fill="none" strokeLinecap="round"></path></>,
  open: <><path d="M52 83q8 12 16 0z" fill="#3A1010"></path><path d="M56 88q4 2.5 8 0" stroke="#E07A80" strokeWidth="2.6" fill="none" strokeLinecap="round"></path></>,
  o: <><ellipse className="pmo" cx="60" cy="87" rx="3.8" ry="4.8" fill="#3A1010"></ellipse></>,
  flat: <><path d="M55 87h10" stroke="#FFF1E6" strokeWidth="3.2" strokeLinecap="round"></path></>,
  small: <><path d="M57 86q3 2.4 6 0" stroke="#FFF1E6" strokeWidth="3.2" fill="none" strokeLinecap="round"></path></>,
  cat: <><path d="M53 85q3.5 4 7 0q3.5 4 7 0" stroke="#FFF1E6" strokeWidth="3" fill="none" strokeLinecap="round"></path></>,
  tongue: <><path d="M53 84q7 7 14 0" stroke="#FFF1E6" strokeWidth="3.2" fill="none" strokeLinecap="round"></path><path d="M60 88q0 6 4 5q3-1 1-6" fill="#E07A80"></path></>,
};

const ARMS: Record<PipArms, JSX.Element | null> = {
  default: <><g className="al"><path d="M21 86q-8 4-9 13" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="12" cy="99" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 88q6 4 6 10" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="105" cy="98" r="5.5" fill="#B81F35"></circle></g></>,
  none: null,
  wave: <><g className="al wave"><path d="M21 80q-13-4-15-24" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="6" cy="54" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 88q6 4 6 10" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="105" cy="98" r="5.5" fill="#B81F35"></circle></g></>,
  up: <><g className="al"><path d="M21 76q-14-8-14-28" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="7" cy="46" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 50q12-8 12-26" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="111" cy="22" r="5.5" fill="#B81F35"></circle></g></>,
  chin: <><g className="al"><path d="M21 90q-9 0-5-7q4-4 15-1" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="31" cy="82" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 88q6 4 6 10" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="105" cy="98" r="5.5" fill="#B81F35"></circle></g></>,
  bell: <><g className="al"><path d="M21 80q-13-4-15-24" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="6" cy="54" r="5.5" fill="#B81F35"></circle></g><path d="M-3 50q9-16 18 0z" fill="#D9B97A"></path><circle cx="6" cy="52" r="2.6" fill="#8C6A2C"></circle><path d="M-8 36q-3 4 0 8M20 36q3 4 0 8" stroke="#8C6A2C" strokeWidth="2" fill="none" strokeLinecap="round"></path><g className="ar"><path d="M99 88q6 4 6 10" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="105" cy="98" r="5.5" fill="#B81F35"></circle></g></>,
  thumb: <><g className="al"><path d="M21 86q-8 4-9 13" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="12" cy="99" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 82q12-2 14-14" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><rect x="107" y="58" width="12" height="13" rx="5" fill="#B81F35"></rect><rect x="110" y="48" width="6" height="13" rx="3" fill="#B81F35"></rect></g></>,
  hug: <><g className="al"><path d="M21 84q8 10 22 8" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="43" cy="92" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 84q-8 10-22 8" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="77" cy="92" r="5.5" fill="#B81F35"></circle></g></>,
  glass: <><g className="al"><path d="M21 86q-8 4-9 13" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="12" cy="99" r="5.5" fill="#B81F35"></circle></g><g className="ar"><path d="M99 80q10-4 12-14" stroke="#B81F35" strokeWidth="7" fill="none" strokeLinecap="round"></path><circle cx="114" cy="54" r="10" fill="rgba(255,255,255,.35)" stroke="#8C6A2C" strokeWidth="3.5"></circle></g></>,
};

const OUTFITS: Record<Outfit, JSX.Element | null> = {
  beanie: <><path d="M22 40q38-48 76 0z" fill="#2F4B3A"></path><rect x="16" y="31" width="88" height="12" rx="6" fill="#E9E2D2"></rect><circle cx="60" cy="-6" r="8" fill="#E9E2D2"></circle></>,
  scarf: <><rect x="18" y="94" width="84" height="10" rx="5" fill="#D9822B"></rect><rect x="30" y="98" width="10" height="20" rx="4" fill="#C46F1E"></rect></>,
  pumpkin: <><path d="M100 104q12-10 24 0q4 12-12 14q-16-2-12-14z" fill="#D9822B"></path><path d="M112 100v-6" stroke="#2F4B3A" strokeWidth="3" strokeLinecap="round"></path></>,
  hearts: <><path d="M2 28s-6-3.8-6-7.6a3 3 0 0 1 6-.9 3 3 0 0 1 6 .9c0 3.8-6 7.6-6 7.6z" fill="#E07A80"></path><path d="M108 12s-6-3.8-6-7.6a3 3 0 0 1 6-.9 3 3 0 0 1 6 .9c0 3.8-6 7.6-6 7.6z" fill="#F4A3A8"></path><path d="M114 100s-6-3.8-6-7.6a3 3 0 0 1 6-.9 3 3 0 0 1 6 .9c0 3.8-6 7.6-6 7.6z" fill="#E07A80"></path></>,
  party: <><path d="M46 36L60-2L74 36z" fill="#B08A3E"></path><path d="M51 24h18M55 12h10" stroke="#FFF1E6" strokeWidth="3"></path><circle cx="60" cy="-4" r="5.5" fill="#C42A3E"></circle><path d="M8 14.399999999999999q1.2000000000000002 4.4 5.6000000000000005 5.6000000000000005q-4.4 1.2000000000000002 -5.6000000000000005 5.6000000000000005q-1.2000000000000002 -4.4 -5.6000000000000005 -5.6000000000000005q4.4 -1.2000000000000002 5.6000000000000005 -5.6000000000000005z" fill="#B08A3E"></path><path d="M114 7.1000000000000005q1.0499999999999998 3.8499999999999996 4.8999999999999995 4.8999999999999995q-3.8499999999999996 1.0499999999999998 -4.8999999999999995 4.8999999999999995q-1.0499999999999998 -3.8499999999999996 -4.8999999999999995 -4.8999999999999995q3.8499999999999996 -1.0499999999999998 4.8999999999999995 -4.8999999999999995z" fill="#B08A3E"></path></>,
  crown: <><path d="M38 34l4-20 10 12 8-16 8 16 10-12 4 20z" fill="#D9B97A" stroke="#8C6A2C" strokeWidth="2" strokeLinejoin="round"></path><circle cx="60" cy="10" r="3" fill="#C42A3E"></circle></>,
  glasses: <><g fill="none" stroke="#2B1D16" strokeWidth="2.5"><circle cx="46" cy="70" r="11.5"></circle><circle cx="74" cy="70" r="11.5"></circle><path d="M57.5 70h5"></path></g></>,
  beret: <><path d="M26 34q20-22 58-10q6 6 0 12z" fill="#2B1D16"></path><path d="M58 18v-6" stroke="#2B1D16" strokeWidth="3" strokeLinecap="round"></path></>,
  headphones: <><path d="M18 62q0-44 42-44t42 44" stroke="#2B1D16" strokeWidth="5" fill="none"></path><rect x="10" y="56" width="12" height="20" rx="5" fill="#2B1D16"></rect><rect x="98" y="56" width="12" height="20" rx="5" fill="#2B1D16"></rect></>,
  sparkles: <><path d="M4 11q1.5 5.5 7 7q-5.5 1.5 -7 7q-1.5 -5.5 -7 -7q5.5 -1.5 7 -7z" fill="#B08A3E"></path><path d="M116 2.3999999999999995q1.2000000000000002 4.4 5.6000000000000005 5.6000000000000005q-4.4 1.2000000000000002 -5.6000000000000005 5.6000000000000005q-1.2000000000000002 -4.4 -5.6000000000000005 -5.6000000000000005q4.4 -1.2000000000000002 5.6000000000000005 -5.6000000000000005z" fill="#B08A3E"></path><path d="M112 99.1q1.0499999999999998 3.8499999999999996 4.8999999999999995 4.8999999999999995q-3.8499999999999996 1.0499999999999998 -4.8999999999999995 4.8999999999999995q-1.0499999999999998 -3.8499999999999996 -4.8999999999999995 -4.8999999999999995q3.8499999999999996 -1.0499999999999998 4.8999999999999995 -4.8999999999999995z" fill="#B08A3E"></path></>,
  flower: <><g><circle cx="94" cy="30" r="5" fill="#F4A3A8"></circle><circle cx="102" cy="26" r="5" fill="#F4A3A8"></circle><circle cx="104" cy="35" r="5" fill="#F4A3A8"></circle><circle cx="96" cy="40" r="5" fill="#F4A3A8"></circle><circle cx="90" cy="36" r="5" fill="#F4A3A8"></circle><circle cx="97" cy="33" r="3.6" fill="#F2C76B"></circle></g></>,
  sunglasses: <><g><path d="M34 64h24v6a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9zM62 64h24v6a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9z" fill="#2B1D16"></path><path d="M58 66h4M30 65h4M86 65h4" stroke="#2B1D16" strokeWidth="3" strokeLinecap="round"></path><path d="M38 67l6 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5"></path></g></>,
  clover: <><g fill="#2F6B4A"><circle cx="98" cy="26" r="5.5"></circle><circle cx="106" cy="31" r="5.5"></circle><circle cx="98" cy="35" r="5.5"></circle><path d="M101 34q4 8 0 14" stroke="#2F6B4A" strokeWidth="2.5" fill="none"></path></g></>,
  marigold: <><g><circle cx="97" cy="32" r="10" fill="#F6B13C"></circle><circle cx="97" cy="32" r="6.5" fill="#E8892A"></circle><circle cx="97" cy="32" r="3" fill="#C4581E"></circle></g></>,
};

const EFFECTS: Record<PipEffect, JSX.Element | null> = {
  zzz: <><g className="zz"><text x="98" y="22" fontFamily="Fraunces, Georgia, serif" fontSize="16" fontWeight="600" fill="#8C6A2C">z</text><text x="110" y="8" fontFamily="Fraunces, Georgia, serif" fontSize="12" fontWeight="600" fill="#8C6A2C">z</text></g></>,
  sweat: <><path className="sw" d="M90 52q4.5 6.5 0 10q-4.5-3.5 0-10z" fill="#9FC3D9"></path></>,
  question: <><text x="100" y="24" fontFamily="Fraunces, Georgia, serif" fontSize="26" fontWeight="600" fill="#8C6A2C">?</text></>,
};

interface Look { eyes?: PipEyes; mouth?: PipMouth; arms?: PipArms; outfits?: Outfit[]; effects?: PipEffect[]; steam?: boolean }
export const POSES: Record<PoseId, Look> = {
  "idle": {},
  "hello": {
    "arms": "wave"
  },
  "happy": {
    "eyes": "happy",
    "mouth": "open"
  },
  "brewing": {
    "eyes": "closed",
    "mouth": "small",
    "effects": [
      "zzz"
    ],
    "steam": true
  },
  "orderReady": {
    "eyes": "happy",
    "mouth": "open",
    "arms": "bell"
  },
  "reward": {
    "eyes": "happy",
    "mouth": "open",
    "arms": "up",
    "outfits": [
      "sparkles"
    ]
  },
  "thinking": {
    "eyes": "up",
    "mouth": "flat",
    "arms": "chin",
    "effects": [
      "question"
    ]
  },
  "oops": {
    "eyes": "wide",
    "mouth": "o",
    "effects": [
      "sweat"
    ]
  },
  "love": {
    "eyes": "heart",
    "mouth": "smile",
    "outfits": [
      "hearts"
    ]
  },
  "wink": {
    "eyes": "wink"
  },
  "thumbsUp": {
    "eyes": "wink",
    "arms": "thumb"
  },
  "hug": {
    "eyes": "happy",
    "arms": "hug",
    "outfits": [
      "hearts"
    ]
  },
  "stretch": {
    "eyes": "closed",
    "mouth": "o",
    "arms": "up"
  },
  "shiver": {
    "eyes": "closed",
    "mouth": "flat",
    "outfits": [
      "beanie"
    ]
  },
  "peek": {
    "mouth": "small"
  },
  "detective": {
    "mouth": "small",
    "arms": "glass"
  },
  "party": {
    "eyes": "happy",
    "mouth": "open",
    "arms": "up",
    "outfits": [
      "party"
    ]
  }
};

export interface PipProps extends Look {
  pose?: PoseId;
  /** Allowed sizes: [24, 40, 64, 96, 150, 200]. */
  size?: 24 | 40 | 64 | 96 | 150 | 200;
  /** 0 to 1: Pip as the points meter, filled with coffee to this level. */
  level?: number;
  animation?: PipAnimation;
  /** How many times a one-shot animation plays. Max 3. */
  plays?: 1 | 2 | 3;
  label?: string;
}

const BODY = 'M20 40h80v34a34 34 0 0 1-34 34h-12a34 34 0 0 1-34-34z';

export function Pip({ pose = 'idle', size = 96, level, animation, plays = 1, label, ...look }: PipProps) {
  const p = { ...POSES[pose], ...look };
  const clip = useId();
  const small = size < 40;
  const cls = ['pip', animation && `pip--${animation}`].filter(Boolean).join(' ');
  return (
    <svg width={size} height={size} viewBox="-10 -8 140 140" role="img" aria-label={label ?? `Pip, ${pose}`}
      className={cls} style={{ overflow: 'visible', ['--pip-plays' as string]: plays }}>
      <ellipse className="psh" cx="60" cy="125" rx="34" ry="4.5" fill="rgba(43,29,22,0.12)" />
      <g className="pw">
        {p.steam && <g className="puffs"><circle cx="48" cy="26" r="6" fill="#D9CBB9" /><circle cx="58" cy="20" r="8" fill="#E3D6C5" /><circle cx="70" cy="25" r="6.5" fill="#D9CBB9" /></g>}
        <ellipse cx="47" cy="114" rx="10" ry="5" fill="#3A261C" /><ellipse cx="73" cy="114" rx="10" ry="5" fill="#3A261C" />
        <path d="M100 54h5a14 14 0 0 1 0 28h-5" fill="none" stroke="#B08A3E" strokeWidth="8" strokeLinecap="round" />
        {level === undefined ? <path d={BODY} fill="#A3162B" /> : (
          <>
            <path d={BODY} fill="#F3E6D6" stroke="#A3162B" strokeWidth="3" />
            <clipPath id={clip}><path d={BODY} /></clipPath>
            <rect className="lv" x="16" y={108 - 68 * Math.min(1, Math.max(0, level))} width="90" height="80" fill="#A3162B" clipPath={`url(#${clip})`} />
          </>
        )}
        <path d="M29 52v24" stroke="#D84A5E" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        <ellipse cx="60" cy="40" rx="40" ry="10" fill="#C42A3E" />
        <ellipse cx="60" cy="40" rx="34" ry="7.2" fill="#EAD3B5" />
        <path d="M60 44.5s-6.5-2.6-6.5-5.2a3.2 1.9 0 0 1 6.5-.6 3.2 1.9 0 0 1 6.5.6c0 2.6-6.5 5.2-6.5 5.2z" fill="#B07A4A" />
        {!small && <><ellipse cx="33" cy="83" rx="7" ry="4.2" fill="#FF9AA2" opacity="0.6" /><ellipse cx="87" cy="83" rx="7" ry="4.2" fill="#FF9AA2" opacity="0.6" /></>}
        {EYES[p.eyes ?? 'open']}
        {MOUTHS[p.mouth ?? 'smile']}
        {ARMS[p.arms ?? 'default']}
        <g className="px">{(p.outfits ?? []).map((o) => <g key={o}>{OUTFITS[o]}</g>)}{(p.effects ?? []).map((e) => <g key={e}>{EFFECTS[e]}</g>)}</g>
      </g>
    </svg>
  );
}

export default Pip;
