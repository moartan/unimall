import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CpanelContext = createContext({});

export default function CpanelProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sidebar, setSidebar] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('cpanel_sidebar_open');
    return stored === null ? true : stored === '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('cpanel_sidebar_open', sidebar ? '1' : '0');
  }, [sidebar]);

  const handleSidebar = () => setSidebar((prev) => !prev);

  const value = useMemo(
    () => ({ user, setUser, sidebar, setSidebar, handleSidebar }),
    [user, sidebar],
  );
  return <CpanelContext.Provider value={value}>{children}</CpanelContext.Provider>;
}

export const useCpanel = () => useContext(CpanelContext);
export { CpanelContext };
