import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Tab = 'home' | 'reports' | 'projects' | 'settings';
export type Overlay = 'timer' | 'complete' | null;

type NavContextValue = {
  tab: Tab;
  setTab: (t: Tab) => void;
  overlay: Overlay;
  openTimer: () => void;
  openComplete: () => void;
  closeOverlay: () => void;
};

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);

  const openTimer = useCallback(() => setOverlay('timer'), []);
  const openComplete = useCallback(() => setOverlay('complete'), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  const value = useMemo<NavContextValue>(
    () => ({ tab, setTab, overlay, openTimer, openComplete, closeOverlay }),
    [tab, overlay, openTimer, openComplete, closeOverlay],
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
