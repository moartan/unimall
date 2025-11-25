import { createContext, useContext, useMemo, useState } from 'react';

const CpanelContext = createContext({});

export default function CpanelProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <CpanelContext.Provider value={value}>{children}</CpanelContext.Provider>;
}

export const useCpanel = () => useContext(CpanelContext);
