import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SidebarContext = createContext({});
const STORAGE_KEY = 'cpanel_sidebar_open';

export default function CpanelUiProvider({ children }) {
  const [sidebar, setSidebar] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === '1';
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, sidebar ? '1' : '0');
  }, [sidebar]);

  const handleSidebar = () => setSidebar((prev) => !prev);

  const value = useMemo(() => ({ sidebar, setSidebar, handleSidebar }), [sidebar]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const useCpanelUi = () => useContext(SidebarContext);
