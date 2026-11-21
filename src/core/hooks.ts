import { useEffect, useState } from 'react';
import { menuService } from './services';
import type { Location, Menu } from './services/types';
import { useApp } from './store/app';

// Tiny data-fetching hooks. Swap for TanStack Query when real APIs arrive — call sites stay the same.
let locCache: Location[] | null = null;
let menuCache: Record<string, Menu> = {};

export function useLocations() {
  const [data, setData] = useState<Location[] | null>(locCache);
  useEffect(() => { if (!locCache) menuService.getLocations().then((l) => { locCache = l; setData(l); }); }, []);
  return data;
}

export function useCurrentLocation() {
  const id = useApp((s) => s.locationId);
  return useLocations()?.find((l) => l.id === id) ?? null;
}

export function useMenu() {
  const id = useApp((s) => s.locationId);
  const [data, setData] = useState<Menu | null>(menuCache[id] ?? null);
  useEffect(() => { if (!menuCache[id]) menuService.getMenu(id).then((m) => { menuCache[id] = m; setData(m); }); else setData(menuCache[id]); }, [id]);
  return data;
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(t); }, [intervalMs]);
  return now;
}
