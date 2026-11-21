import { useEffect, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import {
  ChevronLeft, ChevronRight, Coffee, CupSoda, Leaf, Sparkles, Croissant, Donut, Egg, Sandwich, Soup, Salad, CakeSlice, Citrus, GlassWater, Check,
  type LucideIcon,
} from 'lucide-react';
import './ui.css';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'dark' | 'quiet' | 'cream' | 'outline-red'; block?: boolean };
export function Button({ variant = 'primary', block, className = '', ...rest }: BtnProps) {
  return <button className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`} {...rest} />;
}

export function Screen({ title, back, children, action }: { title?: string; back?: boolean | string; children: ReactNode; action?: ReactNode }) {
  const nav = useNavigate();
  return (
    <main className="screen">
      {back && <button className="back" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}><ChevronLeft size={20} /> Back</button>}
      {title && <div className="row"><h1 className="large-title">{title}</h1>{action}</div>}
      {children}
    </main>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return <div className="seg" role="group">{options.map((o) => <button key={o.value} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>)}</div>;
}

export function Chips<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return <div className="chips">{options.map((o) => <button key={o.value} className="chip" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>)}</div>;
}

const ART: Record<string, LucideIcon> = { cup: CupSoda, coffee: Coffee, leaf: Leaf, sparkles: Sparkles, croissant: Croissant, donut: Donut, egg: Egg, sandwich: Sandwich, soup: Soup, salad: Salad, cake: CakeSlice, citrus: Citrus, glass: GlassWater };
/** Product image: real photo when `image` is set, otherwise an illustrated placeholder. Round by default. */
export function ItemArt({ image, art = 'coffee', tint = '#F4F1EC', size = 72, height, radius, iconSize, alt = '' }: { image?: string; art?: string; tint?: string; size?: number | string; height?: number; radius?: number; iconSize?: number; alt?: string }) {
  const r = radius ?? (typeof size === 'number' ? size / 2 : 16);
  const style = { width: size, height: height ?? size, borderRadius: r, flexShrink: 0 } as const;
  if (image) return <img src={image} alt={alt} loading="lazy" style={{ ...style, objectFit: 'cover', background: tint }} />;
  const Icon = ART[art] ?? Coffee;
  const dark = tint === '#2B1D16';
  const px = iconSize ?? (typeof size === 'number' ? Math.round(size * 0.42) : 40);
  return <div className="art" role="img" aria-label={alt} style={{ ...style, background: tint, color: dark ? 'var(--lamp)' : undefined }}><Icon size={px} strokeWidth={1.5} /></div>;
}

const TAG_LABEL: Record<string, string> = { vg: 'Vegan', v: 'Veg', gf: 'GF', new: 'New', popular: 'Popular', 'app-only': 'App only' };
export const Tag = ({ t }: { t: string }) => <span className={`tag tag-${t}`}>{TAG_LABEL[t] ?? t}</span>;

export function ListRow({ icon: Icon, title, subtitle, right, onClick }: { icon?: LucideIcon; title: ReactNode; subtitle?: ReactNode; right?: ReactNode; onClick?: () => void }) {
  return (
    <button className="list-row" onClick={onClick} disabled={!onClick && undefined}>
      {Icon && <span className="icon-tile"><Icon size={19} /></span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500 }}>{title}</div>
        {subtitle && <div className="muted">{subtitle}</div>}
      </span>
      {right ?? (onClick && <ChevronRight size={18} color="var(--text-3)" />)}
    </button>
  );
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />{children}
      </div>
    </div>
  );
}

export function Progress({ value, light }: { value: number; light?: boolean }) {
  return <div className={`progress ${light ? 'light' : ''}`}><div style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} /></div>;
}

/* ---------- toast notifications ---------- */
const useToastStore = create<{ msg: string | null; show: (m: string) => void }>((set) => ({
  msg: null,
  show: (msg) => { set({ msg }); setTimeout(() => set({ msg: null }), 2200); },
}));
export const toast = (m: string) => useToastStore.getState().show(m);
export function ToastHost() {
  const msg = useToastStore((s) => s.msg);
  return msg ? <div className="toast" role="status"><Check size={16} color="var(--lamp)" />{msg}</div> : null;
}
