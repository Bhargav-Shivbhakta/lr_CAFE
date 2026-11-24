import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Star } from 'lucide-react';
import { useNotifications } from './index';

const ICON = { order: Coffee, rewards: Star, cafe: Bell } as const;

/** iOS-style banner that slides in from the top for every new notification. Tap to open, auto-hides after 4.5 s. */
export function NotificationBanner() {
  const n = useNotifications((s) => s.banner);
  const dismiss = useNotifications((s) => s.dismissBanner);
  const markRead = useNotifications((s) => s.markRead);
  const nav = useNavigate();
  if (!n) return null;
  const Icon = ICON[n.kind];
  return (
    <button className="notif-banner" role="status" aria-live="polite"
      onClick={() => { markRead(n.id); dismiss(); if (n.link) nav(n.link); }}>
      <span className="notif-icon"><Icon size={18} /></span>
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span className="row" style={{ gap: 8 }}><b className="notif-title">{n.title}</b><span className="faint">now</span></span>
        <span className="notif-body">{n.body}</span>
      </span>
    </button>
  );
}
