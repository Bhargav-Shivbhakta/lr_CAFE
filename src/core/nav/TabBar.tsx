import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { getTabs } from '../registry';
import './nav.css';

/** Built from the registry: adding a feature with placement 'tab' adds a tab. Over 5 → "More". */
export function TabBar() {
  const { tabs, overflow } = getTabs();
  const { pathname } = useLocation();
  // Focused flows (item page, sign-up) hide the tab bar, like native apps do.
  if (pathname.startsWith('/order/item/') || pathname.startsWith('/join')) return null;
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map(({ id, title, icon: Icon, Badge }) => (
        <NavLink key={id} to={id === 'home' ? '/' : `/${id}`} end={id === 'home'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon size={23} strokeWidth={1.8} />
          <span>{title}</span>
          {Badge && <Badge />}
        </NavLink>
      ))}
      {overflow.length > 0 && (
        <NavLink to="/more" className={({ isActive }) => (isActive ? 'active' : '')}><LayoutGrid size={23} strokeWidth={1.8} /><span>More</span></NavLink>
      )}
    </nav>
  );
}
