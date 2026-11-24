import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { useCurrentLocation } from '@/core/hooks';
import { cartCount, useApp } from '@/core/store/app';
import { LocationSheet } from '@/core/components/LocationSheet';

/** Dark bar above the tabs: which café you're ordering from + your bag. Always one tap to checkout. */
export function StoreBar() {
  const n = useApp((s) => cartCount(s.cart));
  const loc = useCurrentLocation();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const [picker, setPicker] = useState(false);
  const show = pathname === '/' || pathname === '/order' || pathname.startsWith('/order/c/');
  if (!show) return null;
  return (
    <>
      <div className="row" style={{ background: 'var(--walnut)', color: 'var(--on-dark)', borderRadius: 14, padding: '10px 10px 10px 16px', boxShadow: 'var(--shadow-lift)' }}>
        <button onClick={() => setPicker(true)} style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Pickup store</div>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>{loc?.name ?? 'Choose a store'} <ChevronDown size={16} /></div>
        </button>
        <button aria-label={`Your order, ${n} items`} onClick={() => nav('/bag')} style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={24} />
          {n > 0 && <span style={{ position: 'absolute', top: 4, right: 2, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--velvet)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{n}</span>}
        </button>
      </div>
      <LocationSheet open={picker} onClose={() => setPicker(false)} />
    </>
  );
}
