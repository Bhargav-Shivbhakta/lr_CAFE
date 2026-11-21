import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Heart, Minus, Plus, Search } from 'lucide-react';
import { useMenu } from '@/core/hooks';
import { money, pointsFor, useApp } from '@/core/store/app';
import { categoryArt } from '@/data/menu';
import type { Menu, MenuItem } from '@/core/services/types';
import { Button, ItemArt, Screen, Tag, toast } from '@/core/ui';

const SECTIONS = [
  { id: 'Coffee & drinks', label: 'Drinks' }, { id: 'Food', label: 'Food' }, { id: 'Sweets', label: 'Sweets' }] as const;

function ItemRow({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button className="cat-row" onClick={onClick} style={{ opacity: item.soldOut ? 0.5 : 1 }}>
      <ItemArt image={item.image} art={item.art} tint={item.tint} size={64} alt={item.name} />
      <span style={{ flex: 1 }}>
        <div>{item.name}</div>
        <div className="muted">{item.soldOut ? 'Sold out today' : money(item.price)}</div>
      </span>
    </button>
  );
}

/** /order — the menu home: search, tabs and category list. */
export function MenuHome() {
  const menu = useMenu();
  const nav = useNavigate();
  const [tab, setTab] = useState<'menu' | 'favorites' | 'previous'>('menu');
  const [q, setQ] = useState('');
  const favorites = useApp((s) => s.favorites);
  const orders = useApp((s) => s.orders);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return !menu || !t ? [] : menu.items.filter((i) => `${i.name} ${i.description}`.toLowerCase().includes(t));
  }, [menu, q]);

  if (!menu) return <Screen title="Menu"><p className="muted">Warming up the menu…</p></Screen>;
  const previous = [...new Map(orders.flatMap((o) => o.lines).map((l) => [l.itemId, l])).values()]
    .map((l) => menu.items.find((i) => i.id === l.itemId)).filter(Boolean) as MenuItem[];
  const favs = menu.items.filter((i) => favorites.includes(i.id));

  return (
    <Screen title="Menu">
      <div className="tabs-underline">
        {(['menu', 'favorites', 'previous'] as const).map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t === 'menu' ? 'Menu' : t === 'favorites' ? 'Favorites' : 'Previous'}</button>
        ))}
      </div>

      {tab === 'menu' && <>
        <label className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 4px', borderRadius: 999 }}>
          <Search size={17} color="var(--text-3)" />
          <input aria-label="Search the menu" placeholder="Search the menu" value={q} onChange={(e) => setQ(e.target.value)} style={{ border: 0, outline: 0, background: 'none', flex: 1 }} />
        </label>
        {q ? (
          <div>{results.map((i) => <ItemRow key={i.id} item={i} onClick={() => nav(`/order/item/${i.id}`)} />)}
            {results.length === 0 && <p className="muted">Nothing matches “{q}”. Try “latte”, “bagel” or “burger”.</p>}</div>
        ) : SECTIONS.map((s) => (
          <section key={s.id}>
            <h2 className="section-title">{s.label}</h2>
            {menu.categories.filter((c) => c.section === s.id).map((c) => (
              <button key={c.id} className="cat-row" onClick={() => nav(`/order/c/${c.id}`)}>
                <ItemArt art={categoryArt[c.id]?.art} tint={categoryArt[c.id]?.tint} size={64} alt="" />
                <span style={{ flex: 1 }}>{c.name}</span>
                <span className="faint">{menu.items.filter((i) => i.categoryId === c.id).length}</span>
              </button>
            ))}
          </section>
        ))}
      </>}

      {tab === 'favorites' && (favs.length ? favs.map((i) => <ItemRow key={i.id} item={i} onClick={() => nav(`/order/item/${i.id}`)} />)
        : <p className="muted" style={{ marginTop: 20 }}>Tap the heart on any item to save it here.</p>)}
      {tab === 'previous' && (previous.length ? previous.map((i) => <ItemRow key={i.id} item={i} onClick={() => nav(`/order/item/${i.id}`)} />)
        : <p className="muted" style={{ marginTop: 20 }}>Your past orders show up here for quick reordering.</p>)}
    </Screen>
  );
}

/** /order/c/:catId — items in a category as a 2-column grid of round images. */
export function CategoryScreen() {
  const { catId } = useParams();
  const menu = useMenu();
  const nav = useNavigate();
  const cat = menu?.categories.find((c) => c.id === catId);
  if (!menu || !cat) return <Screen back="/order"><p className="muted">Loading…</p></Screen>;
  const items = menu.items.filter((i) => i.categoryId === cat.id);
  return (
    <Screen title={cat.name} back="/order">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 14px' }}>
        {items.map((i) => (
          <button key={i.id} onClick={() => nav(`/order/item/${i.id}`)} style={{ textAlign: 'center', opacity: i.soldOut ? 0.5 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><ItemArt image={i.image} art={i.art} tint={i.tint} size={128} alt={i.name} /></div>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 10, lineHeight: 1.25 }}>{i.name}</div>
            <div className="muted" style={{ marginTop: 2 }}>{i.soldOut ? 'Sold out' : money(i.price)}</div>
            {i.tags?.includes('app-only') && <div style={{ marginTop: 4 }}><Tag t="app-only" /></div>}
          </button>
        ))}
      </div>
    </Screen>
  );
}

/** /order/item/:id — full item page with options and a sticky add button. */
export function ItemScreen() {
  const { id } = useParams();
  const menu = useMenu();
  const item = menu?.items.find((i) => i.id === id);
  if (!menu || !item) return <Screen back="/order"><p className="muted">Loading…</p></Screen>;
  return <ItemBody key={item.id} item={item} menu={menu} />;
}

function ItemBody({ item, menu }: { item: MenuItem; menu: Menu }) {
  const nav = useNavigate();
  const groups = (item.modifierGroups ?? []).map((gid) => menu.modifierGroups.find((g) => g.id === gid)!).filter(Boolean);
  const [sel, setSel] = useState<Record<string, string[]>>(() => Object.fromEntries(groups.map((g) => [g.id, g.required ? [g.options[0].id] : []])));
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const addToCart = useApp((s) => s.addToCart);
  const fav = useApp((s) => s.favorites.includes(item.id));
  const toggleFavorite = useApp((s) => s.toggleFavorite);

  const unit = item.price + groups.reduce((n, g) => n + g.options.filter((o) => sel[g.id]?.includes(o.id)).reduce((a, o) => a + o.price, 0), 0);
  const label = groups.flatMap((g) => g.options.filter((o) => sel[g.id]?.includes(o.id)).map((o) => o.name)).join(' · ');
  const pick = (gid: string, oid: string, max: number) => setSel((s) => {
    const cur = s[gid] ?? [];
    if (max === 1) return { ...s, [gid]: cur.includes(oid) && !groups.find((g) => g.id === gid)?.required ? [] : [oid] };
    return { ...s, [gid]: cur.includes(oid) ? cur.filter((x) => x !== oid) : cur.length < max ? [...cur, oid] : cur };
  });

  return (
    <main style={{ paddingBottom: 120, animation: 'fadeUp .3s' }}>
      <div style={{ background: item.tint === '#2B1D16' ? 'var(--walnut)' : 'var(--warm)', padding: '14px 16px 28px', position: 'relative' }}>
        <div className="row">
          <button aria-label="Back" onClick={() => nav(-1)} style={{ width: 38, height: 38, borderRadius: 19, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}><ChevronLeft size={22} /></button>
          <button aria-label={fav ? 'Remove favorite' : 'Save as favorite'} onClick={() => { toggleFavorite(item.id); toast(fav ? 'Removed from favorites' : 'Saved to favorites'); }} style={{ width: 38, height: 38, borderRadius: 19, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
            <Heart size={20} color="var(--velvet)" fill={fav ? 'var(--velvet)' : 'none'} /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}><ItemArt image={item.image} art={item.art} tint={item.tint === '#2B1D16' ? '#3A2A21' : item.tint} size={210} alt={item.name} /></div>
      </div>
      <div style={{ padding: '18px 16px' }}>
        <h1 className="display" style={{ fontSize: 26, margin: 0 }}>{item.name}</h1>
        <div className="muted" style={{ marginTop: 4 }}>{money(item.price)} · earns {pointsFor(item.price)} points</div>
        {!!item.tags?.length && <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>{item.tags.map((t) => <Tag key={t} t={t} />)}</div>}
        <p style={{ lineHeight: 1.55, color: 'var(--text-2)', marginTop: 12 }}>{item.description}</p>

        {groups.map((g) => (
          <section key={g.id} style={{ borderTop: '1px solid var(--hairline)', paddingTop: 14, marginTop: 14 }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 700 }}>{g.name}</span>
              <span className="faint">{g.required ? 'Required' : g.max > 1 ? `Choose up to ${g.max}` : 'Optional'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.options.map((o) => <button key={o.id} className="chip" aria-pressed={!!sel[g.id]?.includes(o.id)} onClick={() => pick(g.id, o.id, g.max)}>{o.name}{o.price ? ` +${money(o.price)}` : ''}</button>)}
            </div>
          </section>
        ))}
        <section style={{ borderTop: '1px solid var(--hairline)', paddingTop: 14, marginTop: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Special instructions</div>
          <input className="input" placeholder="Light ice, cut in half…" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} />
        </section>
      </div>

      <div className="sticky-cta row">
        <div className="qty">
          <button aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
          <span style={{ fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{qty}</span>
          <button aria-label="More" onClick={() => setQty((q) => Math.min(20, q + 1))}><Plus size={16} /></button>
        </div>
        <Button style={{ flex: 1 }} disabled={item.soldOut} onClick={() => {
          addToCart({ itemId: item.id, name: item.name, unitPrice: unit, qty, options: Object.entries(sel).map(([groupId, optionIds]) => ({ groupId, optionIds })), optionLabel: label, note: note.trim() || undefined });
          toast(`Added to your order`); nav(-1);
        }}>{item.soldOut ? 'Sold out today' : `Add to order · ${money(unit * qty)}`}</Button>
      </div>
    </main>
  );
}
